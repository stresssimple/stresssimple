import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AuditRecord } from '../mysql/Entities/AuditRecord';

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
    name?: string[],
    baseUrl?: string[],
    method?: string[],
    path?: string[],
    status?: string[],
    success?: string[],
  ): Promise<{ audits: Partial<AuditRecord>[]; total: number }> {
    const where: any = { runId };
    if (name) {
      where.name = In(name);
    }

    if (baseUrl) {
      where.baseUrl = In(baseUrl);
    }

    if (method) {
      where.method = In(method);
    }

    if (path) {
      where.path = In(path);
    }

    if (status) {
      where.status = In(status);
    }

    if (success) {
      where.success = In(success.map((s) => s === 'true'));
    }
    console.log('where', where);

    const records = await this.logRecordRepository.find({
      where,
      order: { timestamp: 'ASC' },
      skip: (page - 1) * recordsPerPage,
      take: recordsPerPage,
      select: [
        'id',
        'timestamp',
        'baseUrl',
        'method',
        'path',
        'status',
        'success',
        'duration',
        'name',
      ],
    });

    return {
      audits: records,
      total: await this.logRecordRepository.count({ where: { runId } }),
    };
  }

  public async getAuditValues(
    runId: string,
  ): Promise<Partial<Record<keyof AuditRecord, Set<string>>>> {
    const records = await this.logRecordRepository.find({ where: { runId } });
    const emptyResult: Partial<Record<keyof AuditRecord, Set<string>>> = {
      baseUrl: new Set(),
      method: new Set(),
      name: new Set(),
      path: new Set(),
      status: new Set(),
      success: new Set(),
    };
    const retval = records.reduce((acc, record) => {
      acc.baseUrl.add(record.baseUrl);
      acc.method.add(record.method);
      acc.name.add(record.name);
      acc.path.add(record.path);
      acc.status.add(record.status.toString());
      acc.success.add(record.success.toString());
      return acc;
    }, emptyResult);
    return retval;
  }

  public async getAuditRecord(id: string): Promise<AuditRecord> {
    return this.logRecordRepository.findOne({ where: { id } });
  }
}
