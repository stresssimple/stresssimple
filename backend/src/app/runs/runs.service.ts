import { Injectable, Logger } from '@nestjs/common';
import { TestExecution } from '../mysql/TestExecution';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { generateId } from '../utils/id';

@Injectable()
export class RunsService {
  constructor(
    @InjectRepository(TestExecution)
    private usersRepository: Repository<TestExecution>,
    private logger: Logger,
  ) {}

  public async createRun(
    testId: string,
    durationMinutes: number,
    rampUpMinutes: number,
    users: number,
  ): Promise<TestExecution> {
    const runId = generateId();
    const testExecution = new TestExecution({
      id: runId,
      status: 'created',
      startTime: new Date(),
      lastUpdated: new Date(),
      testId: testId,
      durationMinutes,
      rampUpMinutes,
      numberOfUsers: users,
    });
    await this.usersRepository.insert(testExecution);
    return testExecution;
  }

  public async cancelRun(runId: string) {
    await this.updateRun(runId, 'cancelled', true);
  }

  public async deleteRun(runId: string): Promise<void | PromiseLike<void>> {
    await this.updateRun(runId, 'deleted', true);
  }

  public async getRuns(testId: string): Promise<TestExecution[]> {
    return this.usersRepository.find({ where: { testId: testId } });
  }

  public async getRun(runId: string): Promise<TestExecution> {
    return this.usersRepository.findOne({
      where: { id: runId },
      // relations: ['test'],
    });
  }

  public async getRunStatus(runId: string): Promise<string> {
    const run = await this.getRun(runId);
    return run.status;
  }

  public async updateRun(
    runId: string,
    status: string,
    completed = false,
  ): Promise<void> {
    const run = await this.getRun(runId);
    run.status = status;
    run.lastUpdated = new Date();
    if (completed) {
      run.endTime = new Date();
    }
    await this.usersRepository.save(run);
  }
}
