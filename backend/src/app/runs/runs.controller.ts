import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { RunsService } from './runs.service';
import { RunScheduler } from './run.scheduler';
import { CreateRunRequest } from '../dto/runs/CreateRunRequest';
import { TestExecution } from '../mysql/TestExecution';

@Controller('runs')
export class RunsController {
  constructor(
    private scheduler: RunScheduler,
    private readonly runsService: RunsService,
    private readonly logger: Logger,
  ) {}

  @Post()
  public createRun(@Body() request: CreateRunRequest): void {
    try {
      this.logger.log(
        `Scheduling run for test ${request.testId} with ${request.users} users`,
      );
      this.scheduler.scheduleRun(
        request.testId,
        request.durationMinutes,
        request.rampUpMinutes,
        request.users,
      );
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
