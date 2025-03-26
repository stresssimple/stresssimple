import { RunManager } from './run/RunManager.js';
import { Test } from './test.js';
import { ctx } from './run.context.js';
import {} from 'rabbitmq-client';
import { initRabbit, publisher } from './rabbit.js';

const args = process.argv.slice(2);
if (args.length !== 3) {
  console.error('Client Usage: node src/index.ts processId testId runId');
  process.exit(1);
}
const processId = args[0];
const testId = args[1];
const runId = args[2];
console.log(`Client  ${processId} Test ID: ${testId}, Run ID: ${runId}`);
ctx.testId = testId;
ctx.runId = runId;
ctx.processId = processId;

const runManager = new RunManager(new Test());

try {
  await initRabbit(processId, runId, runManager);
  console.log('Sending Client Runner started');
  await publisher.send(
    {
      exchange: 'run',
      routingKey: 'runnerStarted',
    },
    {
      processId,
      testId,
      runId,
    },
  );
  await runManager.run();
} catch (e) {
  console.error('Client Exception in runner', e);
} finally {
}
console.log('Client Runner stopped');
process.exit(0);
