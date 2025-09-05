import type { HttpResponse } from "../valueObject/HttpResponse.js"
import type { QueryParams } from "../valueObject/QueryParams.js"
import type { PathParams } from "../valueObject/PathParams.js"

export interface IRecordModuleContext {
  url: string;
  pathParams: PathParams;
  queryParams: QueryParams;
  headers: Headers;
  options: RequestInit;
}

export interface IRecordModuleRequestContext extends IRecordModuleContext { }

export interface IRecordModuleResponseContext extends IRecordModuleContext {
  response: HttpResponse;
}

export type IBeforeRequestType = void | HttpResponse;

export interface IRecordModule {
  /** Run at once. Launch when module an setup in Record */
  onSetup(): void;
  /** Launch before request, can be canceled if return HttpResponse */
  beforeRequest(context: IRecordModuleRequestContext): IBeforeRequestType;
  /** Launch after request, response context can be modificated */
  afterRequest(context: IRecordModuleResponseContext): void | IRecordModuleResponseContext;
  /** Launch when Core/GarbageService call to clean */
  onClean(): void;
}
