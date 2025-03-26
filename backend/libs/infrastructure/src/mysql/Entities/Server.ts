import { generateId } from '@infra/infrastructure/utils';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { TestProcess } from './TestProcess';

@Entity()
export class TestServer {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ type: 'timestamp' })
  startTimestamp: Date;

  @Column()
  allocatedProcesses: number;

  @Column()
  maxProcesses: number;

  @Column({ type: 'timestamp' })
  lastHeartbeat: Date;

  @OneToMany(() => TestProcess, (process) => process.server, {
    cascade: true,
    nullable: true,
    onDelete: 'CASCADE',
    createForeignKeyConstraints: true,
    orphanedRowAction: 'delete',
  })
  processes: TestProcess[];

  @Column()
  up: boolean;

  constructor(server: Partial<TestServer>) {
    this.id = 'sv-' + generateId();
    Object.assign(this, server);
  }
}
