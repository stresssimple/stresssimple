import { TestExecutionStatus } from '@dto/dto/enums';
import { generateId } from '@infra/infrastructure/utils';
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class TestExecution {
  constructor(source: Partial<TestExecution> = {}) {
    this.id = 'exe-' + generateId();
    Object.assign(this, source);
  }

  @PrimaryColumn()
  id: string;
  @Column()
  testId: string;
  @Column({ type: 'enum', enum: TestExecutionStatus })
  status: TestExecutionStatus;
  @Column({ type: 'timestamp' })
  startTime: Date;
  @Column({ type: 'timestamp', nullable: true })
  endTime?: Date;
  @Column({ type: 'timestamp' })
  lastUpdated: Date;
  @Column({ type: 'float' })
  durationMinutes: number;
  @Column({ type: 'float' })
  rampUpMinutes: number;
  @Column({ type: 'float' })
  numberOfUsers: number;
  @Column()
  processes: number;

  @Column({})
  auditSuccess: 'none' | 'all' | 'some';

  @Column({})
  auditFailure: 'none' | 'all' | 'some';

  @Column({})
  auditSuccessThreshold: number;

  @Column({})
  auditFailureThreshold: number;
}
