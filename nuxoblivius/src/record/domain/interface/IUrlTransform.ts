import type { PathParams } from "../valueObject/PathParams.js";
import type { QueryParams } from "../valueObject/QueryParams.js";

export interface IUrlTransform {
  transform(url: string, pathParams: PathParams, queryParams: QueryParams): string;
};
