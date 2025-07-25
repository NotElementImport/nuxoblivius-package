import { RequestTransformers } from "../application/transformers/RequestTransformers.js";
import { ResponseTransformers } from "../application/transformers/ResponseTransformers.js";
import { UrlTransformers } from "../application/transformers/UrlTransformers.js";
import { FetchUseCase } from "../application/useCase/FetchUseCase.js";
import { IHttpRequest } from "../domain/interface/IHttpClient.js";
import { PathParams } from "../domain/valueObject/PathParams.js";
import { FetchAPIClient } from "../infrastructure/httpClient/FetchAPIClient.js";
import { DefaultRequestTransform } from "../infrastructure/requestTransform/DefaultRequestTransform.js";
import { DefaultResponseTransform } from "../infrastructure/responseTransform/DefaultResponseTransform.js";
import { DefaultUrlTransform } from "../infrastructure/urlTransform/DefaultUrlTransform.js";

export interface IRecordConfig {
  requestTransformer?: RequestTransformers,
  responseTransformer?: ResponseTransformers,
  urlTransformers?: UrlTransformers,
};

export class Record {
  private fetchUseCase: FetchUseCase;
  private readonly requestTransformers: RequestTransformers;
  private readonly responseTransformers: ResponseTransformers;
  private readonly urlTransformers: UrlTransformers;

  public constructor(private url: string, config?: IRecordConfig) {
    this.requestTransformers = config?.requestTransformer ?? new RequestTransformers([]);
    this.responseTransformers = config?.responseTransformer ?? new ResponseTransformers([]);
    this.urlTransformers = config?.urlTransformers ?? new UrlTransformers([]);

    this.requestTransformers.getList().unshift(
      new DefaultRequestTransform()
    );

    this.responseTransformers.getList().unshift(
      new DefaultResponseTransform()
    );

    this.urlTransformers.getList().push(
      new DefaultUrlTransform()
    );

    this.fetchUseCase = new FetchUseCase(
      new FetchAPIClient(),
      this.requestTransformers,
      this.responseTransformers
    );
  }

  private createRequestInit(): IHttpRequest {
    return {
      url: this.urlTransformers.transform(this.url, new PathParams({})),
      method: "GET"
    };
  }

  public async get() {
    return this.fetchUseCase.send({
      ...this.createRequestInit(),
      method: "GET"
    });
  }

  public post() {
    return this.fetchUseCase.send({
      ...this.createRequestInit(),
      method: "POST"
    });
  }

  public put() {
    return this.fetchUseCase.send({
      ...this.createRequestInit(),
      method: "PUT"
    });
  }

  public patch() {
    return this.fetchUseCase.send({
      ...this.createRequestInit(),
      method: "PATCH"
    });
  }

  public delete() {
    return this.fetchUseCase.send({
      ...this.createRequestInit(),
      method: "DELETE"
    });
  }
};
