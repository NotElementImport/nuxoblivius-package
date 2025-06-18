import type { ICacheRule } from "../../domain/interface/ICacheRule.js";
import type { CacheRecord } from "../../domain/valueObject/CacheRecord.js"
import type { StorageService } from "./StorageService.js";

export class CacheRuleService {
  public constructor(
    private readonly rules: ICacheRule[]
  ) { }

  public canRead(record: CacheRecord) {
    for (const rule of this.rules) {
      if (!rule.onRead(record)) {
        return false;
      }
    }

    return true;
  }

  public canWrite(record: CacheRecord) {
    for (const rule of this.rules) {
      if (!rule.onWrite(record)) {
        return false;
      }
    }

    return true;
  }

  public async audit(storage: StorageService) {
    for (const rule of this.rules) {
      await rule.onAudit(storage as any);
    }
  }
};
