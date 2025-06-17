import { SearchService } from "../application/service/SearchService.js";
import { StorageService } from "../application/service/StorageService.js";
import { WriterService } from "../application/service/WriterService.js";
import type { IStorage } from "../domain/interface/IStorage.js";
import { CacheQuery } from "../domain/valueObject/CacheQuery.js";
import { CacheRecord } from "../domain/valueObject/CacheRecord.js";
import { BasicStorage } from "../infrastructure/storage/BasicStorage.js";

export interface ICacheControllerConfig {
  storage?: new () => IStorage;
};

export class CacheController {
  private readonly storage: StorageService;
  private readonly searchService: SearchService;
  private readonly writerService: WriterService;

  public constructor(config: ICacheControllerConfig = {}) {
    this.storage = new StorageService(
      new (config.storage ?? BasicStorage)()
    );

    this.searchService = new SearchService(
      this.storage
    );

    this.writerService = new WriterService(
      this.storage
    );
  }

  public count(): number {
    return this.storage.count();
  }

  public readAll(query?: CacheQuery): CacheRecord[] {
    return this.searchService.searchAll(
      query ?? new CacheQuery({})
    );
  }

  public read(query: CacheQuery): CacheRecord | null {
    return this.searchService.search(query);
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
