import json
import sys
import threading
import time

import redis
from run_context import ctx
from influx.influx_service import InfluxService
from stress_test import StressTest
from run.user_runner import UserRunner


class RunManager:
    def __init__(self, test: StressTest, redis_sub: redis.Redis, run_id: str):
        self.users = {}
        self.should_stop = False
        self.test = test
        self.redis_sub = redis_sub
        self.pubsub = redis_sub.pubsub()  # Create the pubsub instance
        self.pubsub.subscribe(f'runner:{run_id}')
        self.influx = InfluxService()
        print(f"Client subscribed to runner:{run_id}")
        self.thread = threading.Thread(target=self.listen, daemon=True)
        self.thread.start()

    def listen(self):
        print("Client Listening for messages", flush=True)
        for message in self.pubsub.listen():  # Listen using the created pubsub instance
            if message["type"] != "message":
                continue
            if not self.message_handler(message["data"]):
                return

    def message_handler(self, message):
        data = json.loads(message)
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
            time.sleep(1)
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
