import { HttpResponse } from './HttpResponse.js';
import { HttpClientSetup } from './HttpClientSetup.js';

export interface HttpRequestFactory
  extends HttpClientSetup<HttpRequestFactory> {
  get(url: string): HttpRequestFactory;
  post(url: string, body: unknown): HttpRequestFactory;
  put(url: string, body: unknown): HttpRequestFactory;
  delete(url: string): HttpRequestFactory;
  name(name: string): HttpRequestFactory;
  successOn(status: number): HttpRequestFactory;
  failOn(status: number): HttpRequestFactory;
  send(
    successCheck?: ((response: HttpResponse) => boolean) | undefined,
  ): Promise<HttpResponse>;
}
