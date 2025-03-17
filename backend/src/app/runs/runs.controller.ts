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
import * as fs from 'fs/promises';
import { CreateRunRequest } from '../dto/runs/CreateRunRequest';
import { RunState } from '../dto/runs/Run';

@Controller('runs')
export class RunsController {
  constructor(
    private scheduler: RunScheduler,
    private readonly runsService: RunsService,
    private readonly logger: Logger,
  ) {}

  @Post()
  public createRun(@Body() request: CreateRunRequest): void {
    this.scheduler.scheduleRun(
      request.testId,
      request.durationMinutes,
      request.rampUpMinutes,
      request.users,
    );
  }

  @Get(':testId')
  public async getRuns(@Param('testId') testId: string): Promise<RunState[]> {
    const runIds = await this.runsService.getRuns(testId);
    const tasks = runIds.map((runId) => this.runsService.getRun(testId, runId));
    return await Promise.all(tasks);
  }

  @Get(':testId/:runId')
  public async getRun(
    @Param('testId') testId: string,
    @Param('runId') runId: string,
  ): Promise<RunState> {
    const run = await this.runsService.getRun(testId, runId);
    return run;
  }

  @Get(':testId/:runId/logs')
  public async getRunLogs(
    @Param('testId') testId: string,
    @Param('runId') runId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 100,
  ): Promise<unknown> {
    const folder = this.runsService.getFolder(testId, runId);
    const filePath = `${folder}/app.log`;
    try {
      const logs = await fs.readFile(filePath, 'utf-8');
      const run = await this.runsService.getRun(testId, runId);
      const lines = logs.split('\n');
      return {
        isFinal: run.isFinal,
        total: lines.length,
        logs: lines.slice((page - 1) * pageSize, page * pageSize),
      };
    } catch (e) {
      this.logger.error(e);
      throw new NotFoundException(
        `No logs found for run ${runId}, test ${testId}`,
      );
    }
  }

  @Delete(':testId/:runId')
  public async deleteRun(
    @Param('testId') testId: string,
    @Param('runId') runId: string,
  ): Promise<void> {
    this.logger.debug('Deleting run', testId, runId);
    return this.runsService.deleteRun(testId, runId);
  }

  @Post(':testId/:runId/stop')
  public async stopRun(
    @Param('testId') testId: string,
    @Param('runId') runId: string,
  ): Promise<void> {
    this.logger.debug('Stopping run', testId, runId);
    return this.runsService.cancelRun(testId, runId);
  }
}
