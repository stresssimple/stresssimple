import { HttpClientFactory } from './http/HttpClientFactory.js';
import { HttpClientFactoryImpl } from './http/HttpClientFactoryImpl.js';
import { InfluxService } from './influx/influx.service.js';

export abstract class StressTest {
  private httpFactory = new HttpClientFactoryImpl(new InfluxService());

  public interval(): number {
    return 1000;
  }
  public abstract test(userId: string): void;

  public get http(): HttpClientFactory {
    return this.httpFactory;
  }
}
