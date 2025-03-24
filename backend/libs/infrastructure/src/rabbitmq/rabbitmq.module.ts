import { Global, Module } from '@nestjs/common';
import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PublishBus, RabbitMQPublishBus } from './publish';

const config = () => {
  return {
    exchanges: [
      { name: 'runs', type: 'topic' },
      { name: 'run', type: 'topic' },
      { name: 'servers', type: 'topic' },
      { name: 'servers:allocateProcess', type: 'topic' },
      { name: 'servers:freeProcess', type: 'topic' },
      { name: 'audit', type: 'topic' },
      { name: 'process', type: 'topic', durable: true },
    ],
    uri: 'amqp://guest:guest@localhost:5672',
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
