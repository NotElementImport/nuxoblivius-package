import { BaseParams } from "./BaseParams.js";
export class QueryParams extends BaseParams<QueryParams> {
  public toString(): string {
    const queryObject = this.toObject();

    if (Object.keys(queryObject).length == 0) {
      return "";
    }

    return `?${new URLSearchParams(queryObject as any)}`;
  }
};

