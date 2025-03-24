import { AsyncMessage, Connection, Publisher } from 'rabbitmq-client';
import { RunManager } from './run/RunManager.js';

let rabbit: Connection;

const connectionTask = new Promise<void>((resolve) => {
  // Initialize:
  rabbit = new Connection({
    url: 'amqp://guest:guest@localhost:5672',
    connectionName: 'clientTypeScript',
  });

  rabbit.on('error', (err) => {
    console.log('RabbitMQ connection error', err);
  });
  rabbit.on('connection', () => {
    console.log('Connection successfully (re)established');
    resolve();
  });
});

export let publisher: Publisher;

export async function initRabbit(
  processId: string,
  runId: string,
  runManager: RunManager,
) {
  await connectionTask;
  // Create a producer:
  // Consume messages from a queue:
  // See API docs for all options
  console.log('Creating consumer for process', processId);
  rabbit
    .createConsumer(
      {
        queue: 'process:' + processId,
        queueOptions: { autoDelete: true, durable: true },
        // handle 2 messages at a time
        qos: { prefetchCount: 1 },
        // Optionally ensure an exchange exists
        exchanges: [{ exchange: 'process', type: 'topic', durable: true }],
        // With a "topic" exchange, messages matching this pattern are routed to the queue
        queueBindings: [{ exchange: 'process', routingKey: runId }],
        lazy: true,
      },
      async (msg: AsyncMessage) => {
        const body = JSON.parse(msg.body.toString());
        console.log('process command', body);
        switch (body.type) {
          case 'startUser':
            await runManager.startUser(body.userId);
            break;
          case 'stopUser':
            await runManager.stopUser(body.userId);
            break;
          case 'stopAllUsers':
            console.log('Stopping all users');
            await runManager.stopAllUsers();
            break;
          default:
            console.log('Unknown message type', body.type);
        }
      },
    )
    .start();
  publisher = rabbit.createPublisher({});
  // Sleep for a bit to ensure the consumer is ready
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Create a publisher:
}
