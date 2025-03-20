import { Redis } from 'ioredis';
import { RunManager } from './run/RunManager.js';
import { Test } from './test.js';
import { ctx } from './run.context.js';

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Client Usage: node src/index.ts testId runId');
  process.exit(1);
}
const testId = args[0];
const runId = args[1];
console.log(`Client Test ID: ${testId}, Run ID: ${runId}`);
ctx.testId = testId;
ctx.runId = runId;

const redisSub = new Redis({
  host: process.env['REDIS_HOST'] || 'localhost',
  port: Number.parseInt(process.env['REDIS_PORT'] ?? '6379'),
});
const redisPub = new Redis({
  host: process.env['REDIS_HOST'] || 'localhost',
  port: Number.parseInt(process.env['REDIS_PORT'] ?? '6379'),
});

ctx.redis = redisPub;

redisSub.on('connect', () => {
  console.log('Client Connected to Redis');
});

redisSub.subscribe('runner:' + runId, (err, count) => {
  console.log(`Client subscribed to runner:${runId}. Count: ${count}`);
  if (err) {
    console.error(err);
  }
});

const runManager = new RunManager(new Test());

redisSub.on('message', (channel: string, message: string) => {
  const data = JSON.parse(message);
  switch (data.type) {
    case 'startUser':
      runManager.startUser(data.userId);
      break;
    case 'stopUser':
      runManager.stopUser(data.userId);
      break;
    case 'stopAllUsers':
      runManager.stopAllUsers();
      break;
    default:
      console.error('Client Unknown message type', data.type);
  }
});

while (redisPub.status !== 'ready' || redisSub.status !== 'ready') {
  console.log('Client Waiting for Redis to be ready');
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

await redisPub.publish(
  'runners',
  JSON.stringify({ type: 'runnerStarted', runId }),
);
console.log('Client Runner started');
try {
  await runManager.run();
} catch (e) {
  console.error('Client Exception in runner', e);
} finally {
  await redisPub.publish(
    'runners',
    JSON.stringify({ type: 'runnerStopped', runId }),
  );
}
redisSub.disconnect();
redisPub.disconnect();
console.log('Client Runner stopped');
process.exit(0);
