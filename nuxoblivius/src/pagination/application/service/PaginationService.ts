import type { IObservable } from "../../../core/domain/interface/IObservable.js";
import type { IPaginationType } from "../../domain/interface/IPagination.js";

export interface IOptions {
  noEmit?: boolean
};

export class PaginationService<T> {
  public constructor(
    private readonly type: IPaginationType<T>,
    private readonly observable?: IObservable
  ) { }

  public next(options: IOptions = {}): void {
    this.type.next({
      observer: this.observable,
      noEmit: options.noEmit
    });
  }

  public prev(options: IOptions = {}): void {
    this.type.prev({
      observer: this.observable,
      noEmit: options.noEmit
    });
  }

  public toFirst(options: IOptions = {}): void {
    this.type.toFirst({
      observer: this.observable,
      noEmit: options.noEmit
    });
  }

  public toLast(options: IOptions = {}): void {
    this.type.toLast({
      observer: this.observable,
      noEmit: options.noEmit
    });
  }

  public setCurrent(value: number, options: IOptions = {}): void {
    this.type.setCurrent(value, {
      observer: this.observable,
      noEmit: options.noEmit
    });
  }

  public getCurrent(): number {
    return this.type.getCurrent();
  }

  public setMeta(value: T, options: IOptions = {}): void {
    this.type.setMeta(value, {
      observer: this.observable,
      noEmit: options.noEmit
    });
  }

  public getMeta(): T {
    return this.type.getMeta();
  }
};
