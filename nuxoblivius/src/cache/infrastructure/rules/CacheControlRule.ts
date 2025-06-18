import { ICacheRule } from "../../domain/interface/ICacheRule.js";
import { IStorage } from "../../domain/interface/IStorage.js";
import { CacheRecord } from "../../domain/valueObject/CacheRecord.js";

export class CacheControlRule implements ICacheRule {
  private depricated: string[] = [];

  public onWrite(record: CacheRecord): boolean {
    var header = record.getHeaders();

    if (header.has("cache-control")) {
      var cacheControl = header.get("cache-control") ?? "";

      if (!cacheControl || cacheControl.includes("no-cache") || cacheControl.includes("no-store")) {
        return false;
      }
    }

    return true;
  }

  public onRead(record: CacheRecord): boolean {
    const header = record.getHeaders();

    if (header.has("cache-control")) {
      var cacheControl = header.get("cache-control") ?? "";

      if (!cacheControl || cacheControl.includes("no-cache") || cacheControl.includes("no-store")) {
        this.depricated.push(record.getPath());
        return false;
      }

      if (cacheControl) {
        const segments = cacheControl.split(",").map(v => v.trim());

        for (var segment of segments) {
          // Check is experied
          if (segment.startsWith("max-age")) {
            const duration = +(segment.split("=")?.pop()?.trim() ?? "0");
            const experiedIn = record.getCreatedAt() + duration * 1000;

            // If is experied, remove
            if (experiedIn <= Date.now()) {
              this.depricated.push(record.getPath());
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  public async onAudit(storage: IStorage): Promise<void> {
    for (const name of this.depricated) {
      storage.delete(name);
    }
  }
};
