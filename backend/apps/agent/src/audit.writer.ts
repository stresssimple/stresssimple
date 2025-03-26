import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditRecord } from '@infra/infrastructure';
import {
  AmqpConnection,
  ConsumerHandler,
  Nack,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class AuditWriter {
  constructor(
    @InjectRepository(AuditRecord)
    private readonly auditRepository: Repository<AuditRecord>,
    private readonly amqpConnection: AmqpConnection, // Inject AmqpConnection
  ) {}

  @RabbitSubscribe({
    exchange: 'audit',
    routingKey: '*',
    queue: 'audit-writer',
    batchOptions: {
      size: 100,
      timeout: 5000,
    },

    queueOptions: {
      durable: false,
      channel: 'audit',
    },
  })
  public async handleAuditRecord(records: AuditRecord[]): Promise<void | Nack> {
    try {
      if (!Array.isArray(records)) {
        //handle single record case
        await this.auditRepository.save(new AuditRecord(records));
        return;
      }
      await this.auditRepository.save(
        records.map((record) => new AuditRecord(record)),
      );
    } catch (error) {
      return new Nack(false);
    }
  }
}
