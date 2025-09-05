import type { IRequestTransform } from "../../domain/interface/IRequestTransform.js";

/**
 * Convering a RequestInit data to specific template.
 * 
 * @description Converts raw input data into the required format.
 * @example Auto convert JSObject to JSON string. And set header.
 * 
 * @test Simple logic, not required to test.
*/
export class RequestTransformers {
  public constructor(
    private list: IRequestTransform[]
  ) { }

  public transform(request: RequestInit) {
    for (const transformer of this.list) {
      request = transformer.transform(request);
    }

    return request;
  }

  public getList(): IRequestTransform[] {
    return this.list;
  }
};
