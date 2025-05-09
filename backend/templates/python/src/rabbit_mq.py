import asyncio
import json
import aio_pika
import os


class RabbitMQ:
    run_channel: aio_pika.abc.AbstractChannel
    proc_channel: aio_pika.abc.AbstractChannel
    pub_channel: aio_pika.abc.AbstractChannel
    run_queue: aio_pika.abc.AbstractQueue
    proc_queue: aio_pika.abc.AbstractQueue
    run_exchange: aio_pika.abc.AbstractExchange
    proc_exchange: aio_pika.abc.AbstractExchange
    run_consumer: asyncio.Task
    process_consumer: asyncio.Task

    def __init__(self, loop: asyncio.AbstractEventLoop, process_id, run_id):
        self.loop = loop
        self.process_id = process_id
        self.run_id = run_id

    async def _handle_run_queue(self, queue, message_handler):
        try:
            async with queue.iterator() as queue_iter:
                async for message in queue_iter:
                    try:
                        async with message.process():
                            msg = json.loads(message.body.decode())
                            await message_handler(msg)
                    except Exception as e:
                        print(f"Error processing message: {e}", flush=True)
        except aio_pika.AMQPException as e:
            if e.reason == "Channel closed by RPC timeout" or e.reason == "Channel closed by server":
                return
            print("AMQP Exception. reason:"+e.reason, flush=True)

        except Exception as e:
            if e == "Channel closed by RPC timeout":
                return
            print(f"Error with queue iterator: {e}", flush=True)

    async def _handle_process_queue(self, queue: aio_pika.abc.AbstractQueue, message_handler):
        try:
            async with queue.iterator() as queue_iter:
                async for message in queue_iter:
                    try:
                        async with message.process():
                            msg = json.loads(message.body.decode())
                            await message_handler(msg)
                    except Exception as e:
                        print(f"Error processing message: {e}", flush=True)
        except aio_pika.AMQPException as e:
            if e.reason == "Channel closed by RPC timeout" or e.reason == "Channel closed by server":
                return
            print("AMQP Exception. reason:"+e.reason, flush=True)
        except Exception as e:
            print(f"Error with queue iterator: {e}", flush=True)

    async def init_rabbitmq(self, messsage_handler):

        # Create our connection object,
        # passing in the on_open and on_close methods
        conn_uri = os.getenv("RABBITMQ_URI", "amqp://guest:guest@127.0.0.1/")
        self.connection = await aio_pika.connect_robust(
            conn_uri, loop=self.loop,
        )

        self.connection.close_callbacks.add(lambda x, y: print(
            "Client RabbitMQ Connection closed", flush=True))
        print("Client Connected to RabbitMQ", flush=True)

        # Creating channel
        self.run_channel: aio_pika.abc.AbstractRobustChannel = await self.connection.channel()
        self.proc_channel: aio_pika.abc.AbstractRobustChannel = await self.connection.channel()
        self.pub_channel: aio_pika.abc.AbstractRobustChannel = await self.connection.channel()
        # Declaring queue
        audit_exchange = await self.pub_channel.declare_exchange(
            "audit", aio_pika.ExchangeType.TOPIC, durable=True)

        print(f"Client Declared Audit exchange {audit_exchange}", flush=True)

        self.run_queue: aio_pika.abc.AbstractQueue = await self.run_channel.declare_queue(
            "run:"+self.run_id,
            durable=True,
            auto_delete=True,
        )

        self.run_channel
        self.proc_queue: aio_pika.abc.AbstractQueue = await self.proc_channel.declare_queue(
            "process:"+self.process_id,
            durable=True,
            auto_delete=True,
        )

        self.run_exchange = await self.run_channel.declare_exchange('run', aio_pika.ExchangeType.TOPIC, durable=True)
        self.proc_exchange = await self.proc_channel.declare_exchange('process', aio_pika.ExchangeType.TOPIC, durable=True)

        await self.proc_queue.bind(self.proc_exchange, routing_key='runCommand:'+self.process_id)
        await self.run_queue.bind(self.run_exchange, routing_key='runCommand:'+self.run_id)

        self.run_consumer = asyncio.create_task(
            self._handle_run_queue(self.run_queue, messsage_handler))
        self.process_consumer = asyncio.create_task(self._handle_process_queue(
            self.proc_queue, messsage_handler))
        await self.run_exchange.publish(
            aio_pika.Message(
                body=json.dumps({
                    "processId": self.process_id,
                    "runId": self.run_id
                }).encode()
            ),
            routing_key="runnerStarted",
        )

        print("Client Published runnerStarted", flush=True)
        return audit_exchange

    async def destroy(self):
        print("Destroying Client RabbitMQ", flush=True)
        # await self.run_queue.cancel(consumer_tag=self.run_consumer.get_context())
        # print("Client RabbitMQ Destroyed - run_queue", flush=True)
        # await self.proc_queue.cancel(consumer_tag=self.process_consumer)
        # print("Client RabbitMQ Destroyed - proc_queue", flush=True)
        await self.run_channel.close()
        print("Client RabbitMQ Destroyed - run_channel", flush=True)
        await self.proc_channel.close()
        print("Client RabbitMQ Destroyed - proc_channel", flush=True)
        await self.pub_channel.close()
        print("Client RabbitMQ Destroyed - pub_channel", flush=True)

        self.run_consumer.cancel()
        print("Client RabbitMQ Destroyed - run_consumer", flush=True)

        self.process_consumer.cancel()
        print("Client RabbitMQ Destroyed - process_consumer", flush=True)

        await self.connection.close()
        print("Client RabbitMQ Destroyed - connection", flush=True)

        self.loop.stop()
        print("Client RabbitMQ Destroyed", flush=True)
