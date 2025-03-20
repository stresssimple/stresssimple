import requests
import uuid
from run_context import ctx
from influx.influx_service import InfluxService
from web.request_factory import HttpRequestFactory


class HttpClientFactory:
    def __init__(self):
        self._base_url = ''
        self._headers = {}
        self.influx = InfluxService()

    def create(self):
        session = requests.Session()
        session.headers.update(self._headers)
        session.headers['X-Test-Id'] = ctx.test_id
        session.headers['X-Run-Id'] = ctx.test_id
        session.headers['X-Request-Id'] = str(uuid.uuid1())
        session.base_url = self._base_url
        return HttpRequestFactory(session, self.influx)

    def base_url(self, url):
        self._base_url = url
        return self

    def headers(self, headers):
        self._headers.update(headers)
        return self

    def header(self, key, value):
        self._headers[key] = value
        return self
