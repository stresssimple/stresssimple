export const extraLibs = `
declare interface HttpResponse {
    status: number;
    body: any;
    headers: any;
}

declare interface HttpRequestFactory
  extends HttpClientSetup<HttpRequestFactory> {
  get(url: string): HttpRequestFactory;
  post(url: string, body: unknown): HttpRequestFactory;
  put(url: string, body: unknown): HttpRequestFactory;
  delete(url: string): HttpRequestFactory;
  name(name: string): HttpRequestFactory;
  successOn(status: number): HttpRequestFactory;
  failOn(status: number): HttpRequestFactory;
  send(
    successCheck?: (response: HttpResponse) => boolean | undefined
  ): Promise<HttpResponse>;
}

declare interface HttpClientSetup<Factory> {
    baseUrl(url: string): Factory;
    headers(headers: {
        [key: string]: string;
    }): Factory;
    header(key: string, value: string): Factory;
}

declare interface HttpClientFactory extends HttpClientSetup<HttpClientFactory> {
    create(): HttpRequestFactory;
}

`;

export const extraFiles = [
	{
		content: `
export abstract class StressTest {
  public interval(): number {
    return 1000;
  }
  public abstract test(userId: string): void;

  public http: HttpClientFactory;
}`,
		fileName: 'inmemory://model/StressTest.js'
	}
];
