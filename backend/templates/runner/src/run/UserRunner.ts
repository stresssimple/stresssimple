import { InfluxDB } from '@influxdata/influxdb-client';
import { StressTest } from '../StressTest.js';
import { InfluxService } from '../influx/influx.service.js';
import { ctx } from '../run.context.js';

type UserRunnerStatus = 'stopped' | 'stopping' | 'running' | 'starting';

export class UserRunner {
  public status: UserRunnerStatus = 'stopped';
  private task: Promise<void> | null = null;
  private influx = new InfluxService();

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
    console.log(`Running user ${this.userId}`);
    const influxWriter = this.influx.getWriteApi();
    while (this.status !== 'stopping') {
      const startTime = process.hrtime.bigint();
      try {
        await this.test.test(this.userId);
      } catch (e) {
        console.error('Test throw an exception.', e);
      } finally {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1e9;
        await this.influx.write(
          'test_duration',
          {
            duration,
          },
          {
            testId: ctx.testId,
            runId: ctx.runId,
            userId: this.userId,
          },
        );
      }
      await new Promise((resolve) => setTimeout(resolve, this.test.interval()));
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
