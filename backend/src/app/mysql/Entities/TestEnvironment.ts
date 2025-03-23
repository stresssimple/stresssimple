import { Entity, PrimaryColumn, Column } from 'typeorm';
import { generateId } from '../../utils/id';

@Entity()
export class TestEnvironment {
  constructor(source: Partial<TestEnvironment> = {}) {
    this.id = generateId();
    Object.assign(this, source);
  }

  @PrimaryColumn()
  id: string;

  @Column()
  serverId: string;

  @Column({ length: 50 })
  language: string;

  @Column()
  modules: string;

  @Column({ type: 'boolean' })
  isFree: boolean;

  @Column()
  runId: string;
}
