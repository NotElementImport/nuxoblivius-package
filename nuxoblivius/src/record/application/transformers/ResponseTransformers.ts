import type { IResponseTransform } from "../../domain/interface/IResponseTransform.js";
import type { HttpResponse } from "../../domain/valueObject/HttpResponse.js";

export class ResponseTransformers {
  public constructor(
    private list: IResponseTransform[]
  ) { }

  public async transform(response: HttpResponse, originalResponse: Response) {
    for (const transformer of this.list) {
      response = await transformer.transform(response, originalResponse);
    }

    return response;
  }

  public getList(): IResponseTransform[] {
    return this.list;
  }
};
