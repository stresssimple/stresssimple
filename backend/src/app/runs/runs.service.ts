import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';
import { RunState } from '../dto/runs/Run';

@Injectable()
export class RunsService {
  private readonly RUNS_FOLDER = process.env['RUNS_FOLDER']; //'tmp/runs';
  constructor(private logger: Logger) {
    this.logger.log(`Runs folder: ${this.RUNS_FOLDER}`);
    if (!fs.existsSync(this.RUNS_FOLDER)) {
      fs.mkdirSync(this.RUNS_FOLDER);
      this.logger.log(`Created runs folder: ${this.RUNS_FOLDER}`);
    }
  }

  public async createRun(
    testId: string,
    durationMinutes: number,
    rampUpMinutes: number,
    users: number,
  ): Promise<string> {
    const runId = uuid.v7();
    const testFolder = path.join(this.RUNS_FOLDER, testId);
    if (!fs.existsSync(testFolder)) {
      fs.mkdirSync(testFolder);
    }
    const runFolder = path.join(this.RUNS_FOLDER, testId, runId);
    fs.mkdirSync(runFolder);
    fs.writeFileSync(
      path.join(runFolder, 'run.json'),
      JSON.stringify(<RunState>{
        testId,
        durationMinutes,
        rampUpMinutes,
        users,
        startTime: new Date(),
        lastUpdated: new Date(),
        status: 'created',
        runId,
      }),
    );
    return runId;
  }

  public async cancelRun(testId: string, runId: string) {
    await this.updateRun(testId, runId, 'cancelled', true);
  }

  public deleteRun(testId: string, runId: string): void | PromiseLike<void> {
    const runFolder = path.join(this.RUNS_FOLDER, testId, runId);
    fs.rmSync(runFolder, { recursive: true });
  }

  public async getRuns(testId: string): Promise<string[]> {
    const pathToFolder = path.join(this.RUNS_FOLDER, testId);
    if (!fs.existsSync(pathToFolder)) {
      return [];
    }
    return fs.readdirSync(pathToFolder);
  }

  public async getRun(testId: string, runId: string): Promise<RunState> {
    const runFolder = path.join(this.RUNS_FOLDER, testId, runId);
    const runFile = path.join(runFolder, 'run.json');
    if (!fs.existsSync(runFile)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(runFile).toString());
  }
  public async getRunStatus(testId: string, runId: string): Promise<string> {
    const run = await this.getRun(testId, runId);
    return run.status;
  }

  public async updateRun(
    testId: string,
    runId: string,
    status: string,
    completed = false,
  ): Promise<void> {
    const runFolder = path.join(this.RUNS_FOLDER, testId, runId);
    const runFile = path.join(runFolder, 'run.json');
    if (!fs.existsSync(runFile)) {
      this.logger.error(`Run file not found: ${runFile}`);
      return;
    }
    const run = <RunState>JSON.parse(fs.readFileSync(runFile).toString());
    run.status = status;
    run.lastUpdated = new Date();
    run.isFinal = completed;
    if (completed) {
      run.endTime = new Date();
    }
    fs.writeFileSync(runFile, JSON.stringify(run));
  }

  public getFolder(testId: string, runId: string): string {
    return path.join(this.RUNS_FOLDER, testId, runId);
  }
}
