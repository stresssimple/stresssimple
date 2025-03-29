import { StressTest } from '../StressTest.js';
import { influxProxy } from '../influx/influxProxy.js';
import { ctx } from '../run.context.js';

type UserRunnerStatus = 'stopped' | 'stopping' | 'running' | 'starting';

export class UserRunner {
  public status: UserRunnerStatus = 'stopped';
  private task: Promise<void> | null = null;

  stop() {
    this.status = 'stopping';
  }

  start() {
    this.status = 'running';
    if (this.task) {
      console.error('Task already running');
      return;
    }
    this.task = this.run();
  }

  private async run(): Promise<void> {
    while (this.status !== 'stopping') {
      const startTime = process.hrtime.bigint();
      let success = true;
      try {
        await this.test.test(this.userId);
      } catch (e) {
        success = false;
        console.error('Test throw an exception.', e);
      } finally {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1e9;
        await influxProxy.write({
          measurement: 'test_run',
          fields: {
            duration,
            success: success ? 1.0 : 0.0,
          },
          tags: {
            testId: ctx.testId,
            runId: ctx.runId,
            userId: this.userId,
          },
        });
      }
      // We only wait if the test is not stopping, otherwise we stop immediately
      if (this.status === 'stopped') {
        break;
      }
      // Wait for the interval before running the test again
      // Only read once to avoid messing with randomness
      const interval = this.test.interval();
      if (interval > 0) {
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }
    this.status = 'stopped';
    console.log(`User ${this.userId} stopped`);
  }

  public async waitStopped(): Promise<void> {
    await this.task;
  }

  constructor(
    private userId: string,
    private test: StressTest,
  ) {
    this.status = 'starting';
  }
}
