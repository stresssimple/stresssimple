import { generateId } from '@infra/infrastructure/utils';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ServerRecord {
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

  constructor(server: Partial<ServerRecord>) {
    this.id = 'sv-' + generateId();
    Object.assign(this, server);
  }
}
