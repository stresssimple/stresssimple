import { InfluxService } from './influx/influx.service.js';
import { HttpClientFactoryImpl } from './http/HttpClientFactoryImpl.js';
import { HttpClientFactory } from './http/HttpClientFactory.js';

export class Stress {
  private readonly influxService = new InfluxService();
  private httpFactory = new HttpClientFactoryImpl(this.influxService);

  public get Http(): HttpClientFactory {
    return this.httpFactory;
  }
}

export const stress = new Stress();
