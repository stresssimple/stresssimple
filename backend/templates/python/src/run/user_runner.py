import asyncio
import time
from influx.influx_service import InfluxService
from run_context import ctx
from stress_test import StressTest
import threading


class UserRunner:
    STOPPED = 'stopped'
    STOPPING = 'stopping'
    RUNNING = 'running'
    STARTING = 'starting'

    def __init__(self, user_id: str, test: StressTest):
        self.user_id = user_id
        self.test = test
        self.status = self.STARTING
        self._task = None
        self.influx = InfluxService()

    async def stop(self):
        print(f'Stopping user {self.user_id}')
        self.status = self.STOPPING
        if self._task is not None:
            await self._task
        self._task = None

    def start(self):
        self.status = self.RUNNING
        if self._task is None:
            self._task = asyncio.create_task(self.run())
        else:
            print(f'User {self.user_id} is already running')

    async def run(self):
        while self.status != self.STOPPING:
            start_time = time.time()
            success = False
            try:
                await self.test.test(self.user_id)
            except Exception as e:
                success = False
                print('Test threw an exception.', e)
            finally:
                end_time = time.time()
                duration = end_time - start_time
                await self.influx.write(
                    'test_run',
                    {'duration': duration, 'success': 1.0 if success else 0.0},
                    {'testId': ctx.test_id, 'runId': ctx.run_id,
                        'userId': self.user_id},
                )
                await self._sleep(self.test.interval())

        self.status = self.STOPPED
        print(f'User {self.user_id} stopped')

    async def wait_stopped(self):
        await self._task

    async def _sleep(self, interval):
        await asyncio.sleep(interval/1000.0)
