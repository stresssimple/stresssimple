import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class TestExecution {
  constructor(source: Partial<TestExecution> = {}) {
    Object.assign(this, source);
  }

  @PrimaryColumn()
  id: string;

  @Column()
  testId: string;

  @Column()
  status: string;

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
}
