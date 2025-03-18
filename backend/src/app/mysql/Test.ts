import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';

import { TestExecution } from './TestExecution';

@Entity()
export class Test {
  constructor(source: Partial<Test> = {}) {
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

  @OneToMany(() => TestExecution, (testExecution) => testExecution.testId)
  testExecutions: TestExecution[];
}
