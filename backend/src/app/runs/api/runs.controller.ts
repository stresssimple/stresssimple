import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { RunsService } from './runs.service';
import { RunScheduler } from '../run.scheduler';
import { CreateRunRequest } from '../../dto/runs/CreateRunRequest';
import { TestExecution } from '../../mysql/Entities/TestExecution';
import { PublishBus } from 'src/app/rabbitmq/publish';

@Controller('runs')
export class RunsController {
  constructor(
    private scheduler: RunScheduler,
    private readonly runsService: RunsService,
    private readonly logger: Logger,
    private readonly rabbitMq: PublishBus,
  ) {}

  @Post()
  public async createRun(@Body() request: CreateRunRequest): Promise<void> {
    try {
      const run = await this.runsService.createRun({
        durationMinutes: request.durationMinutes,
        rampUpMinutes: request.rampUpMinutes,
        numberOfUsers: request.users,
        processes: request.processes,
        testId: request.testId,
      });
      this.logger.log(
        `Scheduling run for test ${request.testId} with ${request.users} users, ${request.processes} processes`,
      );
      this.rabbitMq.publishAsync({
        route: 'runs',
        routingKey: 'execute',
        ...run,
      });
    } catch (e) {
      this.logger.error(`Failed to schedule run: ${e.message}`);
    }
  }

  @Get(':testId')
  public async getRuns(
    @Param('testId') testId: string,
    @Query('deleted') deleted: boolean = false,
  ): Promise<TestExecution[]> {
    const runs = await this.runsService.getRuns(testId);
    if (deleted) return runs;
    return runs.filter((run) => run.status !== 'deleted');
  }

  @Get('run/:runId')
  public async getRun(@Param('runId') runId: string): Promise<TestExecution> {
    const run = await this.runsService.getRun(runId);
    return run;
  }

  @Delete(':runId')
  public async deleteRun(@Param('runId') runId: string): Promise<void> {
    this.logger.log(`Deleting run ${runId}`);
    return this.runsService.deleteRun(runId);
  }

  @Post(':runId/stop')
  public async stopRun(@Param('runId') runId: string): Promise<void> {
    return this.runsService.cancelRun(runId);
  }
}
