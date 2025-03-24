import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ServerInstance } from '@infra/infrastructure/servers.service';
import { Injectable, Logger } from '@nestjs/common';
import { ProcessRecord } from './process/ProcessManagement.service';

@Injectable()
export class RunnersManager {
  private readonly runners = new Set<string>();
  private readonly waitingForRunners = new Map<string, () => void>();
  private readonly waitingForFinish = new Map<string, () => void>();
  constructor(private readonly logger: Logger) {}

  @RabbitSubscribe({
    exchange: 'run',
    routingKey: 'runnerStarted',
    queue: 'runnerStarted:' + ServerInstance.instance.serverId,
    queueOptions: {
      autoDelete: true,
    },
  })
  public async runnerStarted(data: {
    processId: string;
    runId: string;
    testId: string;
  }) {
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
    queue: 'runnerStopped:' + ServerInstance.instance.serverId,
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
    });

    await Promise.all(tasks);
  }

  public waitForFinishedRunners(processes: ProcessRecord[]) {
    const liveRunners = processes.filter((p) => this.runners.has(p.processId));
    console.log('Waiting for', liveRunners.length, 'runners to finish');
    const tasks = liveRunners.map(async (p) => {
      await new Promise<void>((resolve) => {
        this.waitingForFinish.set(p.processId, resolve);
      });
    });
    return Promise.all(tasks);
  }
}
