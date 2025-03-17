import { Injectable, Logger } from '@nestjs/common';
import { TestsService } from '../tests/tests.service';
import { RunsService } from './runs.service';
import { TemplateRunnerSvcFactory } from '../template-runner/TemplateRunnerFactory';
import Redis from 'ioredis';
import { RunnersManager } from './runners.manager';

@Injectable()
export class RunScheduler {
  constructor(
    private testService: TestsService,
    private runsService: RunsService,
    private factory: TemplateRunnerSvcFactory,
    private runsManager: RunnersManager,
    private redis: Redis,
  ) {}

  async scheduleRun(
    testId: string,
    durationMinutes: number,
    rampUp: number,
    users: number,
  ) {
    const runId = await this.runsService.createRun(
      testId,
      durationMinutes,
      rampUp,
      users,
    );

    const testDefinitions = await this.testService.getTest(testId);
    if (!testDefinitions) {
      await this.runsService.updateRun(testId, runId, 'failed');
      throw new Error('Test not found');
    }

    const templateRunner = this.factory.getRunnerSvc(
      testId,
      runId,
      this.runsService.getFolder(testId, runId),
    );

    await templateRunner.initDirectory();
    const deps = await templateRunner.npmInstall(testDefinitions.modules);
    if (!deps) {
      await this.runsService.updateRun(testId, runId, 'failed');
      throw new Error('Failed to install dependencies');
    }

    const cmpl = await templateRunner.compileTemplate(testDefinitions.source);
    if (!cmpl) {
      await this.runsService.updateRun(testId, runId, 'failed');
      throw new Error('Failed to compile template');
    }

    const runner = templateRunner.startRunner();

    await this.runsManager.waitForRunner(runId);
    await this.runsService.updateRun(testId, runId, 'running');

    const userRampUpDelay = Math.floor((rampUp * 60 * 1000) / users);
    const testStart = new Date();
    let userIndex = 0;
    let run = await this.runsService.getRun(testId, runId);
    // Ramp up users
    while (userIndex < users && run.status === 'running') {
      await this.redis.publish(
        'runner:' + runId,
        JSON.stringify({ type: 'startUser', userId: userIndex + 1 }),
      );
      await new Promise((resolve) => setTimeout(resolve, userRampUpDelay));
      userIndex++;
      run = await this.runsService.getRun(testId, runId);
      await this.runsService.updateRun(testId, runId, 'running');
    }

    // Wait for the test to finish
    while (
      new Date().getTime() - testStart.getTime() <
        durationMinutes * 60 * 1000 &&
      run.status === 'running'
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await this.runsService.getRun(testId, runId);
      await this.runsService.updateRun(testId, runId, 'running');
    }
    await this.redis.publish(
      'runner:' + runId,
      JSON.stringify({ type: 'stopAllUsers' }),
    );

    await runner;
    await this.runsService.updateRun(testId, runId, 'completed', true);
    await templateRunner.cleanup();
  }
}
