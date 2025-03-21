import redis


class RunContent:
    def __init__(self):
        self.run_id: str = ""
        self.test_id: str = ""
        self.redis_pub: redis.Redis = None


ctx = RunContent()
