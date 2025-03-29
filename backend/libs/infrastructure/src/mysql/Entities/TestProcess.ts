import { ProcessStatus } from '@dto/dto/enums';
import { generateId } from '@infra/infrastructure/utils';
import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { TestServer } from './Server';

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

  @ManyToOne(() => TestServer, (process) => process.processes, {
    onDelete: 'CASCADE',
    nullable: true,
    createForeignKeyConstraints: true,
    orphanedRowAction: 'delete',
  })
  server: TestServer;

  constructor(testProcess: Partial<TestProcess>) {
    this.id = 'pr-' + generateId();
    Object.assign(this, testProcess);
  }
}
