import { HttpClientFactory } from './http/HttpClientFactory.js';
import { HttpClientFactoryImpl } from './http/HttpClientFactoryImpl.js';

export abstract class StressTest {
  private httpFactory = new HttpClientFactoryImpl();

  public interval(): number {
    return 1000;
  }
  public abstract test(userId: string): void;

  public get http(): HttpClientFactory {
    return this.httpFactory;
  }
}
