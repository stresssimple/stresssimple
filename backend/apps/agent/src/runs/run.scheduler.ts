import { Injectable, Logger } from '@nestjs/common';
import { PublishBus, TestExecution } from '@infra/infrastructure';
import { TestsService } from 'apps/application/src/app/tests/tests.service';
import { RunsService } from '@infra/infrastructure/mysql/runs.service';
import { TestExecutionStatus } from '@dto/dto';
import { TestProcess } from '@infra/infrastructure/mysql/Entities/TestProcess';
import { RunnersManager } from './runners.manager';

@Injectable()
export class RunScheduler {
  constructor(
    private runsService: RunsService,
    private publish: PublishBus,
    private logger: Logger,
    private runsManager: RunnersManager,
  ) {}

  public async runTest(run: TestExecution, processes: TestProcess[]) {
    await this.runsManager.waitForRunners(processes.map((p) => p.id));
    this.logger.log('All applications started');
    await this.runsService.updateRun(run.id, TestExecutionStatus.running);

    const userRampUpDelay = Math.floor(
      (run.rampUpMinutes * 60 * 1000) / run.numberOfUsers,
    );
    const testStart = new Date();
    let userIndex = 0;
    run = await this.runsService.getRun(run.id);
    // Ramp up users
    while (
      userIndex < run.numberOfUsers &&
      run.status === TestExecutionStatus.running
    ) {
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
      run.status === TestExecutionStatus.running
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await this.runsService.getRun(run.id);
      await this.runsService.updateRun(run.id, run.status);
    }
    processes.forEach(async (p) => {
      this.logger.log('Stopping all users on process ' + p.id);
      await this.publish.publishAsync({
        route: 'process',
        routingKey: 'runCommand:' + p.id,
        type: 'stopAllUsers',
      });
    });

    this.logger.log('Waiting for all users to stop');
    await this.runsManager.waitForFinishedRunners(processes);
    this.logger.log('All users stopped');
    await this.runsService.updateRun(
      run.id,
      TestExecutionStatus.completed,
      true,
    );
  }
}
