import * as os from 'os';
import { Injectable, Logger } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import {
  generateId,
  TestEnvironmentService,
  PublishBus,
} from '@infra/infrastructure';
import { RunsService } from '@infra/infrastructure/mysql/runs.service';
import { TestsService } from 'apps/application/src/app/tests/tests.service';
import { TemplateRunnerSvcFactory } from '../template-runner/TemplateRunnerFactory';
import { thisServer } from '@infra/infrastructure/mysql/servers.service';

export class ProcessRecord {
  processId: string;
  runId: string;
  serverId: string;
  environmentId?: string;
  runner?: Promise<void>;
}

@Injectable()
export class ProcessManagementService {
  processes: Record<string, ProcessRecord> = {};
  interval: NodeJS.Timeout;
  maxProcesses: number;
  startTime: Date = new Date();

  constructor(
    private readonly envService: TestEnvironmentService,
    private readonly testsService: TestsService,
    private readonly runsService: RunsService,
    private readonly publish: PublishBus,
    private readonly factory: TemplateRunnerSvcFactory,
    private readonly logger: Logger,
  ) {
    this.maxProcesses = parseInt(
      process.env.MAX_PROCESSES ?? os.cpus().length.toString(),
    );
    thisServer.maxProcesses = this.maxProcesses;
    thisServer.allocatedProcesses = 0;
  }

  @RabbitRPC({
    exchange: 'servers:allocateProcess',
    routingKey: 'allocateProcess:' + thisServer.id,
    queue: 'allocateProcess:' + thisServer.id,
    queueOptions: {
      durable: false,
      autoDelete: true,
    },
  })
  async allocateProcess(data: any): Promise<ProcessRecord | null> {
    if (Object.keys(this.processes).length >= this.maxProcesses) {
      return null;
    }
    thisServer.allocatedProcesses++;

    this.logger.log('Allocating process for ' + data.run.id);
    const testDefinitions = await this.testsService.getTest(data.run.testId);
    const proc: ProcessRecord = {
      processId: generateId(),
      runId: data.run.id,
      serverId: thisServer.id,
    };
    this.processes[proc.processId] = proc;
    const env = await this.envService.getFreeEnvironment(
      thisServer.id,
      data.run.id,
      testDefinitions.language,
      testDefinitions.modules,
    );
    proc.environmentId = env.id;
    return proc;
  }

  @RabbitRPC({
    exchange: 'servers:freeProcess',
    routingKey: 'freeProcess:' + thisServer.id,
    queue: 'freeProcess:' + thisServer.id,
    queueOptions: {
      durable: false,
      autoDelete: true,
    },
  })
  async freeProcess(data: any): Promise<boolean> {
    this.logger.log('Freeing process ' + data.processId);
    const proc = this.processes[data.processId];
    if (proc) {
      delete this.processes[data.processId];
      thisServer.allocatedProcesses--;
      return true;
    }
    return false;
  }

  @RabbitRPC({
    exchange: 'run',
    routingKey: 'startApplication:' + thisServer.id,
    queue: 'startApplication:' + thisServer.id,
    queueOptions: {
      durable: false,
      autoDelete: true,
    },
  })
  public async start(data: {
    payload: {
      processId: string;
      testId: string;
      runId: string;
      source: string;
    };
  }): Promise<boolean> {
    const r = data.payload;
    const proc = this.processes[r.processId];
    const run = await this.runsService.getRun(proc.runId);
    this.logger.log('Initializing directory.');
    const env = await this.envService.getEnvironmentById(proc.environmentId);
    const test = await this.testsService.getTest(r.testId);
    const templateRunner = await this.factory.getRunnerSvc(
      proc.processId,
      run.testId,
      env.runId,
      env.id,
      test.language,
    );

    const init = await templateRunner.initDirectory();
    if (!init) {
      this.logger.error('Failed to initialize directory.');
      this.factory.removeRunnerSvc(proc.environmentId);
      await this.envService.setEnvironmentFree(proc.environmentId);
      return false;
    }

    const packageInstaller = await templateRunner.packagesInstall(test.modules);
    if (!packageInstaller) {
      this.logger.error('Failed to install packages.');
      this.factory.removeRunnerSvc(proc.environmentId);
      await this.envService.setEnvironmentFree(proc.environmentId);
      return false;
    }

    const compile = await templateRunner.compileTemplate(r.source);
    if (!compile) {
      this.logger.error('Failed to compile source.');
      this.factory.removeRunnerSvc(proc.environmentId);
      await this.envService.setEnvironmentFree(proc.environmentId);
      return false;
    }

    const runner = templateRunner.startRunner().catch((e) => {
      this.logger.error('Failed to start runner.');
      this.logger.error(e);
    });
    if (!runner) {
      this.logger.error('Failed to start runner.');
      this.factory.removeRunnerSvc(proc.environmentId);
      await this.envService.setEnvironmentFree(proc.environmentId);
      return false;
    }
    this.processes[r.processId].runner = runner;

    runner.finally(async () => {
      this.factory.removeRunnerSvc(proc.environmentId);
      await this.envService.setEnvironmentFree(proc.environmentId);
      this.logger.log('Process ended!!!!!');
      thisServer.allocatedProcesses--;
    });
    return true;
  }
}
