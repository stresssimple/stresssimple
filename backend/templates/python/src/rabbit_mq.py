import asyncio
import json
import aio_pika

channel = None
processId = None
runId = None


async def handle_run_queue(queue, message_handler):
    print("Client Handling run queue", flush=True)
    try:
        async with queue.iterator() as queue_iter:
            print("Client Iterating run queue", flush=True)
            async for message in queue_iter:
                try:
                    print("Client Processing run queue", flush=True)
                    async with message.process():
                        print(message.body.decode(), flush=True)
                        msg = json.loads(message.body.decode())
                        message_handler(msg)
                except Exception as e:
                    print(f"Error processing message: {e}", flush=True)
    except Exception as e:
        print(f"Error with queue iterator: {e}", flush=True)


async def handle_process_queue(queue: aio_pika.abc.AbstractQueue, message_handler):
    print("Client Handling process queue", flush=True)
    try:
        async with queue.iterator() as queue_iter:
            print("Client Iterating process queue", flush=True)
            async for message in queue_iter:
                try:
                    print("Client Processing process queue", flush=True)
                    async with message.process():
                        print(message.body.decode(), flush=True)
                        msg = json.loads(message.body.decode())
                        message_handler(msg)
                except Exception as e:
                    print(f"Error processing message: {e}", flush=True)
    except Exception as e:
        print(f"Error with queue iterator: {e}", flush=True)


async def init_rabbitmq(loop: asyncio.AbstractEventLoop, process_id, run_id, messsage_handler):
    global processId, runId
    processId = process_id
    runId = run_id

    # Create our connection object,
    # passing in the on_open and on_close methods

    connection = await aio_pika.connect_robust(
        "amqp://guest:guest@127.0.0.1/", loop=loop,
    )

    connection.close_callbacks.add(lambda x, y: print(
        "!!!!!!!!!!!!!Client Connection closed!!!!!!!!!!!!!", flush=True))
    print("Client Connected to RabbitMQ", flush=True)

    # Creating channel
    run_channel: aio_pika.abc.AbstractChannel = await connection.channel()
    proc_channel: aio_pika.abc.AbstractChannel = await connection.channel()

    # Declaring queue

    run_queue: aio_pika.abc.AbstractQueue = await run_channel.declare_queue(
        "run:"+run_id,
        durable=True,
        auto_delete=True,
    )
    proc_queue: aio_pika.abc.AbstractQueue = await proc_channel.declare_queue(
        "process:"+processId,
        durable=True,
        auto_delete=True,
    )

    run_exchange = await run_channel.declare_exchange('run', aio_pika.ExchangeType.TOPIC, durable=True)
    proc_exchange = await proc_channel.declare_exchange('process', aio_pika.ExchangeType.TOPIC, durable=True)

    await proc_queue.bind(proc_exchange, routing_key='runCommand:'+process_id)
    await run_queue.bind(run_exchange, routing_key='runCommand:'+run_id)

    asyncio.create_task(handle_run_queue(run_queue, messsage_handler))
    asyncio.create_task(handle_process_queue(proc_queue, messsage_handler))

    await run_exchange.publish(
        aio_pika.Message(
            body=json.dumps({
                "processId": processId,
                "runId": runId
            }).encode()
        ),
        routing_key="runnerStarted",
    )

    print("Client Published runnerStarted", flush=True)
