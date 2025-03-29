import {
  AllocateProcessesCommand,
  ProcessStatus,
  RunCanStartEvent,
  StartTestProcessCommand,
  TestExecutionStatus,
} from '@dto/dto';
import { RabbitRPC, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { thisServer } from '@infra/infrastructure/mysql/servers.service';
import { Controller, Logger } from '@nestjs/common';
import { ProcessesAllocationEngine } from '../runs/PesourcesAllocation.engine';
import { RunsService } from '@infra/infrastructure/mysql/runs.service';
import { ProcessesService } from './process.service';
import { PublishBus } from '@infra/infrastructure';
import { ProcessesManagementService } from '../runs/ProcessExecutor.service';
import { TestsService } from 'apps/application/src/app/tests/tests.service';

const allocateProcessesCommand = new AllocateProcessesCommand({});

const startProcessCommand = new StartTestProcessCommand({
  processId: '*',
  serverId: thisServer.id,
});

@Controller()
export class ProcessController {
  constructor(
    private readonly logger: Logger,
    private readonly runsService: RunsService,
    private readonly processesAllocationEngine: ProcessesAllocationEngine,
    private readonly bus: PublishBus,
    private readonly processesService: ProcessesService,
    private readonly processesManagementService: ProcessesManagementService,
    private readonly testService: TestsService,
  ) {}

  @RabbitSubscribe({
    exchange: allocateProcessesCommand.route,
    routingKey: allocateProcessesCommand.routingKey,
    queue: AllocateProcessesCommand.name,
    name: AllocateProcessesCommand.name,
  })
  public async allocateProcessHandler(message: AllocateProcessesCommand) {
    try {
      const processes =
        await this.processesAllocationEngine.requireProcesses(message);

      if (!processes || processes.length === 0) {
        this.logger.error('No processes allocated. ' + processes?.length);
        await this.runsService.updateRun(
          message.runId,
          TestExecutionStatus.failed,
        );
        return;
      }

      this.logger.log('AllocateProcessCommand finished');
      await this.runsService.updateRun(
        message.runId,
        TestExecutionStatus.scheduled,
      );

      await this.bus.publishAsync(
        new RunCanStartEvent({ runId: message.runId }),
      );
    } catch (error) {
      this.logger.error('Error allocating process', error);
      this.runsService.updateRun(message.runId, TestExecutionStatus.failed);
    }
  }

  @RabbitRPC({
    exchange: startProcessCommand.route,
    routingKey: startProcessCommand.routingKey,
    queue: StartTestProcessCommand.name + '.' + thisServer.id,
    queueOptions: {
      durable: false,
      autoDelete: true,
    },
  })
  @RabbitSubscribe({
    exchange: startProcessCommand.route,
    routingKey: startProcessCommand.routingKey,
    queue: StartTestProcessCommand.name + '.' + thisServer.id,
    name: StartTestProcessCommand.name + '.' + thisServer.id,
  })
  public async startProcessHandler(message: StartTestProcessCommand) {
    this.logger.log('StartTestProcessCommand received', message);
    const process = await this.processesService.getProcess(message.processId);
    try {
      await this.processesService.updateProcess(message.processId, {
        status: ProcessStatus.running,
      });
      const test = await this.testService.getTest(process.testId);
      const run = await this.runsService.getRun(process.runId);
      const procResult = await this.processesManagementService.runProcess({
        payload: {
          processId: process.id,
          runId: process.runId,
          source: test.source,
          testId: process.testId,
          auditFailure: run.auditFailure,
          auditSuccess: run.auditSuccess,
          auditFailureThreshold: run.auditFailureThreshold,
          auditSuccessThreshold: run.auditSuccessThreshold,
        },
      });
      if (!procResult) {
        this.logger.error('Process failed');
        await this.processesService.updateProcess(message.processId, {
          status: ProcessStatus.failed,
        });
      }
    } catch (error) {
      this.logger.error('Error running process', error);
      this.processesService.updateProcess(message.processId, {
        status: ProcessStatus.failed,
      });
    }
  }
}
