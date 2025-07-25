import type { IUrlTransform } from "../../domain/interface/IUrlTransform.js";
import type { PathParams } from "../../domain/valueObject/PathParams.js";

export class UrlTransformers {
  public constructor(
    private list: IUrlTransform[]
  ) { }

  public transform(url: string, pathParams: PathParams) {
    for (const transformer of this.list) {
      url = transformer.transform(url, pathParams);
    }

    return url;
  }

  public getList(): IUrlTransform[] {
    return this.list;
  }
};

