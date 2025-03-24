import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditRecord } from '@infra/infrastructure';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class AuditWriter {
  constructor(
    @InjectRepository(AuditRecord)
    private readonly auditRepository: Repository<AuditRecord>,
  ) {}

  @RabbitSubscribe({
    exchange: 'audit',
    routingKey: '*',
    queue: 'audit-writer',
  })
  public async handleAuditRecord(record: AuditRecord): Promise<void> {
    await this.auditRepository.save(record);
  }
}
