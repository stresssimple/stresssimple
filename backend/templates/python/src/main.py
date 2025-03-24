import asyncio
import json
import os
import sys
from run.run_manager import RunManager
from test import Test
from run_context import ctx
from rabbit_mq import init_rabbitmq

# import logging
# logging.basicConfig(level=logging.DEBUG)


async def main():
    if len(sys.argv) != 4:
        print("Client Usage: python src/index.py processId testId runId",
              file=sys.stderr, flush=True)
        sys.exit(1)

    process_id, test_id, run_id = sys.argv[1], sys.argv[2], sys.argv[3]
    print(f"Client Test ID: {test_id}, Run ID: {run_id}", flush=True)
    ctx.test_id = test_id
    ctx.run_id = run_id

    loop = asyncio.get_event_loop()

    await init_rabbitmq(loop, process_id, run_id)

    run_manager = RunManager(Test(),  run_id)

    print("Client Runner started", flush=True)

    try:
        await run_manager.run()
    except Exception as e:
        print("Client Exception in runner", e, file=sys.stderr, flush=True)
    finally:
        loop.stop()


if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(main())
    sys.exit(0)
