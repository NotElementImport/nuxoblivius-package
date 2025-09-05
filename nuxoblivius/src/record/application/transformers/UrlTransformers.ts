import type { IUrlTransform } from "../../domain/interface/IUrlTransform.js";
import type { PathParams } from "../../domain/valueObject/PathParams.js";
import type { QueryParams } from "../../domain/valueObject/QueryParams.js";

/**
 * Convering a raw url string data to specific template.
 * 
 * @description Converts raw input data into the required format.
 * @example Using to convert custom syntax like: {id} to PathParam value.
 *
 * @test Simple logic, not required to test.
*/
export class UrlTransformers {
  public constructor(
    private list: IUrlTransform[]
  ) { }

  public transform(url: string, pathParams: PathParams, queryParams: QueryParams) {
    for (const transformer of this.getList()) {
      url = transformer.transform(url, pathParams, queryParams);
    }

    return url;
  }

  public getList(): IUrlTransform[] {
    return this.list;
  }
};

