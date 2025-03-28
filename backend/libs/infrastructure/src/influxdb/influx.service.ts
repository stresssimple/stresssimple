import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { InfluxDB, Point, QueryApi } from '@influxdata/influxdb-client';

@Injectable()
export class InfluxService implements OnModuleDestroy {
  private influxDB: InfluxDB;
  private writeApi;
  private _org: string;

  constructor() {
    const url = process.env['INFLUXDB_URL']; // 'http://localhost:8086'; // Change to your InfluxDB URL
    const token = process.env['INFLUXDB_TOKEN']; // 'my-secret-token';
    this._org = process.env['INFLUXDB_ORG']; //'my-org';
    const bucket = process.env['INFLUXDB_BUCKET']; //'my-bucket';

    this.influxDB = new InfluxDB({ url, token });
    this.writeApi = this.influxDB.getWriteApi(this._org, bucket);
  }

  public get queryApi(): QueryApi {
    return this.influxDB.getQueryApi(this._org);
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

      this.writeApi.writePoint(point);
      await this.writeApi.flush();
    } catch (e) {
      console.warn(
        'Failed to write data to InfluxDB',
        measurement,
        fields,
        tags,
      );
    }
  }

  onModuleDestroy() {
    this.writeApi.close().catch(console.error);
  }
}
