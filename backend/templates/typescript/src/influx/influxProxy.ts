import { clearInterval } from 'node:timers';
import { InfluxRecord, InfluxService } from './influx.service.js';

export class InfluxProxy {
  private readonly queue: InfluxRecord[] = [];
  private readonly interval: NodeJS.Timeout | null = null;
  constructor(private readonly influxService: InfluxService) {
    this.interval = setInterval(() => {
      this.flushQueue();
    }, 1000);
  }
  async flushQueue() {
    if (this.queue.length === 0) {
      return;
    }
    const points = this.queue.splice(0, this.queue.length);
    console.log('Flushing queue', points.length);
    try {
      await this.influxService.writeData(points);
    } catch (e) {
      console.error('Error writing data to InfluxDB', e);
    }
  }

  public async write(data: InfluxRecord): Promise<void> {
    this.queue.push(data);
    if (this.queue.length > 1000) {
      console.log('Forced flush of queue', this.queue.length);
      await this.flushQueue();
    }
  }

  public async close(): Promise<void> {
    if (this.interval) {
      clearInterval(this.interval);
    }
    await this.flushQueue();
  }
}

export const influxProxy = new InfluxProxy(new InfluxService());
