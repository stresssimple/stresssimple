import { ProcessStatus } from '@dto/dto';
import { TestServer } from '@infra/infrastructure/mysql/Entities/Server';
import { TestProcess } from '@infra/infrastructure/mysql/Entities/TestProcess';
import { thisServer } from '@infra/infrastructure/mysql/servers.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';

@Injectable()
export class ProcessesService {
  constructor(
    @InjectRepository(TestProcess)
    private readonly processRepository: Repository<TestProcess>,
    private readonly dataSource: DataSource,
    private readonly logger: Logger,
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
      const server = await manager.findOne(TestServer, {
        where: {
          id: thisServer.id,
        },
      });
      const processes = await manager.find(TestProcess, {
        where: {
          serverId: thisServer.id,
          status: Not(In([ProcessStatus.ended, ProcessStatus.failed])),
        },
      });
      if (!server || !server.up) {
        this.logger.warn('Server is down or not available ' + server?.id);
        return null;
      }
      if (processes.length >= server.maxProcesses) {
        return null;
      }

      server.lastHeartbeat = new Date();
      await manager.update(TestServer, { id: thisServer.id }, server);

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
