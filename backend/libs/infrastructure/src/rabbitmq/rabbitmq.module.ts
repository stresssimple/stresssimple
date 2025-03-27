import { Global, Logger, Module } from '@nestjs/common';
import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PublishBus, RabbitMQPublishBus } from './publish';
import { Log } from '@influxdata/influxdb-client';
import { channel } from 'diagnostics_channel';

const config = () => {
  return {
    exchanges: [
      { name: 'runs', type: 'topic' },
      { name: 'run', type: 'topic' },
      { name: 'servers', type: 'topic' },
      { name: 'server', type: 'topic' },
      { name: 'audit', type: 'topic' },
      { name: 'process', type: 'topic' },
    ],
    uri: process.env['RABBITMQ_URI'] || 'amqp://guest:guest@localhost:5672',
  };
};

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      useFactory: (logger: Logger) => ({
        ...config(),
        connectionInitOptions: { wait: false, reject: false, timeout: 1000 },
        logger: logger,
        connectionManagerOptions: {
          heartbeatIntervalInSeconds: 2,
          connectionOptions: { wait: false, reject: false, timeout: 1000 },
        },
        channels: {
          audit: { prefetchCount: 500 },
          runs: { prefetchCount: 50 },
          run: { prefetchCount: 50 },
          default: { prefetchCount: 50, default: true },
        },
      }),
      inject: [Logger],
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
