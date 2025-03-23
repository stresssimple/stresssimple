import { Controller } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { RunScheduler } from './run.scheduler';
@Controller()
export class RunsManagementController {
  constructor(private readonly scheduler: RunScheduler) {}

  @RabbitSubscribe({
    exchange: 'runs',
    routingKey: 'execute',
    queue: 'runs-execute',
    queueOptions: {
      durable: true,
    },
  })
  public async executeRun(data: any) {
    this.scheduler.executeRun(data.id);
  }
}
