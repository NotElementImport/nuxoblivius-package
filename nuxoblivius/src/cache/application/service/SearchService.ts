import type { CacheQuery } from "../../domain/valueObject/CacheQuery.js";
import { CacheRecord } from "../../domain/valueObject/CacheRecord.js";
import type { StorageService } from "./StorageService.js";
import type { CacheRuleService } from "./CacheRuleService.js";

export class SearchService {
  public constructor(
    private readonly storage: StorageService,
    private readonly ruleService?: CacheRuleService
  ) { }

  public validate(record: any, query: CacheQuery): record is CacheRecord {
    if (record && record instanceof CacheRecord) {
      const url = record.getPathAsUrl();

      const isPathCorrect = query.checkUrl(url);
      const isQueryCorrect = query.checkQuery(url);
      const isHeadersCorrect = query.checkHeader(record.getHeaders());
      const isParamsCorrect = query.checkParams(record.getParams());

      const canReadIt = this.ruleService
        ? this.ruleService.canRead(record)
        : false;

      return canReadIt && isPathCorrect && isQueryCorrect && isHeadersCorrect && isParamsCorrect;
    }

    return false;
  }

  public search(query: CacheQuery): CacheRecord | null {
    for (var [_, value] of this.storage.entries()) {
      if (this.validate(value, query)) {
        return value;
      }
    }

    return null;
  }

  public searchAll(query: CacheQuery): CacheRecord[] {
    var records: CacheRecord[] = [];

    for (const [_, value] of this.storage.entries()) {
      if (this.validate(value, query)) {
        records.push(value);
      }
    }

    return records;
  }
};
