import { asToken } from "../../Core/interface/IContainer.js";

export interface PropInfoBasic extends PropInfo {
  readonly value: unknown;
};

export interface PropInfo {
  readonly propName: string;
  readonly value?: unknown;
  get?: () => unknown;
  set?: (value: unknown) => void;

  isBasicType(): this is PropInfoBasic;
};

export interface IPropReader {
  getPropsFrom(object: object): Iterable<PropInfo>;
};

export const IPropReaderToken = asToken<IPropReader>();
