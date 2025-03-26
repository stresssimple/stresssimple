import { ProcessMessage } from './event';

export class AllocateProcessCommand extends ProcessMessage {
  public runId: string;
  public testId: string;
  constructor(source: Partial<AllocateProcessCommand>) {
    super('AllocateProcessCommand.' + source.serverId, source);
  }
}
