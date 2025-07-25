import type { IHttpClient, IHttpRequest } from "../../domain/interface/IHttpClient.js";
import { HttpResponse } from "../../domain/valueObject/HttpResponse.js"
import { RequestTransformers } from "../transformers/RequestTransformers.js";
import { ResponseTransformers } from "../transformers/ResponseTransformers.js";

export class FetchUseCase {
  public constructor(
    private httpClient: IHttpClient,
    private requestTransformers: RequestTransformers,
    private responseTransformers: ResponseTransformers,
  ) { }

  public async send(request: IHttpRequest): Promise<HttpResponse> {
    const finalRequestInit: IHttpRequest = this.requestTransformers.transform(
      request
    ) as IHttpRequest;

    const response: Response = await this.httpClient.send(finalRequestInit);

    const finalResponse = new HttpResponse(
      response.url,
      response.headers,
      undefined,
      response.status,
      response.ok
    );

    return await this.responseTransformers.transform(
      finalResponse, response
    );
  }
};
