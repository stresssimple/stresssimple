import { ProcessMessage } from './event';

export class StartTestProcessCommand extends ProcessMessage {
  constructor(source: Partial<StartTestProcessCommand>) {
    super('StartTestProcessCommand.' + source.serverId, source);
  }
}
