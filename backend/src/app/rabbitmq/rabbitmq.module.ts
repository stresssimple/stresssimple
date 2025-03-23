import { Global, Module } from '@nestjs/common';
import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PublishBus, RabbitMQPublishBus } from './publish';

const config = () => {
  return {
    exchanges: [
      {
        name: 'runs',
        type: 'topic',
      },
      {
        name: 'run',
        type: 'topic',
      },
      { name: 'servers', type: 'topic' },
      { name: 'servers:allocateProcess', type: 'topic' },
    ],
    uri: 'amqp://guest:guest@localhost:5672',
    connectionInitOptions: { wait: true },
    connectionOptions: { wait: true },
  };
};

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      useFactory: () => config(),
    }),
  ],
  providers: [
    {
      provide: PublishBus,
      useClass: RabbitMQPublishBus,
    },
    {
      provide: AmqpConnection,
      useFactory: () => RabbitMQModule.AmqpConnectionFactory(config()),
    },
  ],
  exports: [PublishBus, AmqpConnection],
})
@Global()
export class RabbitmqModule {}
