import type { IHttpClient, IHttpRequest } from "../../domain/interface/IHttpClient.js";
import { HttpResponse } from "../../domain/valueObject/HttpResponse.js"
import type { PathParams } from "../../domain/valueObject/PathParams.js";
import type { QueryParams } from "../../domain/valueObject/QueryParams.js";
import type { RecordModuleTransformers } from "../transformers/RecordModuleTransformers.js";
import type { RequestTransformers } from "../transformers/RequestTransformers.js";
import type { ResponseTransformers } from "../transformers/ResponseTransformers.js";

interface IFetchSendContext {
  pathParams: PathParams;
  queryParams: QueryParams;
}

/**
 * 
 * @description Makes a request to the specified url. Also performs normalization for Request and Response objects.
 * @example SOAP/REST-API request, or getting Media.
 *
 * @test Covered by embedded tests.
*/
export class FetchUseCase {
  public constructor(
    private readonly httpClient: IHttpClient, // Makes an Web/HTTP request and returns the Web/Response
    private readonly recordModules: RecordModuleTransformers,
    private readonly requestTransformers: RequestTransformers, // Converts input data into the required format according to a template
    private readonly responseTransformers: ResponseTransformers, // Decodes output data according to a specific template
  ) { }

  public async send(request: IHttpRequest, context: IFetchSendContext): Promise<HttpResponse> {
    // Convert input data by template
    const v8RequestInit: IHttpRequest = this.requestTransformers.transform(
      request
    ) as IHttpRequest;

    const moduleResponse = this.recordModules.beforeRequest({
      headers: v8RequestInit.headers as any,
      options: v8RequestInit as RequestInit,
      pathParams: context.pathParams,
      queryParams: context.queryParams,
      url: request.url
    });

    if (moduleResponse) {
      return moduleResponse;
    }

    // Do a http request
    const v8Response: Response = await this.httpClient.send(v8RequestInit);

    // Create Framework/Response
    const tempFrameworkResponse = new HttpResponse({
      headers: v8Response.headers,
      status: v8Response.status,
    });

    // Decodes output data by template
    const finalResponse = await this.responseTransformers.transform(
      tempFrameworkResponse, v8Response
    );

    this.recordModules.afterRequest({
      headers: finalResponse.getHeaders(),
      options: v8RequestInit as RequestInit,
      pathParams: context.pathParams,
      queryParams: context.queryParams,
      url: request.url,
      response: finalResponse
    });

    return finalResponse;
  }
};
