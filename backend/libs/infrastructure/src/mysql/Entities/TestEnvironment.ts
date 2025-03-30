import { Entity, PrimaryColumn, Column } from 'typeorm';
import { generateId } from '../../utils/id';

@Entity()
export class TestEnvironment {
  constructor(source: Partial<TestEnvironment> = {}) {
    this.id = 'env-' + generateId();
    Object.assign(this, source);
  }

  @PrimaryColumn()
  id: string;

  @Column({ length: 50 })
  language: string;

  @Column()
  modules: string;

  @Column({ type: 'boolean' })
  isFree: boolean;

  @Column({ nullable: true })
  runId?: string;
}
