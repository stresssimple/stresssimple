import { HttpRequestFactory } from './HttpRequestFactory.js';
import { HttpClientSetup } from './HttpClientSetup.js';

export interface HttpClientFactory extends HttpClientSetup<HttpClientFactory> {
  create(): HttpRequestFactory;
}
