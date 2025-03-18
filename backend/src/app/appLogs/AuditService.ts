import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditRecord } from '../mysql/AuditRecord';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditRecord)
    private readonly logRecordRepository: Repository<AuditRecord>,
  ) {}

  public async create(auditRecord: Partial<AuditRecord>): Promise<AuditRecord> {
    if (!auditRecord.runId) {
      throw new Error('runId is required');
    }
    if (auditRecord.id) {
      throw new Error('id is generated automatically');
    }
    const record = new AuditRecord(auditRecord);
    return this.logRecordRepository.save(record);
  }

  public async findAuditRecords(
    runId: string,
    page: number,
    recordsPerPage: number,
  ): Promise<{ audits: AuditRecord[]; total: number }> {
    const records = await this.logRecordRepository.find({
      where: { runId },
      order: { timestamp: 'ASC' },
      skip: (page - 1) * recordsPerPage,
      take: recordsPerPage,
    });

    return {
      audits: records,
      total: await this.logRecordRepository.count({ where: { runId } }),
    };
  }

  public async getAuditRecord(id: string): Promise<AuditRecord> {
    return this.logRecordRepository.findOne({ where: { id } });
  }
}
