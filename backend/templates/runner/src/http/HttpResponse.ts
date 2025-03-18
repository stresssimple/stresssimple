import { RawAxiosResponseHeaders, AxiosResponseHeaders } from 'axios';

export interface HttpResponse {
  status?: number;
  statusText?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  headers?: RawAxiosResponseHeaders | AxiosResponseHeaders;
  code?: string;
}
