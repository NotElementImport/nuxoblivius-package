import type { CacheRecord } from "../valueObject/CacheRecord.js";
import type { IStorage } from "./IStorage.js";

export interface ICacheRule {
  onWrite(record: CacheRecord): boolean;
  onRead(record: CacheRecord): boolean;
  onAudit(storage: IStorage): Promise<void>;
};
