import { ProcessStatus } from '@dto/dto/enums';
import { generateId } from '@infra/infrastructure/utils';
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({})
export class TestProcess {
  @PrimaryColumn()
  id: string;

  @Column()
  serverId: string;

  @Column()
  runId: string;

  @Column()
  testId: string;

  @Column({ type: 'enum', enum: ProcessStatus })
  status: ProcessStatus;

  @Column()
  startTimestamp: Date;

  @Column({ nullable: true })
  endTimestamp?: Date = null;

  @Column({ nullable: true })
  environmentId?: string;

  constructor(testProcess: Partial<TestProcess>) {
    this.id = 'pr-' + generateId();
    Object.assign(this, testProcess);
  }
}
