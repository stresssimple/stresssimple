import {
  AllocateProcessesCommand,
  StartRunCommand,
  TestExecutionStatus,
} from '@dto/dto';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { PublishBus } from '@infra/infrastructure';
import { RunsService } from '@infra/infrastructure/mysql/runs.service';
import { Controller, Logger } from '@nestjs/common';

const startRun = new StartRunCommand({ runId: '*' });

@Controller()
export class AgentController {
  constructor(
    private readonly runsService: RunsService,
    private readonly bus: PublishBus,
    private readonly logger: Logger,
  ) {}

  @RabbitSubscribe({
    exchange: startRun.route,
    routingKey: startRun.routingKey,
    queue: StartRunCommand.name,
  })
  public async startRunHandler(message: StartRunCommand) {
    this.logger.log('StartRunCommand received', message);
    const run = await this.runsService.getRun(message.runId);
    if (!run) {
      this.logger.error(`Run ${message.runId} not found`);
      return;
    }
    if (run.status !== TestExecutionStatus.created) {
      this.logger.error(
        `Run ${message.runId} is can be started. Status: ${run.status}`,
      );
      return;
    }

    await this.runsService.updateRun(
      message.runId,
      TestExecutionStatus.waitingForSchedule,
    );
    await this.bus.publishAsync(
      new AllocateProcessesCommand({
        runId: message.runId,
        processes: run.processes,
      }),
    );
  }
}
