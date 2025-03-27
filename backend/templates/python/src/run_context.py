import aio_pika


class RunContent:
    def __init__(self):
        self.run_id: str = ""
        self.test_id: str = ""
        self.audit_exchange: aio_pika.abc.AbstractExchange = None


ctx = RunContent()
