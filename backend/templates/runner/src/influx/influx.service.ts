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

  constructor() {
    const url = process.env['INFLUXDB_URL'] ?? 'http://localhost:8086'; // Change to your InfluxDB URL
    const token = process.env['INFLUXDB_TOKEN'] ?? 'my-secret-token';
    this.org = process.env['INFLUXDB_ORG'] ?? 'my-org';
    this.bucket = process.env['INFLUXDB_BUCKET'] ?? 'test-runs';

    this.influxDB = new InfluxDB({ url, token });
  }
  onModuleDestroy() {
    throw new Error('Method not implemented.');
  }

  public queryApi(): QueryApi {
    return this.influxDB.getQueryApi(this.org);
  }

  public getWriteApi(): WriteApi {
    return this.influxDB.getWriteApi(this.org, this.bucket);
  }

  public async write(
    measurement: string,
    fields: Record<string, number>,
    tags?: Record<string, string>,
  ) {
    const writeApi = this.getWriteApi();
    await this.writeData(writeApi, measurement, fields, tags);
  }

  public async writeData(
    writeApi: WriteApi,
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

      writeApi.writePoint(point);
      await writeApi.flush();
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
