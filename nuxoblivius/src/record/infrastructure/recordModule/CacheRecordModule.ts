import type { IBeforeRequestType, IRecordModule, IRecordModuleRequestContext, IRecordModuleResponseContext } from "../../domain/interface/IRecordModule.js";
import { HttpResponse } from "../../domain/valueObject/HttpResponse.js";
import { CacheController } from "../../../cache/interface/CacheController.js"
import { CacheQuery } from "../../../cache/domain/valueObject/CacheQuery.js"
import { QueryParams } from "../../domain/valueObject/QueryParams.js";
import { PathParams } from "../../domain/valueObject/PathParams.js";
import { CacheRecord } from "../../../cache/domain/valueObject/CacheRecord.js";
import { BasicStorage } from "../../../cache/infrastructure/storage/BasicStorage.js";

interface ICacheRecordModuleConfig {
  builderCacheQuery?: (context: IRecordModuleRequestContext) => CacheQuery;
}

export class CacheRecordModule implements IRecordModule {
  private _cacheController: CacheController;

  public constructor(
    private readonly _config: ICacheRecordModuleConfig
  ) { }

  public onSetup(): void {
    // Setup cache
    this._cacheController = new CacheController({
      storage: BasicStorage,
    });
  }

  public beforeRequest(context: IRecordModuleRequestContext): IBeforeRequestType {
    // Search only GET requests:
    if (context.options.method !== "GET") {
      return;
    }

    // Generate cache query:
    const cacheQuery = this._config.builderCacheQuery
      ? this._config.builderCacheQuery(context)
      : new CacheQuery({
        url: context.url,
        query: (q) => context.queryParams.compare(
          new QueryParams(q)
        ),
        params: (p) => context.pathParams.compare(
          new PathParams(p)
        )
      });

    // Check query in Storage
    const existInCache = this._cacheController.read(
      cacheQuery
    );

    // If found return it
    if (existInCache) {
      return new HttpResponse({
        headers: existInCache.getHeaders(),
        body: existInCache.getBody(),
        status: 200,
      });
    }
  }

  public afterRequest(context: IRecordModuleResponseContext): void | IRecordModuleResponseContext {
    if (context.response.isOk()) {
      // If request is OK, save the response.
      this._cacheController.write(new CacheRecord({
        url: context.url,
        body: context.response.getData(),
        headers: context.headers,
        params: context.pathParams.toObject()
      }));
    }
  }

  public onClean(): void {
    this._cacheController.clear();
  }
}
