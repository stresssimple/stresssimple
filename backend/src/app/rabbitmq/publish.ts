import {
  AmqpConnection,
  AmqpConnectionManager,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { Options } from 'amqplib';

export type RabbitRouting = { route: string; routingKey: string };

export abstract class PublishBus {
  public abstract executeCommand<Rq extends RabbitRouting, Rs>(
    command: Rq,
  ): Promise<Rs>;
  public abstract publishAsync<T extends RabbitRouting>(
    event: T,
  ): Promise<void>;
}

@Injectable()
export class RabbitMQPublishBus implements PublishBus {
  private _bus: AmqpConnection | undefined;
  constructor(private readonly connManager: AmqpConnectionManager) {}

  public async executeCommand<Rq extends RabbitRouting, Rs>(
    command: Rq,
  ): Promise<Rs> {
    const rs = await this.bus.request<Rs>({
      exchange: command.route,
      routingKey: command.routingKey,
      payload: command,
      timeout: 10000,
    });
    return rs;
  }

  public async publishAsync<T extends { route: string; routingKey: string }>(
    event: T,
  ): Promise<void> {
    try {
      const options: Options.Publish = {};

      await this.bus.publish(
        event.route,
        event.routingKey ?? event.route,
        event,
        options,
      );
    } catch (e) {
      console.error('Failed to publish event', e);
    }
  }

  private get bus(): AmqpConnection {
    return this._bus ?? (this._bus = this.connManager.getConnections()[0]);
  }
}
