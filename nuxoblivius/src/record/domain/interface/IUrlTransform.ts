import type { PathParams } from "../valueObject/PathParams.js";

export interface IUrlTransform {
  transform(url: string, pathParams: PathParams): string;
};
