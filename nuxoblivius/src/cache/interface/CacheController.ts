import { CacheRuleService } from "../application/service/CacheRuleService.js";
import { SearchService } from "../application/service/SearchService.js";
import { StorageService } from "../application/service/StorageService.js";
import { WriterService } from "../application/service/WriterService.js";
import type { IStorage } from "../domain/interface/IStorage.js";
import { CacheQuery } from "../domain/valueObject/CacheQuery.js";
import type { CacheRecord } from "../domain/valueObject/CacheRecord.js";
import { BasicStorage } from "../infrastructure/storage/BasicStorage.js";
import { CacheControlRule } from "../infrastructure/rules/CacheControlRule.js";

export interface ICacheControllerConfig {
  storage?: new () => IStorage;
  rules?: CacheRuleService;
};

export class CacheController {
  private readonly storage: StorageService;
  private readonly searchService: SearchService;
  private readonly writerService: WriterService;
  private readonly cacheRules: CacheRuleService;

  public constructor(config: ICacheControllerConfig = {}) {
    this.storage = new StorageService(
      new (config.storage ?? BasicStorage)()
    );

    this.cacheRules = config.rules
      ? config.rules
      : new CacheRuleService([
        new CacheControlRule()
      ]);

    this.searchService = new SearchService(
      this.storage,
      this.cacheRules
    );

    this.writerService = new WriterService(
      this.storage,
      this.cacheRules
    );
  }

  public count(): number {
    return this.storage.count();
  }

  public readAll(query?: CacheQuery): CacheRecord[] {
    var response = this.searchService.searchAll(
      query ?? new CacheQuery({})
    );
    this.cacheRules.audit(this.storage);
    return response;
  }

  public read(query: CacheQuery): CacheRecord | null {
    var response = this.searchService.search(query);
    this.cacheRules.audit(this.storage);
    return response;
  }

  public write(record: CacheRecord): void {
    this.writerService.write(record);
  }

  public async writeAsync(record: CacheRecord): Promise<void> {
    this.write(record);
  }

  public async readAsync(query: CacheQuery): Promise<CacheRecord | null> {
    return this.read(query);
  }

  public async readAllAsync(query: CacheQuery): Promise<CacheRecord[]> {
    return this.readAll(query);
  }
};
