import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditRecord } from '@infra/infrastructure';
import {
  AmqpConnection,
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
    // batchOptions: {
    //   size: 10,
    //   timeout: 5000,
    // },

    queueOptions: {
      durable: false,
      channel: 'audit',
    },
  })
  public async handleAuditRecord(records: AuditRecord[]): Promise<void | Nack> {
    try {
      await this.auditRepository.save(
        records.map((record) => new AuditRecord(record)),
      );
    } catch (error) {
      console.error('Error saving audit records:', error);
      return new Nack(false);
    }
  }
}
