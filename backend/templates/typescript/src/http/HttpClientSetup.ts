export interface HttpClientSetup<Factory> {
  baseUrl(url: string): Factory;
  headers(headers: { [key: string]: string }): Factory;
  header(key: string, value: string): Factory;
}
