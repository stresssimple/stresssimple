import { Injectable, Logger } from '@nestjs/common';
import { RunnersManager } from './runners.manager';
import { ProcessRecord } from './ProcessManagement.service';
import { PublishBus, TestExecution } from '@infra/infrastructure';
import { TestDefinitions } from 'apps/application/src/app/dto/TestDefinitions';
import { TestsService } from 'apps/application/src/app/tests/tests.service';
import { RunsService } from '@infra/infrastructure/mysql/runs.service';
import {
  ServerInstance,
  ServersService,
} from '@infra/infrastructure/servers.service';

@Injectable()
export class RunScheduler {
  constructor(
    private testService: TestsService,
    private runsService: RunsService,
    private runsManager: RunnersManager,
    private publish: PublishBus,
    private logger: Logger,
    private serversService: ServersService,
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

    let servers: ServerInstance[] = await this.serversService.getServers();

    while (processes.length < run.processes && run.status === 'created') {
      run = await this.runsService.getRun(run.id);
      if (run.status !== 'created') {
        this.logger.log(
          'Run status changed, stopping process allocation ' + run.status,
        );
        break;
      }

      servers = await this.serversService.getServers();
      servers = servers.filter(
        (s) => s.properties.activeProcesses < s.properties.maxProcesses,
      );
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
            routingKey: 'allocateProcess:' + server.serverId,
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
    run: TestExecution,
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
    this.logger.log('Waiting for applications to start');
    await this.runsManager.waitForRunners(processes.map((p) => p.processId));
    this.logger.log('All applications started');
    await this.runsService.updateRun(run.id, 'running');

    const userRampUpDelay = Math.floor(
      (run.rampUpMinutes * 60 * 1000) / run.numberOfUsers,
    );
    const testStart = new Date();
    let userIndex = 0;
    run = await this.runsService.getRun(run.id);
    // Ramp up users
    while (userIndex < run.numberOfUsers && run.status === 'running') {
      await this.publish.publishAsync({
        route: 'run',
        routingKey: 'runCommand:' + run.id,
        type: 'startUser',
        userId: userIndex + 1,
      });
      await new Promise((resolve) => setTimeout(resolve, userRampUpDelay));
      userIndex++;
      run = await this.runsService.getRun(run.id);
      await this.runsService.updateRun(run.id, run.status);
    }

    // Wait for the test to finish
    while (
      new Date().getTime() - testStart.getTime() <
        run.durationMinutes * 60 * 1000 &&
      run.status === 'running'
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await this.runsService.getRun(run.id);
      await this.runsService.updateRun(run.id, run.status);
    }
    processes.forEach(async (p) => {
      this.logger.log('Stopping all users on process ' + p.processId);
      await this.publish.publishAsync({
        route: 'process',
        routingKey: 'runCommand:' + p.processId,
        type: 'stopAllUsers',
      });
    });

    this.logger.log('Waiting for all users to stop');
    await this.runsManager.waitForFinishedRunners(processes);
    this.logger.log('All users stopped');
    await this.runsService.updateRun(run.id, 'completed', true);
  }
}
