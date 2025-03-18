import { Entity, PrimaryColumn, Column } from 'typeorm';
import { generateId } from '../utils/id';

@Entity()
export class LogRecord {
  constructor(source: Partial<LogRecord> = {}) {
    this.id = generateId(10);
    Object.assign(this, source);
  }

  @PrimaryColumn()
  id: string;

  @Column()
  runId: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ length: 10 })
  level: string;

  @Column({ type: 'text' })
  message: string;
}
