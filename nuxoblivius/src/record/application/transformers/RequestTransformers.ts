import type { IRequestTransform } from "../../domain/interface/IRequestTransform.js";

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
