import type { IPaginationType } from "../../../pagination/domain/interface/IPagination";
import type { IBeforeRequestType, IRecordModule, IRecordModuleRequestContext, IRecordModuleResponseContext } from "../../domain/interface/IRecordModule";
import type { HttpResponse } from "../../domain/valueObject/HttpResponse";

interface IPaginationRecordModuleConfig<T> {
  readonly paginator: IPaginationType<T>;
  readonly updateMeta: (paginator: IPaginationType<T>, context: IRecordModuleResponseContext) => void;
}

interface IPartialPaginationRecordModuleConfig {
  readonly toFirstWhen?: (context: IRecordModuleRequestContext) => boolean;
  readonly enableWhen?: (context: IRecordModuleRequestContext) => boolean;

  readonly perPageName?: string;
  readonly pageName?: string;
}

export class PaginationRecordModule<T> implements IRecordModule {
  public constructor(
    private readonly _config: IPaginationRecordModuleConfig<T> & IPartialPaginationRecordModuleConfig
  ) { }

  public onSetup(): void { }

  public beforeRequest(context: IRecordModuleRequestContext): IBeforeRequestType {
    // Reset pagination when request:
    if (this._config.toFirstWhen?.(context)) {
      this._config.paginator.toFirst({ noEmit: true });
    }

    const queryPageName = this._config.pageName ?? "page";
    const queryPerPageName = this._config.perPageName ?? "per-page";

    const isEnabled = this._config.enableWhen?.(context) ?? true;

    if (isEnabled) {
      context.queryParams.set(
        queryPageName,
        this._config.paginator.getCurrent()
      );

      const perPageValue = (this._config.paginator.getMeta() as any).perPage;

      if (perPageValue) {
        context.queryParams.set(
          queryPerPageName,
          perPageValue
        );
      }
    }
    else {
      context.queryParams.delete(queryPageName);
      context.queryParams.delete(queryPerPageName);
    }
  }

  public afterRequest(context: IRecordModuleResponseContext): void | IRecordModuleResponseContext {
    if (context.response.isOk()) {
      this._config.updateMeta(
        this._config.paginator,
        context
      );
    }
  }

  public onClean(): void {
    this._config.paginator.toFirst({ noEmit: true });
  }
}
