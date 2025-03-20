import time
import json
import requests
from influxdb_client import InfluxDBClient, WriteApi
from run_context import ctx  # Assuming a similar context module exists


class HttpRequestFactory:
    def __init__(self, client: requests.Session, influx: InfluxDBClient):
        self.client = client
        self.influx = influx
        self._url = ''
        self._body = None
        self._method = None
        self._name = None
        self._success_on = []
        self._fail_on = []

    def get(self, url: str):
        self._url = url
        self._method = 'GET'
        return self

    def post(self, url: str, body: dict):
        self._url = url
        self._body = body
        self._method = 'POST'
        return self

    def put(self, url: str, body: dict):
        self._url = url
        self._body = body
        self._method = 'PUT'
        return self

    def delete(self, url: str):
        self._url = url
        self._method = 'DELETE'
        return self

    def name(self, name: str):
        self._name = name
        return self

    def success_on(self, status: int):
        if status in self._fail_on:
            raise ValueError(f"Status {status} already set as failOn")
        self._success_on.append(status)
        return self

    def fail_on(self, status: int):
        if status in self._success_on:
            raise ValueError(f"Status {status} already set as successOn")
        self._fail_on.append(status)
        return self

    async def send(self, success_check=None):
        result = {}
        try:
            if not self._method:
                raise ValueError("Method not set")

            start = time.time()
            request_data = {
                "url": self._url,
                "method": self._method,
                "json": self._body
            }

            try:
                response = await self.client.request(**request_data)
                result.update({
                    "status": response.status_code,
                    "statusText": response.reason,
                    "body": response.json() if response.content else None,
                    "headers": dict(response.headers)
                })
                is_successful = result["status"] not in self._fail_on
            except requests.RequestException as e:
                result.update({"status": None, "body": str(e), "headers": {}})
                is_successful = False

            if success_check:
                is_successful = success_check(result)

            duration = time.time() - start
            await self.trace(duration, is_successful, result.get("status"))
            self.audit(request_data, result, duration, is_successful)
        except Exception as e:
            print(e)
        return result

    def audit(self, request, result, duration, success):
        record = {
            "runId": ctx.run_id,
            "baseUrl": self.client.base_url,
            "name": self._name or "No name",
            "duration": duration,
            "path": request["url"],
            "method": request["method"],
            "requestHeaders": json.dumps(self.client.headers),
            "responseHeaders": json.dumps(result.get("headers", {})),
            "status": result.get("status", 0),
            "statusDescription": result.get("statusText", ""),
            "success": success,
            "requestBody": json.dumps(request.get("json", {})),
            "responseBody": json.dumps(result.get("body", {}))
        }
        ctx.redis_pub.publish("audit", json.dumps(record))

    async def trace(self, duration, is_successful, status):
        data = {
            "measurement": "http_request",
            "tags": {
                "status": str(status) if status else "",
                "testId": ctx.test_id,
                "runId": ctx.run_id,
                "name": self._name or "No name"
            },
            "fields": {
                "duration": float(duration),
                "success": float(1 if is_successful else 0)
            }
        }
        await self.influx.write(data['measurement'], data['fields'], data['tags'])

    def base_url(self, url: str):
        self.client.base_url = url
        return self

    def headers(self, headers: dict):
        self.client.headers.update(headers)
        return self

    def header(self, key: str, value: str):
        self.client.headers[key] = value
        return self
