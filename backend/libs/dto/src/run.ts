import { TestProcess } from '@infra/infrastructure/mysql/Entities/TestProcess';
import { TestExecutionStatus } from './enums';
import { RunMessage } from './event';

export class StartRunCommand extends RunMessage {
  constructor(source: Partial<StartRunCommand>) {
    super('start-run.' + source.runId, source);
  }
}

export class RunEndedEvent extends RunMessage {
  public status: TestExecutionStatus;
  constructor(source: Partial<RunEndedEvent>) {
    super('RunEnded.' + source.runId, source);
  }
}

export class AllocateProcessesCommand extends RunMessage {
  public processes: number;
  constructor(source: Partial<AllocateProcessesCommand>) {
    super(AllocateProcessesCommand.name, source);
  }
}

export class ProcessesAllocatedEvent extends RunMessage {
  public processes: TestProcess[];
  constructor(source: Partial<ProcessesAllocatedEvent>) {
    super('ProcessesAllocated.' + source.runId, source);
  }
}

export class RunCanStartEvent extends RunMessage {
  constructor(source: Partial<RunCanStartEvent>) {
    super('RunCanStart.' + source.runId, source);
  }
}
