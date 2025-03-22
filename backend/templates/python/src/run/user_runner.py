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
        self._thread = None
        self.influx = InfluxService()

    def stop(self):
        self.status = self.STOPPING
        if self._thread:
            self._thread.join()
        self._thread = None

    def start(self):
        self.status = self.RUNNING
        if self._thread:
            print('Task already running')
            return
        # Create and start the thread to run the async method
        self._thread = threading.Thread(
            target=self._start_async_task, daemon=True)
        self._thread.start()

    def _start_async_task(self):
        # Create a new event loop for this thread and set it as the current event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.run())

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
                    await self._thread

                    async def _sleep(self, interval):
                    await asyncio.sleep(interval/1000.0)
