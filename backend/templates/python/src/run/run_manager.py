import asyncio
import json
import sys
import time

from run_context import ctx
from influx.influx_service import InfluxService
from stress_test import StressTest
from run.user_runner import UserRunner


class RunManager:
    audit_exchange = None

    def __init__(self, test: StressTest):
        self.users = {}
        self.should_stop = False
        self.test = test
        self.influx = InfluxService()

    async def message_handler(self, message):
        data = message
        print("Client Received message", data["type"])
        if data["type"] == "startUser":
            self.start_user(data["userId"])
        elif data["type"] == "stopUser":
            await self.stop_user(data["userId"])
        elif data["type"] == "stopAllUsers":
            await self.stop_all_users()
            return False
        else:
            print("Client Unknown message type", data["type"], file=sys.stderr)
        return True

    def start_user(self, user_id: str):
        if user_id in self.users:
            print(f"User {user_id} is already running")
            return
        user_runner = UserRunner(user_id, self.test)
        self.users[user_id] = user_runner
        user_runner.start()

    async def stop_user(self, user_id: str):
        print(f"Stopping user {user_id}")
        if user_id not in self.users:
            print(f"User {user_id} is not running")
            return
        await self.users[user_id].stop()

    async def stop_all_users(self):
        print("Stopping all users")
        user_tasks = []
        for user_id in self.users:
            user_tasks.append(self.stop_user(user_id))
        self.should_stop = True
        await asyncio.gather(*user_tasks)

    async def run(self):
        try:
            while not self.should_stop or not self.all_users_stopped():
                await asyncio.sleep(1)
                await self.influx.write(
                    'running_users',
                    {
                        'value': float(len(self.users)),
                    },
                    {
                        'testId': ctx.test_id,
                        'runId': ctx.run_id,
                    },
                )
            print(
                f"All users stopped: {self.should_stop}, {self.all_users_stopped()}")
            print("Client Runner finished", flush=True)
        except Exception as e:
            print("Run manager main run thread crashed", e, flush=True)

    def all_users_stopped(self):
        for user_id in self.users:
            if self.users[user_id].status != 'stopped':
                return False
        return True
