import { Injectable, Logger } from '@nestjs/common';
import {
  ServersService,
  thisServer,
} from '@infra/infrastructure/mysql/servers.service';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { TestProcess } from '@infra/infrastructure/mysql/Entities/TestProcess';

@Injectable()
export class RunnersManager {
  private readonly runners = new Set<string>();
  private readonly waitingForRunners = new Map<string, () => void>();
  private readonly waitingForFinish = new Map<string, () => void>();
  constructor(
    private readonly logger: Logger,
    private readonly servers: ServersService,
  ) {}

  @RabbitSubscribe({
    exchange: 'run',
    routingKey: 'runnerStarted',
    queue: 'runnerStarted:' + thisServer.id,
    queueOptions: {
      autoDelete: true,
    },
  })
  public async runnerStarted(data: {
    processId: string;
    runId: string;
    testId: string;
  }) {
    this.logger.log('Runner started', data.processId);
    const runnerId = data.processId;
    this.runners.add(runnerId);
    if (this.waitingForRunners.has(runnerId)) {
      this.waitingForRunners.get(runnerId)();
      this.waitingForRunners.delete(runnerId);
    }
  }

  @RabbitSubscribe({
    exchange: 'run',
    routingKey: 'runnerStopped',
    queue: 'runnerStopped:' + thisServer.id,
    queueOptions: {
      autoDelete: true,
    },
  })
  public async runnerStopped(data: {
    processId: string;
    runId: string;
    testId: string;
  }) {
    console.log('Runner stopped', data.processId);
    const runnerId = data.processId;
    this.runners.delete(runnerId);
    if (this.waitingForFinish.has(runnerId)) {
      this.waitingForFinish.get(runnerId)();
      this.waitingForFinish.delete(runnerId);
    }
  }

  async waitForRunners(runnerId: string[]) {
    const notReadyRunners = runnerId.filter(
      (runnerId) => !this.runners.has(runnerId),
    );

    const tasks = notReadyRunners.map(async (runnerId) => {
      await new Promise<void>((resolve) => {
        this.waitingForRunners.set(runnerId, resolve);
      });
      this.logger.log('Runner is ready', runnerId);
    });

    await Promise.all(tasks);
  }

  public waitForFinishedRunners(processes: TestProcess[]) {
    const liveRunners = processes.filter((p) => this.runners.has(p.id));
    console.log('Waiting for', liveRunners.length, 'runners to finish');
    const tasks = liveRunners.map(async (p) => {
      await new Promise<void>((resolve) => {
        this.waitingForFinish.set(p.id, resolve);
      });
    });
    return Promise.all(tasks);
  }
}
