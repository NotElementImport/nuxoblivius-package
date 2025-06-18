import type { IObservable } from "../../../core/domain/interface/IObservable.js";

export type MetaConfig = {
  observer?: IObservable;
  noEmit?: boolean;
};

export interface IPaginationType<T> {
  next(options?: MetaConfig): void;
  prev(options?: MetaConfig): void;
  toFirst(options?: MetaConfig): void;
  toLast(options?: MetaConfig): void;

  getMeta(): T;
  setMeta(value: T, options?: MetaConfig): void

  getCurrent(): number;
  setCurrent(value: number, options?: MetaConfig): void;
};
