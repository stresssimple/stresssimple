import { HttpClientFactoryImpl } from './http/HttpClientFactoryImpl.js';
import { HttpClientFactory } from './http/HttpClientFactory.js';

export class Stress {
  private httpFactory = new HttpClientFactoryImpl();

  public get Http(): HttpClientFactory {
    return this.httpFactory;
  }
}

export const stress = new Stress();
