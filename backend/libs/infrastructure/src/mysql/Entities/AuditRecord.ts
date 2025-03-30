import { generateId } from '@infra/infrastructure/utils';
import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity()
export class AuditRecord {
  constructor(source: Partial<AuditRecord> = {}) {
    this.id = 'a-' + generateId(10);
    this.timestamp = new Date();
    Object.assign(this, source);
  }

  @PrimaryColumn()
  id: string;

  @PrimaryColumn()
  name: string;

  @Column()
  @Index({})
  runId: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'float' })
  duration: number;

  @Column({ type: 'text', nullable: true })
  requestBody?: string;

  @Column({ type: 'text', nullable: true })
  responseBody?: string;

  @Column({ type: 'text', nullable: true })
  requestHeaders?: string;

  @Column({ type: 'text', nullable: true })
  responseHeaders?: string;

  @Column({ length: 10 })
  method: string;

  @Column({ length: 1000 })
  baseUrl: string;

  @Column({ length: 1000 })
  path: string;

  @Column({ nullable: true })
  status: number;

  @Column({ nullable: true })
  statusDescription?: string;

  @Column({ type: 'boolean' })
  success: boolean;
}
