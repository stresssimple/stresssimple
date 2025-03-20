from influxdb_client import InfluxDBClient, Point
from run_context import ctx
import os

class InfluxService:
    def __init__(self):
        url = os.getenv('INFLUXDB_URL', 'http://localhost:8086')  # Change to your InfluxDB URL
        token = os.getenv('INFLUXDB_TOKEN', 'my-secret-token')
        self.org = os.getenv('INFLUXDB_ORG', 'my-org')
        self.bucket = os.getenv('INFLUXDB_BUCKET', 'test-runs')

        self.influxDB = InfluxDBClient(url=url, token=token)

    def query_api(self):
        return self.influxDB.query_api()

    def get_write_api(self):
        return self.influxDB.write_api()

    async def write(self, measurement: str, fields: dict, tags: dict = None):
        write_api = self.get_write_api()
        await self.write_data(write_api, measurement, fields, tags)

    async def write_data(self, write_api, measurement: str, fields: dict, tags: dict = None):
        try:
            point = Point(measurement)

            if tags:
                for key, value in tags.items():
                    point.tag(key, value)

            for key, value in fields.items():
                point.field(key, value)

            point.tag('testId', ctx.test_id)
            point.tag('runId', ctx.run_id)

            write_api.write(bucket=self.bucket, org=self.org, record=point)
            write_api.flush()
        except Exception as e:
            print(f"Failed to write data to InfluxDB: {measurement}, {fields}, {tags}")
            print(e)
