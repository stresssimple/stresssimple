import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Controller } from '@nestjs/common';
import { ServerRecord } from './ProcessManagement.service';
import { generateId } from 'src/app/utils/id';
import { TestExecution } from 'src/app/mysql/Entities/TestExecution';
import { PublishBus } from 'src/app/rabbitmq/publish';

@Controller()
export class ServersObserver {
  private readonly servers: { [key: string]: ServerRecord } = {};
  private lastCleanup = new Date();
  constructor(private readonly publish: PublishBus) {}

  @RabbitSubscribe({
    exchange: 'servers',
    routingKey: 'keepAlive',
    queue: 'servers-keepAlive-' + generateId(),
    queueOptions: {
      durable: false,
      autoDelete: true,
    },
  })
  public async keepAlive(data: ServerRecord) {
    this.servers[data.name] = data;
    if (new Date().getTime() - this.lastCleanup.getTime() > 1000) {
      this.cleanup();
    }
  }

  public listServers(): ServerRecord[] {
    return Object.values(this.servers);
  }



  cleanup() {
    const keys = Object.keys(this.servers);
    for (const key of keys) {
      if (
        new Date().getTime() - new Date(this.servers[key].time).getTime() >
        5000
      ) {
        delete this.servers[key];
      }
    }
    this.lastCleanup = new Date();
  }
}
