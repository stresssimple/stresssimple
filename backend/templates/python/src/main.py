import asyncio
import json
import os
import sys
import redis
from run.run_manager import RunManager
from test import Test
from run_context import ctx


async def main():
    if len(sys.argv) != 3:
        print("Client Usage: python src/index.py testId runId",
              file=sys.stderr, flush=True)
        sys.exit(1)

    test_id, run_id = sys.argv[1], sys.argv[2]
    print(f"Client Test ID: {test_id}, Run ID: {run_id}", flush=True)
    ctx.test_id = test_id
    ctx.run_id = run_id

    redis_host = os.getenv("REDIS_HOST", "localhost")
    redis_port = int(os.getenv("REDIS_PORT", "16379"))

    redis_sub = redis.Redis(
        host=redis_host, port=redis_port, decode_responses=True)
    redis_pub = redis.Redis(
        host=redis_host, port=redis_port, decode_responses=True)
    
    ctx.redis_pub = redis_pub.pubsub()

    print("Client Connected to Redis", flush=True)

    run_manager = RunManager(Test(), redis_sub, run_id)

    redis_pub.publish("runners", json.dumps(
        {"type": "runnerStarted", "runId": run_id}))
    print("Client Runner started", flush=True)

    try:
        await run_manager.run()
    except Exception as e:
        print("Client Exception in runner", e, file=sys.stderr, flush=True)
    finally:
        redis_pub.publish("runners", json.dumps(
            {"type": "runnerStopped", "runId": run_id}))

    redis_sub.close()
    redis_pub.close()
    print("Client Runner stopped", flush=True)
    sys.exit(0)

if __name__ == "__main__":
    asyncio.run(main())
