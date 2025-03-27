import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';

import { TestExecution } from './TestExecution';
import { generateId } from '@infra/infrastructure';

@Entity()
export class Test {
  constructor(source: Partial<Test> = {}) {
    this.id = generateId();
    Object.assign(this, source);
  }

  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  modules: string;

  @Column({ type: 'text' })
  source: string;

  @Column({ length: 50 })
  language: string;

  @OneToMany(() => TestExecution, (testExecution) => testExecution.testId)
  testExecutions: TestExecution[];
}
