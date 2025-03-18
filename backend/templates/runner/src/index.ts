import { Redis } from 'ioredis';
import { RunManager } from './run/RunManager.js';
import { Test } from './test.js';
import { ctx } from './run.context.js';

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node src/index.ts testId runId');
  process.exit(1);
}
const testId = args[0];
const runId = args[1];
console.log(`Test ID: ${testId}, Run ID: ${runId}`);
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
  console.log('Connected to Redis');
});

redisSub.subscribe('runner:' + runId, (err, count) => {
  console.log(`Subscribed to runner:${runId}. Count: ${count}`);
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
      console.error('Unknown message type', data.type);
  }
});

while (redisPub.status !== 'ready' || redisSub.status !== 'ready') {
  console.log('Waiting for Redis to be ready');
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

await redisPub.publish(
  'runners',
  JSON.stringify({ type: 'runnerStarted', runId }),
);
console.log('Runner started');
try {
  await runManager.run();
} catch (e) {
  console.error(e);
} finally {
  await redisPub.publish(
    'runners',
    JSON.stringify({ type: 'runnerStopped', runId }),
  );
}
redisSub.disconnect();
redisPub.disconnect();
console.log('Runner stopped');
process.exit(0);
