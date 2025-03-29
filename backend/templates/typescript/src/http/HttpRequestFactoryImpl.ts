import { AxiosError, AxiosInstance } from 'axios';
import { InfluxService } from '../influx/influx.service.js';
import { HttpRequestFactory } from './HttpRequestFactory.js';
import { HttpResponse } from './HttpResponse.js';
import { ctx } from '../run.context.js';
import { auditProxy } from '../audit.proxy.js';

export class HttpRequestFactoryImpl implements HttpRequestFactory {
  private _url = '';
  private _body: unknown;
  private _method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  private _name?: string;
  private _successOn: number[] = [];
  private _failOn: number[] = [];

  constructor(
    private client: AxiosInstance,
    private influx: InfluxService,
  ) {}

  public get(url: string): HttpRequestFactory {
    this._url = url;
    this._method = 'GET';
    return this;
  }

  public post(url: string, body: unknown): HttpRequestFactory {
    this._url = url;
    this._body = body;
    this._method = 'POST';
    return this;
  }
  public put(url: string, body: unknown): HttpRequestFactory {
    this._url = url;
    this._body = body;
    this._method = 'PUT';
    return this;
  }
  public delete(url: string): HttpRequestFactory {
    this._url = url;
    this._method = 'DELETE';
    return this;
  }

  public name(name: string): HttpRequestFactory {
    this._name = name;
    return this;
  }

  public successOn(status: number): HttpRequestFactory {
    if (this._failOn.includes(status)) {
      throw new Error(`Status ${status} already set as failOn`);
    }

    this._successOn.push(status);
    return this;
  }

  public failOn(status: number): HttpRequestFactory {
    if (this._successOn.includes(status)) {
      throw new Error(`Status ${status} already set as successOn`);
    }

    this._failOn.push(status);
    return this;
  }

  public async send(
    successCheck?: (response: HttpResponse) => boolean,
  ): Promise<HttpResponse> {
    const result: HttpResponse = {};
    try {
      if (!this._method) {
        throw new Error('Method not set');
      }
      let isSuccessful = false;
      const start = process.hrtime.bigint();
      const request = {
        url: this._url,
        method: this._method,
        data: this._body,
      };
      try {
        const response = await this.client.request(request);

        if (response) {
          if (response.status) {
            result.status = response.status;
          }
          if (response.statusText) {
            result.statusText = response.statusText;
          }
          if (response.data) {
            result.body = response.data;
          }
          if (response.headers) {
            result.headers = response.headers;
          }
        }

        isSuccessful =
          (result.status && !this._failOn.includes(result.status)) || false;
      } catch (e: unknown) {
        const error = e as AxiosError;
        if (error.response) {
          if (error.response.status) {
            result.status = error.response.status;
          }
          if (error.response.data) {
            result.body = error.response.data;
          }
          if (error.response.headers) {
            result.headers = error.response.headers;
          }
        }
        isSuccessful =
          (result.status && this._successOn.includes(result.status)) || false;
      } finally {
        if (successCheck) isSuccessful = successCheck(result);
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1e9;

        await this.trace(duration, isSuccessful, result.status);
        await this.audit(request, result, duration, isSuccessful);
      }
    } catch (error) {
      console.log(error);
    }
    return result;
  }

  private async audit(
    request: {
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      data: unknown;
    },
    result: HttpResponse,
    duration: number,
    success: boolean,
  ) {
    const record: any = {
      runId: ctx.runId,
      baseUrl: this.client.defaults.baseURL,
      name: this._name ?? 'No name',
      duration,
      path: request.url,
      method: request.method,
      requestHeaders: JSON.stringify(this.client.defaults.headers.common),
      responseHeaders: JSON.stringify(result.headers),
      status: result.status ?? 0,
      statusDescription: result.statusText ?? '',
      success,
    };
    if (typeof request.data === 'object') {
      record.requestBody = JSON.stringify(request.data);
    } else {
      record.requestBody = request.data?.toString();
    }

    if (typeof result.body === 'object') {
      record.responseBody = JSON.stringify(result.body);
    } else {
      record.responseBody = result.body?.toString();
    }

    if (auditProxy) {
      auditProxy.audit(record, success);
    }
  }

  private async trace(
    duration: number,
    isSuccessful: boolean,
    status: number | undefined,
  ): Promise<void> {
    await this.influx.writeData(
      'http_request',
      {
        duration,
        success: isSuccessful ? 1 : 0,
      },
      {
        status: status?.toString() ?? '',
        testId: ctx.testId,
        runId: ctx.runId,
        name: this._name ?? 'No name',
      },
    );
  }

  baseUrl(url: string): HttpRequestFactory {
    this.client.defaults.baseURL = url;
    return this;
  }

  headers(headers: { [key: string]: string }): HttpRequestFactory {
    for (const key in headers) {
      this.client.defaults.headers.common[key] = headers[key];
    }
    return this;
  }
  header(key: string, value: string): HttpRequestFactory {
    this.client.defaults.headers.common[key] = value;
    return this;
  }
}
