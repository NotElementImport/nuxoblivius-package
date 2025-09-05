import { RecordModuleTransformers } from "../application/transformers/RecordModuleTransformers.js";
import { RequestTransformers } from "../application/transformers/RequestTransformers.js";
import { ResponseTransformers } from "../application/transformers/ResponseTransformers.js";
import { UrlTransformers } from "../application/transformers/UrlTransformers.js";
import { FetchUseCase } from "../application/useCase/FetchUseCase.js";
import { IHttpRequest } from "../domain/interface/IHttpClient.js";
import { HttpResponse } from "../domain/valueObject/HttpResponse.js";
import { PathParams } from "../domain/valueObject/PathParams.js";
import { QueryParams } from "../domain/valueObject/QueryParams.js";
import { FetchAPIClient } from "../infrastructure/httpClient/FetchAPIClient.js";
import { DefaultRequestTransform } from "../infrastructure/requestTransform/DefaultRequestTransform.js";
import { DefaultResponseTransform } from "../infrastructure/responseTransform/DefaultResponseTransform.js";
import { DefaultUrlTransform } from "../infrastructure/urlTransform/DefaultUrlTransform.js";

export interface IRecordConfig {
  requestTransformer?: RequestTransformers;
  responseTransformer?: ResponseTransformers;
  modules: RecordModuleTransformers;
  urlTransformers?: UrlTransformers;
  queryParams?: QueryParams;
  pathParams?: PathParams;
};

export class Record {
  private _fetchUseCase: FetchUseCase;
  private readonly _urlTransformers: UrlTransformers;
  private readonly _queryParams: QueryParams;
  private readonly _pathParams: PathParams;

  public constructor(private _url: string, config?: IRecordConfig) {
    const requestTransformers = config?.requestTransformer ?? new RequestTransformers([]);
    const responseTransformers = config?.responseTransformer ?? new ResponseTransformers([]);
    const recordModuleTransformers = config?.modules ?? new RecordModuleTransformers([]);

    this._urlTransformers = config?.urlTransformers ?? new UrlTransformers([]);
    this._queryParams = config?.queryParams ?? new QueryParams({});
    this._pathParams = config?.pathParams ?? new PathParams({});

    requestTransformers.getList().unshift(
      new DefaultRequestTransform()
    );

    responseTransformers.getList().unshift(
      new DefaultResponseTransform()
    );

    this._urlTransformers.getList().push(
      new DefaultUrlTransform()
    );

    this._fetchUseCase = new FetchUseCase(
      new FetchAPIClient(),
      recordModuleTransformers,
      requestTransformers,
      responseTransformers
    );
  }

  private createRequestInit() {
    return {
      url: this._urlTransformers.transform(
        this._url,
        this._pathParams,
        this._queryParams
      ),
    } as IHttpRequest;
  }

  private generateContext() {
    return {
      pathParams: this._pathParams,
      queryParams: this._queryParams
    }
  }

  public async get() {
    return this._fetchUseCase.send({
      ...this.createRequestInit(),
      method: "GET"
    }, this.generateContext());
  }

  public post() {
    return this._fetchUseCase.send({
      ...this.createRequestInit(),
      method: "POST"
    }, this.generateContext());
  }

  public put() {
    return this._fetchUseCase.send({
      ...this.createRequestInit(),
      method: "PUT"
    }, this.generateContext());
  }

  public patch() {
    return this._fetchUseCase.send({
      ...this.createRequestInit(),
      method: "PATCH"
    }, this.generateContext());
  }

  public delete() {
    return this._fetchUseCase.send({
      ...this.createRequestInit(),
      method: "DELETE"
    }, this.generateContext());
  }
};
