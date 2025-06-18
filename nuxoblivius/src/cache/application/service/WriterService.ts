import type { CacheRecord } from "../../domain/valueObject/CacheRecord.js";
import type { StorageService } from "./StorageService.js";
import type { CacheRuleService } from "./CacheRuleService.js";

export class WriterService {
  public constructor(
    private readonly storage: StorageService,
    private readonly ruleService?: CacheRuleService
  ) { }

  public write(record: CacheRecord) {
    if (this.ruleService && !this.ruleService.canWrite(record)) {
      return;
    }

    this.storage.write(
      record.getPath(),
      record
    );
  }
};
