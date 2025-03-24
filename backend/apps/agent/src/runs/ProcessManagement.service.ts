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
import { ServerInstance } from '@infra/infrastructure/servers.service';

export class ServerRecord {
  time: string;
  startTime: string;
  maxProcesses: number;
  activeProcesses: number;
  name: string;
  runningRunIds: string[];
}

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
    this.maxProcesses = parseInt(process.env.MAX_PROCESSES ?? '4');
    ServerInstance.instance.properties['maxProcesses'] = this.maxProcesses;
    ServerInstance.instance.properties['activeProcesses'] = 0;
  }

  @RabbitRPC({
    exchange: 'servers:allocateProcess',
    routingKey: 'allocateProcess:' + ServerInstance.instance.serverId,
    queue: 'allocateProcess:' + ServerInstance.instance.serverId,
    queueOptions: {
      durable: false,
      autoDelete: true,
    },
  })
  async allocateProcess(data: any): Promise<ProcessRecord | null> {
    if (Object.keys(this.processes).length >= this.maxProcesses) {
      return null;
    }

    this.logger.log('Allocating process for ' + data.run.id);
    const testDefinitions = await this.testsService.getTest(data.run.testId);
    const proc: ProcessRecord = {
      processId: generateId(),
      runId: data.run.id,
      serverId: ServerInstance.instance.serverId,
    };
    this.processes[proc.processId] = proc;
    const env = await this.envService.getFreeEnvironment(
      ServerInstance.instance.serverId,
      data.run.id,
      testDefinitions.language,
      testDefinitions.modules,
    );
    proc.environmentId = env.id;
    return proc;
  }

  @RabbitRPC({
    exchange: 'run',
    routingKey: 'startApplication:' + ServerInstance.instance.serverId,
    queue: 'startApplication:' + ServerInstance.instance.serverId,
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

    this.factory.removeRunnerSvc(proc.environmentId);
    await this.envService.setEnvironmentFree(proc.environmentId);
    return true;
  }
}
