import { Controller, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  RunCanStartEvent,
  StartTestProcessCommand,
  TestExecutionStatus,
} from '@dto/dto';
import { ProcessesService } from '../process/process.service';
import { PublishBus } from '@infra/infrastructure';
import { RunsService } from '@infra/infrastructure/mysql/runs.service';
import { RunScheduler } from './run.scheduler';

const runCanStartEvent = new RunCanStartEvent({ runId: '*' });

@Controller()
export class RunsManagementController {
  constructor(
    private readonly procService: ProcessesService,
    private readonly publishBus: PublishBus,
    private readonly runService: RunsService,
    private readonly logger: Logger,
    private readonly runScheduler: RunScheduler,
  ) {}

  @RabbitSubscribe({
    exchange: runCanStartEvent.route,
    routingKey: runCanStartEvent.routingKey,
    queue: RunCanStartEvent.name,
    name: RunCanStartEvent.name,
  })
  public async executeRun(message: RunCanStartEvent) {
    this.logger.log('RunCanStartEvent received', message);
    let run = await this.runService.getRun(message.runId);
    if (run.status !== TestExecutionStatus.scheduled) {
      this.logger.warn(
        `Run ${run.id} is not in scheduled state, skipping`,
        message,
      );
      return;
    }
    await this.runService.updateRun(run.id, TestExecutionStatus.scheduled);
    run = await this.runService.getRun(run.id);
    const processors = await this.procService.getProcessesByRunId(
      message.runId,
    );
    for (const proc of processors) {
      await this.publishBus.publishAsync(
        new StartTestProcessCommand({
          processId: proc.id,
          serverId: proc.serverId,
        }),
      );
    }

    await this.runScheduler.runTest(run, processors);
  }
}
