import asyncio
import json
import sys
import time

from run_context import ctx
from influx.influx_service import InfluxService
from stress_test import StressTest
from run.user_runner import UserRunner


class RunManager:
    def __init__(self, test: StressTest,  run_id: str):
        self.users = {}
        self.should_stop = False
        self.test = test
        self.influx = InfluxService()

    def message_handler(self, message):
        data = message
        print(f"Client Received message: {data}", flush=True)
        if data["type"] == "startUser":
            self.start_user(data["userId"])
        elif data["type"] == "stopUser":
            self.stop_user(data["userId"])
        elif data["type"] == "stopAllUsers":
            self.stop_all_users()
            return False
        else:
            print("Client Unknown message type", data["type"], file=sys.stderr)
        return True

    def start_user(self, user_id: str):
        if user_id in self.users:
            print(f"User {user_id} is already running")
            return
        self.users[user_id] = UserRunner(user_id, self.test)
        self.users[user_id].start()

    def stop_user(self, user_id: str):
        print(f"Stopping user {user_id}")
        if user_id not in self.users:
            print(f"User {user_id} is not running")
            return
        self.users[user_id].stop()

    def stop_all_users(self):
        print("Stopping all users")
        for user_id in self.users:
            self.stop_user(user_id)
        self.should_stop = True

    async def run(self):
        while not self.should_stop or not self.all_users_stopped():
            await asyncio.sleep(10)
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

    def all_users_stopped(self):
        for user_id in self.users:
            if self.users[user_id].status != 'stopped':
                return False
        return True
