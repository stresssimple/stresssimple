export enum TestExecutionStatus {
  created = 'created',
  waitingForSchedule = 'waitingForSchedule',
  running = 'running',
  completed = 'completed',
  cancelled = 'cancelled',
  failed = 'failed',
  deleted = 'deleted',
  scheduled = 'scheduled',
}

export enum ProcessStatus {
  created = 'allocated',
  ready = 'ready',
  running = 'running',
  completed = 'free',
  cancelled = 'cancelled',
  failed = 'failed',
  ended = 'ended',
}
