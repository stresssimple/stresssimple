import * as os from 'os';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { PublishBus } from 'src/app/rabbitmq/publish';
import { generateId } from 'src/app/utils/id';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { TestEnvironmentService } from 'src/app/mysql/TestEnvironment.service';
import { TestsService } from 'src/app/tests/tests.service';
import { TemplateRunnerSvcFactory } from 'src/app/template-runner/TemplateRunnerFactory';
import { RunsService } from '../api/runs.service';
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

export const serverKeyInstance = 'server:' + os.hostname() + ':' + generateId();

@Injectable()
export class ProcessManagementService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
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
  }

  @RabbitRPC({
    exchange: 'servers:allocateProcess',
    routingKey: serverKeyInstance,
    queue: 'allocateProcess:' + serverKeyInstance,
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
      serverId: serverKeyInstance,
    };
    this.processes[proc.processId] = proc;
    const env = await this.envService.getFreeEnvironment(
      serverKeyInstance,
      data.run.id,
      testDefinitions.language,
      testDefinitions.modules,
    );
    proc.environmentId = env.id;
    return proc;
  }

  @RabbitRPC({
    exchange: 'run',
    routingKey: 'startApplication:' + serverKeyInstance,
    queue: 'startApplication:' + serverKeyInstance,
    queueOptions: {
      durable: false,
      autoDelete: true,
    },
  })
  public async initDirectory(data: {
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
      run.testId,
      env.runId,
      env.id,
      test.language,
    );

    const init = await templateRunner.initDirectory();
    if (!init) {
      this.logger.error('Failed to initialize directory.');
      return false;
    }

    const packageInstaller = await templateRunner.packagesInstall(test.modules);
    if (!packageInstaller) {
      this.logger.error('Failed to install packages.');
      return false;
    }

    const compile = await templateRunner.compileTemplate(r.source);
    if (!compile) {
      this.logger.error('Failed to compile source.');
      return false;
    }

    const runner = templateRunner.startRunner();
    if (!runner) {
      this.logger.error('Failed to start runner.');
      return false;
    }
    this.processes[r.processId].runner = runner;
    return true;
  }

  @RabbitRPC({
    exchange: 'run',
    routingKey: 'compileDirectory:' + serverKeyInstance,
    queue: 'compileDirectory:' + serverKeyInstance,
    queueOptions: {
      durable: false,
      autoDelete: true,
    },
  })
  public async compileDirectory(data: {
    payload: { processId: string; testId: string };
  }): Promise<boolean> {
    const r = data.payload;
    const proc = this.processes[r.processId];
    const run = await this.runsService.getRun(proc.runId);
    this.logger.log('Compiling directory.');
    const env = await this.envService.getEnvironmentById(proc.environmentId);
    const test = await this.testsService.getTest(r.testId);
    const templateRunner = await this.factory.getRunnerSvc(
      run.testId,
      env.runId,
      env.id,
      test.language,
    );

    return await templateRunner.compileTemplate(test.source);
  }

  async onApplicationShutdown(signal?: string) {
    console.log('Shutting down ' + serverKeyInstance + '...' + signal);
    await this.publish.publishAsync({
      route: 'servers',
      routingKey: 'shutdown',
      key: serverKeyInstance,
    });
  }

  onApplicationBootstrap() {
    this.interval = setInterval(async () => {
      const serverInfo: ServerRecord = {
        time: new Date().toISOString(),
        startTime: this.startTime.toISOString(),
        maxProcesses: this.maxProcesses,
        activeProcesses: Object.keys(this.processes).length,
        name: serverKeyInstance,
        runningRunIds: [],
      };

      await this.publish.publishAsync({
        route: 'servers',
        routingKey: 'keepAlive',
        ...serverInfo,
      });
    }, 250);
  }
}
