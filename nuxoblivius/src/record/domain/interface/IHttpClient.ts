export type IHttpMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface IHttpRequest {
  url: string;
  headers?: Record<string, string>;
  body?: string | FormData;
  method: IHttpMethods,
};

export interface IHttpClient {
  send(request: IHttpRequest): Promise<Response>;
};
