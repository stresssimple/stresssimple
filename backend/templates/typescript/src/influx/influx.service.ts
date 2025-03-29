import {
  InfluxDB,
  Point,
  QueryApi,
  WriteApi,
} from '@influxdata/influxdb-client';
import { ctx } from '../run.context.js';
export class InfluxRecord {
  constructor(
    public measurement: string,
    public fields: Record<string, number>,
    public tags?: Record<string, string>,
  ) {}
}
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

  public async writeData(points: InfluxRecord[]) {
    try {
      for (const point of points) {
        const influxPoint = new Point(point.measurement);
        const { fields, tags } = point;

        // Add fields to the point
        for (const [key, value] of Object.entries(fields)) {
          influxPoint.floatField(key, value);
        }

        // Add tags to the point if they exist
        if (tags) {
          for (const [key, value] of Object.entries(tags)) {
            influxPoint.tag(key, value);
          }
        }

        influxPoint.tag('testId', ctx.testId);
        influxPoint.tag('runId', ctx.runId);

        this.writeApi.writePoint(influxPoint);
      }
      await this.writeApi.flush(); // Flush the write buffer to InfluxDB
    } catch (e) {
      console.warn('Failed to write data to InfluxDB');
    }
  }
}
