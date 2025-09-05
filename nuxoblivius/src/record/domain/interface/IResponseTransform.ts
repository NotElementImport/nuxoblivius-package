import { HttpResponse } from "../valueObject/HttpResponse.js";

export interface IResponseTransform {
  transform(response: HttpResponse, originalResponse: Response): Promise<HttpResponse>;
};
