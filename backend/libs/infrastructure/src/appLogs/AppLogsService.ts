import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogRecord } from '../mysql/Entities/LogRecord';

@Injectable()
export class AppLogsService {
  constructor(
    @InjectRepository(LogRecord)
    private readonly logRecordRepository: Repository<LogRecord>,
    private readonly logger: Logger,
  ) {}

  public async info(
    runId: string,
    processId: string,
    message: string,
  ): Promise<void> {
    await this.create({ runId, message, processId, level: 'info' });
  }

  public async error(
    runId: string,
    processId: string,
    message: string,
  ): Promise<void> {
    await this.create({ runId, message, processId, level: 'error' });
  }

  public async create(logRecord: Partial<LogRecord>): Promise<LogRecord> {
    const record = new LogRecord({ timestamp: Date.now(), ...logRecord });
    return this.logRecordRepository.save(record);
  }

  public async createMany(logRecords: LogRecord[]): Promise<LogRecord[]> {
    const records = logRecords.map(
      (record) => new LogRecord({ timestamp: new Date(), ...record }),
    );
    return this.logRecordRepository.save(records);
  }

  public async findLogRecords(
    runId: string,
    page: number,
    recordsPerPage: number,
  ): Promise<{ logs: LogRecord[]; total: number }> {
    const records = await this.logRecordRepository.find({
      where: { runId },
      order: { timestamp: 'ASC' },
      skip: (page - 1) * recordsPerPage,
      take: recordsPerPage,
    });

    return {
      logs: records,
      total: await this.logRecordRepository.count({ where: { runId } }),
    };
  }
}
