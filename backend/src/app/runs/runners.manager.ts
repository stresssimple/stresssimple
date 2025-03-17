import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RunnersManager {
  private readonly runners = new Set<string>();
  private readonly waitingForRunners = new Map<string, () => void>();
  constructor(private readonly logger: Logger) {
    const redis = new Redis({
      host: process.env['REDIS_HOST'] || 'localhost',
      port: Number.parseInt(process.env['REDIS_PORT']),
    });
    redis.subscribe('runners');
    redis.on('message', (channel, message) => {
      if (channel !== 'runners') {
        return;
      }
      const msg = JSON.parse(message);
      if (msg.type === 'runnerStarted') {
        this.logger.log(`Runner pushed ${msg.runId} started`);
        this.runners.add(msg.runId);
        const resolve = this.waitingForRunners.get(msg.runId);
        if (resolve) {
          resolve();
        }
        this.waitingForRunners.delete(msg.runId);
      } else if (msg.type === 'runnerStopped') {
        this.runners.delete(msg.runId);
        this.logger.log(`Runner pushed ${msg.runId} stopped`);
      }
    });
  }

  async waitForRunner(runnerId: string) {
    if (this.runners.has(runnerId)) {
      this.logger.log(`Runner ${runnerId} already started`);
      return;
    }
    this.logger.log(`Waiting for runner ${runnerId}`);
    await new Promise<void>((resolve) => {
      this.waitingForRunners.set(runnerId, resolve);
    });
  }
}
