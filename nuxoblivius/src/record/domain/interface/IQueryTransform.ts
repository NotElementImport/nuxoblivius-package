import type { QueryParams } from "../valueObject/QueryParams.js";

export interface IQueryTransform {
  transform(url: URL, queryParams: QueryParams): string;
};
