import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { Repository } from 'typeorm';
import { AuditRecord } from '../mysql/AuditRecord';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuditWriter {
  constructor(
    @InjectRepository(AuditRecord)
    private readonly auditRepository: Repository<AuditRecord>,
  ) {
    const redis = new Redis({
      host: process.env['REDIS_HOST'] || 'localhost',
      port: Number.parseInt(process.env['REDIS_PORT']),
    });
    redis.subscribe('audit');
    redis.on('message', (channel, message) => {
      if (channel !== 'audit') {
        return;
      }
      const msg = JSON.parse(message);
      this.auditRepository.insert(new AuditRecord(msg));
    });
  }
}
