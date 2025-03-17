import { InfluxService } from '../influx/influx.service.js';
import { ctx } from '../run.context.js';
import { StressTest } from '../StressTest.js';
import { UserRunner } from './UserRunner.js';

export class RunManager {
  private readonly users: Record<string, UserRunner> = {};
  private shouldStop = false;
  private readonly influx = new InfluxService();

  constructor(private readonly test: StressTest) {}

  public startUser(userId: string): void {
    if (this.users[userId]) {
      console.error(`User ${userId} is already running`);
      return;
    }
    this.users[userId] = new UserRunner(userId, this.test);
    this.users[userId].start();
  }

  public stopUser(userId: string): void {
    if (!this.users[userId]) {
      console.error(`User ${userId} is not running`);
      return;
    }
    this.users[userId].stop();
  }

  public stopAllUsers(): void {
    console.log('Stopping all users');
    for (const userId in this.users) {
      this.stopUser(userId);
    }
    this.shouldStop = true;
  }

  public async run(): Promise<void> {
    while (!this.shouldStop || !this.AllUsersStopped()) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.influx.write(
        'running_users',
        {
          value: Object.keys(this.users).length,
        },
        {
          testId: ctx.testId,
          runId: ctx.runId,
        },
      );
    }
    console.log('All users stopped', this.shouldStop, this.AllUsersStopped());
  }

  private AllUsersStopped(): boolean {
    for (const userId in this.users) {
      if (this.users[userId].status !== 'stopped') {
        return false;
      }
    }
    return true;
  }
}
