import { generateId, RabbitRouting } from '@infra/infrastructure';

export abstract class Message implements RabbitRouting {
  public id: string = 'ev-' + generateId();
  public type: string = this.constructor.name;
  public timestamp: Date = new Date();

  constructor(
    public route: string,
    public routingKey: string,
    source: Partial<Message>,
  ) {
    Object.assign(this, source);
  }
}

export abstract class RunMessage extends Message {
  public runId: string;
  constructor(routingKey: string, source: Partial<RunMessage>) {
    super('run', routingKey, source);
  }
}

export abstract class ServerMessage extends Message {
  public serverId: string;
  constructor(routingKey: string, source: Partial<ServerMessage>) {
    super('server', routingKey, source);
  }
}

export abstract class ProcessMessage extends ServerMessage {
  public processId: string;
  constructor(routingKey: string, source: Partial<ProcessMessage>) {
    super(routingKey, source);
  }
}
