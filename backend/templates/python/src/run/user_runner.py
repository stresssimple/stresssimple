import asyncio
import time
from influx.influx_service import InfluxService
from run_context import ctx
from stress_test import StressTest


class UserRunner:
    STOPPED = 'stopped'
    STOPPING = 'stopping'
    RUNNING = 'running'
    STARTING = 'starting'

    def __init__(self, user_id: str, test: StressTest):
        self.user_id = user_id
        self.test = test
        self.status = self.STARTING
        self.task = None
        self.influx = InfluxService()

    def stop(self):
        self.status = self.STOPPING

    def start(self):
        self.status = self.RUNNING
        if self.task:
            print('Task already running')
            return
        self.task = self.run()

    async def run(self):
        while self.status != self.STOPPING:
            start_time = time.time()
            try:
                await self.test.test(self.user_id)
            except Exception as e:
                print('Test threw an exception.', e)
            finally:
                end_time = time.time()
                duration = end_time - start_time
                await self.influx.write(
                    'test_duration',
                    {'duration': duration},
                    {'testId': ctx.test_id, 'runId': ctx.run_id,
                        'userId': self.user_id},
                )
            await self._sleep(self.test.interval())

        self.status = self.STOPPED
        print(f'User {self.user_id} stopped')

    async def wait_stopped(self):
        await self.task

    async def _sleep(self, interval):
        await asyncio.sleep(interval)
