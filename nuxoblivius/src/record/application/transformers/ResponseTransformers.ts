import type { IResponseTransform } from "../../domain/interface/IResponseTransform.js";
import type { HttpResponse } from "../../domain/valueObject/HttpResponse.js";

/**
 * Convering a Response data to specific template.
 * 
 * @description Converts raw input data into the required format.
 * @example Read a raw Web/Response, and fill information into Framework/HttpResponse.
 * 
 * @test Simple logic, not required to test.
*/
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
