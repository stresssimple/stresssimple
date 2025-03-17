import axios from 'axios';
import { HttpRequestFactoryImpl } from './HttpRequestFactoryImpl.js';
import { InfluxService } from '../influx/influx.service.js';
import { HttpClientFactory } from './HttpClientFactory.js';
import { HttpRequestFactory } from './HttpRequestFactory.js';
import { ctx } from '../run.context.js';
import { v7 } from 'uuid';

export class HttpClientFactoryImpl implements HttpClientFactory {
  private _baseUrl = '';
  private _headers: { [key: string]: string } = {};

  constructor(private influx: InfluxService) {}

  create(): HttpRequestFactory {
    const client = axios.create({
      baseURL: this._baseUrl,
      headers: this._headers,
    });
    client.interceptors.request.use((config) => {
      config.headers['X-Test-Id'] = ctx.testId;
      config.headers['X-Run-Id'] = ctx.testId;
      config.headers['X-Request-Id'] = v7();
      return config;
    });
    return new HttpRequestFactoryImpl(client, this.influx);
  }

  public baseUrl(url: string): HttpClientFactory {
    this._baseUrl = url;
    return this;
  }

  headers(headers: { [key: string]: string }): HttpClientFactory {
    for (const key in headers) {
      this._headers[key] = headers[key];
    }
    return this;
  }

  header(key: string, value: string): HttpClientFactory {
    this._headers[key] = value;
    return this;
  }
}
