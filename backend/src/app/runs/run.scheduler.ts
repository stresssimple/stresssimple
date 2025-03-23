import { Injectable, Logger } from '@nestjs/common';
import { TestsService } from '../tests/tests.service';
import { RunnersManager } from './runners.manager';
import { RunsService } from './api/runs.service';
import {
  ProcessRecord,
  ServerRecord,
} from './process/ProcessManagement.service';
import { TestDefinitions } from '../dto/TestDefinitions';
import { PublishBus } from '../rabbitmq/publish';
import { ServersObserver } from './process/ServersObserver';
import { TestExecution } from '../mysql/Entities/TestExecution';

@Injectable()
export class RunScheduler {
  constructor(
    private testService: TestsService,
    private runsService: RunsService,
    private runsManager: RunnersManager,
    private publish: PublishBus,
    private logger: Logger,
    private observer: ServersObserver,
  ) {}

  async executeRun(runId: string) {
    const run = await this.runsService.getRun(runId);
    const testDefinitions = await this.testService.getTest(run.testId);
    if (!testDefinitions) {
      await this.runsService.updateRun(run.id, 'failed', true);
      return;
    }

    const processes = await this.requireProcesses(run);
    this.logger.log('Processes allocated successful: ' + processes.length);
    await this.runTest(testDefinitions, run, processes);
  }

  private async requireProcesses(run: TestExecution): Promise<ProcessRecord[]> {
    const processes: ProcessRecord[] = [];

    let servers: ServerRecord[] = await this.observer.listServers();

    while (processes.length < run.processes && run.status === 'created') {
      run = await this.runsService.getRun(run.id);
      if (run.status !== 'created') {
        this.logger.log(
          'Run status changed, stopping process allocation ' + run.status,
        );
        break;
      }

      servers = await this.observer.listServers();
      servers = servers.filter((s) => s.activeProcesses < s.maxProcesses);
      if (servers.length === 0) {
        this.logger.log('No servers available, waiting...');
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      while (servers.length > 0 && processes.length < run.processes) {
        const server = servers.shift();
        try {
          const process = (await this.publish.executeCommand({
            route: 'servers:allocateProcess',
            routingKey: server.name,
            run: run,
          })) as ProcessRecord;
          if (!process) continue;
          processes.push(process);
        } catch (e) {
          this.logger.warn('Failed to allocate process: ' + e.message);
        }
      }
    }
    return processes;
  }

  private async runTest(
    testDefinitions: TestDefinitions,
    run,
    processes: ProcessRecord[],
  ) {
    const startApplicationTasks = processes.map(async (p) => {
      this.logger.log('Starting application on server ' + p.serverId);
      const result = await this.publish.executeCommand({
        route: 'run',
        routingKey: 'startApplication:' + p.serverId,
        payload: {
          processId: p.processId,
          testId: run.testId,
          runId: run.id,
          source: testDefinitions.source,
        },
      });
      return result as boolean;
    });

    const compileResults = await Promise.all(startApplicationTasks);
    if (!compileResults.every((r) => r)) {
      await this.runsService.updateRun(run.id, 'failed', true);
      return;
    }

    await this.runsManager.waitForRunner(run.id);
  }

  private async f1() {
    // const env = await this.envService.getFreeEnvironment(
    //   testDefinitions.language,
    //   testDefinitions.modules,
    // );
    // const templateRunner = await this.factory.getRunnerSvc(
    //   testId,
    //   run.id,
    //   env.id,
    //   testDefinitions.language,
    // );
    // const dirCreated = await templateRunner.initDirectory();
    // if (dirCreated) {
    //   const deps = await templateRunner.packagesInstall(
    //     testDefinitions.modules,
    //   );
    //   if (!deps) {
    //     await this.runsService.updateRun(run.id, 'failed', true);
    //     return;
    //   }
    // }
    // const cmpl = await templateRunner.compileTemplate(testDefinitions.source);
    // if (!cmpl) {
    //   await this.runsService.updateRun(run.id, 'failed', true);
    //   return;
    // }
    // const runner = templateRunner.startRunner();
    // await this.runsManager.waitForRunner(run.id);
    // await this.runsService.updateRun(run.id, 'running');
    // const userRampUpDelay = Math.floor((rampUp * 60 * 1000) / users);
    // const testStart = new Date();
    // let userIndex = 0;
    // run = await this.runsService.getRun(run.id);
    // // Ramp up users
    // while (userIndex < users && run.status === 'running') {
    //   console.log('Starting user', userIndex + 1);
    //   await this.redis.publish(
    //     'runner:' + run.id,
    //     JSON.stringify({ type: 'startUser', userId: userIndex + 1 }),
    //   );
    //   await new Promise((resolve) => setTimeout(resolve, userRampUpDelay));
    //   userIndex++;
    //   run = await this.runsService.getRun(run.id);
    //   await this.runsService.updateRun(run.id, run.status);
    // }
    // // Wait for the test to finish
    // while (
    //   new Date().getTime() - testStart.getTime() <
    //     durationMinutes * 60 * 1000 &&
    //   run.status === 'running'
    // ) {
    //   await new Promise((resolve) => setTimeout(resolve, 1000));
    //   run = await this.runsService.getRun(run.id);
    //   await this.runsService.updateRun(run.id, run.status);
    // }
    // await this.redis.publish(
    //   'runner:' + run.id,
    //   JSON.stringify({ type: 'stopAllUsers' }),
    // );
    // await runner;
    // await this.runsService.updateRun(run.id, 'completed', true);
    // await this.factory.removeRunnerSvc(env.id);
    // await this.envService.setEnvironmentFree(env.id);
  }
}
