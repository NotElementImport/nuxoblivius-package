import { IPaginationType, MetaConfig } from "../../domain/interface/IPagination";

export type PageMetaType = {
  offset: number;
  perPage: number;
  maxCount: number;
};

export class OffsetType implements IPaginationType<PageMetaType> {
  private offset: number = 0;
  private perPage: number = 0;
  private maxCount: number = 0;

  private get edgeOfEnd() {
    return this.maxCount - this.perPage;
  }

  private tryEmit(options?: MetaConfig) {
    const isCanEmit = !(options?.noEmit ?? false);

    if (isCanEmit && options?.observer) {
      options.observer.dispatch(null);
    }
  }

  public next(options: MetaConfig = {}): void {
    if (this.offset < this.edgeOfEnd) {
      this.offset = this.offset + this.perPage;

      this.tryEmit(options);
    }
  }

  public prev(options: MetaConfig = {}): void {
    if (this.offset > 0) {
      this.offset = this.offset - this.perPage;

      if (this.offset < 0) {
        this.offset = 0;
      }

      this.tryEmit(options);
    }
  }

  public toFirst(options: MetaConfig = {}): void {
    if (this.offset != 0) {
      this.offset = 0;

      this.tryEmit(options);
    }
  }

  public toLast(options?: MetaConfig): void {
    if (this.offset != this.edgeOfEnd) {
      this.offset = this.edgeOfEnd;

      this.tryEmit(options);
    }
  }

  public getMeta(): Readonly<PageMetaType> {
    const pageTypeContext = this;

    return {
      get perPage() {
        return pageTypeContext.perPage;
      },
      get offset() {
        return pageTypeContext.offset;
      },
      get maxCount() {
        return pageTypeContext.maxCount;
      }
    };
  }

  public setMeta(value: PageMetaType, options?: MetaConfig): void {
    this.offset = value.offset;
    this.perPage = value.perPage;
    this.maxCount = value.maxCount;

    this.tryEmit(options);
  }

  public getCurrent(): number {
    return this.offset;
  }

  public setCurrent(value: number, options?: MetaConfig): void {
    this.offset = this.perPage * value;
    this.tryEmit(options);
  }
};
