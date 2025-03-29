import {
  InfluxDB,
  Point,
  QueryApi,
  WriteApi,
} from '@influxdata/influxdb-client';
import { ctx } from '../run.context.js';

export class InfluxService {
  private readonly influxDB: InfluxDB;
  private readonly org: string;
  private readonly bucket: string;
  private writeApi: WriteApi;

  constructor() {
    const url = process.env['INFLUXDB_URL'] ?? 'http://localhost:8086'; // Change to your InfluxDB URL
    const token = process.env['INFLUXDB_TOKEN'] ?? 'my-secret-token';
    this.org = process.env['INFLUXDB_ORG'] ?? 'my-org';
    this.bucket = process.env['INFLUXDB_BUCKET'] ?? 'test-runs';

    this.influxDB = new InfluxDB({ url, token });
    this.writeApi = this.influxDB.getWriteApi(this.org, this.bucket, 'ns');
  }
  onModuleDestroy() {
    throw new Error('Method not implemented.');
  }

  public queryApi(): QueryApi {
    return this.influxDB.getQueryApi(this.org);
  }

  public async write(
    measurement: string,
    fields: Record<string, number>,
    tags?: Record<string, string>,
  ) {
    await this.writeData(measurement, fields, tags);
  }

  public async writeData(
    measurement: string,
    fields: Record<string, number>,
    tags?: Record<string, string>,
  ) {
    try {
      const point = new Point(measurement);

      if (tags) {
        Object.entries(tags).forEach(([key, value]) => point.tag(key, value));
      }
      Object.entries(fields).forEach(([key, value]) =>
        point.floatField(key, value),
      );

      point.tag('testId', ctx.testId);
      point.tag('runId', ctx.runId);

      this.writeApi.writePoint(point);
      this.writeApi.flush(); // Flush the write buffer to InfluxDB
    } catch (e) {
      console.warn(
        'Failed to write data to InfluxDB',
        measurement,
        fields,
        tags,
      );
    }
  }
}
