import type { IPaginationType, MetaConfig } from "../../domain/interface/IPagination.js";

export type PageMetaType = {
  page: number;
  perPage: number;
  lastPage: number;
};

export class PageType implements IPaginationType<PageMetaType> {
  private page: number = 0;
  private perPage: number = 0;
  private lastPage: number = 0;

  private tryEmit(options?: MetaConfig) {
    const isCanEmit = !(options?.noEmit ?? false);

    if (isCanEmit && options?.observer) {
      options.observer.dispatch(null);
    }
  }

  public next(options: MetaConfig = {}): void {
    if (this.page < this.lastPage) {
      this.page = this.page + 1;

      this.tryEmit(options);
    }
  }

  public prev(options: MetaConfig = {}): void {
    if (this.page > 1) {
      this.page = this.page - 1;

      this.tryEmit(options);
    }
  }

  public toFirst(options: MetaConfig = {}): void {
    if (this.page != 1) {
      this.page = 1;

      this.tryEmit(options);
    }
  }

  public toLast(options?: MetaConfig): void {
    if (this.page != this.lastPage) {
      this.page = this.lastPage;

      this.tryEmit(options);
    }
  }

  public getMeta(): Readonly<PageMetaType> {
    const pageTypeContext = this;

    return {
      get perPage() {
        return pageTypeContext.perPage;
      },
      get page() {
        return pageTypeContext.page;
      },
      get lastPage() {
        return pageTypeContext.lastPage;
      }
    };
  }

  public setMeta(value: PageMetaType, options?: MetaConfig): void {
    this.page = value.page;
    this.perPage = value.perPage;
    this.lastPage = value.lastPage;

    this.tryEmit(options);
  }

  public getCurrent(): number {
    return this.page;
  }

  public setCurrent(value: number, options?: MetaConfig): void {
    this.page = value;
    this.tryEmit(options);
  }
};
