import type { IHttpClient, IHttpRequest } from "../../domain/interface/IHttpClient.js";

export class FetchAPIClient implements IHttpClient {
  public send(request: IHttpRequest): Promise<Response> {
    return fetch(request.url, {
      body: request.body,
      method: request.method,
      headers: request.headers
    });
  }
}

