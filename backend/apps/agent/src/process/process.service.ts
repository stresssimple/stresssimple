import { ProcessStatus } from '@dto/dto';
import { ServerRecord } from '@infra/infrastructure/mysql/Entities/Server';
import { TestProcess } from '@infra/infrastructure/mysql/Entities/TestProcess';
import { thisServer } from '@infra/infrastructure/mysql/servers.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ProcessesService {
  constructor(
    @InjectRepository(TestProcess)
    private readonly processRepository: Repository<TestProcess>,
    private readonly dataSource: DataSource,
  ) {}

  public async createProcess(process: TestProcess): Promise<TestProcess> {
    if (await this.processRepository.findOne({ where: { id: process.id } })) {
      throw new Error('Process already exists');
    }
    return await this.processRepository.save(process);
  }

  public async setEnvironment(id: string, envId: string) {
    const process = await this.processRepository.findOne({ where: { id } });
    process.environmentId = envId;
    this.processRepository.save(process);
  }

  public async tryAllocateProcess(
    runId: string,
    testId: string,
  ): Promise<TestProcess | null> {
    const process = new TestProcess({
      runId,
      serverId: thisServer.id,
      startTimestamp: new Date(),
      status: ProcessStatus.created,
      testId,
    });
    return await this.dataSource.transaction(async (manager) => {
      const server = await manager.findOne(ServerRecord, {
        where: { id: thisServer.id },
      });

      if (server.allocatedProcesses >= server.maxProcesses) {
        return null;
      }

      server.allocatedProcesses++;
      server.lastHeartbeat = new Date();
      await manager.update(ServerRecord, { id: thisServer.id }, server);

      await manager.insert(TestProcess, process);
      return process;
    });
  }

  public async getProcess(id: string): Promise<TestProcess> {
    return await this.processRepository.findOne({ where: { id } });
  }

  public async getProcessesByRunId(runId: string): Promise<TestProcess[]> {
    return await this.processRepository.find({ where: { runId: runId } });
  }

  public async updateProcess(id: string, processes: Partial<TestProcess>) {
    await this.processRepository.update({ id }, processes);
  }
}
