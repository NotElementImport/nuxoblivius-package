import type { IHttpClient, IHttpRequest, IHttpResponse } from "../../domain/interface/IHttpClient.js";

export class FetchAPIClient implements IHttpClient {
  private async readResponse(response: Response): Promise<IHttpResponse> {
    const headersAsObject = Object.fromEntries(response.headers.entries());

    if (response.status == 204) {
      return {
        url: response.url,
        body: null,
        headers: headersAsObject,
        status: 204,
      }
    }

    const contentType = response.headers.get("content-type") ?? "plain/text";
    var howParseBody = "text";

    if (contentType.startsWith("application/json")) {
      howParseBody = "json";
    }
    else if (contentType.startsWith("image/") || contentType.startsWith("video/") || contentType.startsWith("audio/") || contentType.startsWith("application/")) {
      howParseBody = "blob";
    }
    else if (contentType.startsWith("multipart/form-data")) {
      howParseBody = "formData";
    }

    const body = await response[howParseBody]();

    if (!response.ok) {
      throw {
        url: response.url,
        status: response.status,
        body: body,
        headers: headersAsObject
      };
    }

    return {
      url: response.url,
      status: response.status,
      body: body,
      headers: headersAsObject
    };
  }

  public send(request: IHttpRequest): Promise<IHttpResponse> {
    return fetch(request.url, {
      body: request.body,
      method: request.method,
      headers: request.headers
    }).then(e => {
      return this.readResponse(e);
    });
  }
}
