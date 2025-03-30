import { Entity, PrimaryColumn, Column } from 'typeorm';
import { generateId } from '../../utils/id';

@Entity()
export class LogRecord {
  constructor(source: Partial<LogRecord> = {}) {
    this.id = 'lg-' + generateId(10);
    Object.assign(this, source);
  }

  @PrimaryColumn()
  id: string;

  @Column()
  runId: string;

  @Column({ length: 10 })
  processId: string;

  @Column({ type: 'bigint' })
  timestamp: number;

  @Column({ length: 10 })
  level: string;

  @Column({ type: 'text' })
  message: string;
}
