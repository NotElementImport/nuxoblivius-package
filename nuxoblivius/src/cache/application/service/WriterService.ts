import { CacheRecord } from "../../domain/valueObject/CacheRecord.js";
import { StorageService } from "./StorageService.js";

export class WriterService {
  public constructor(
    private readonly storage: StorageService
  ) { }

  public write(record: CacheRecord) {
    this.storage.write(
      record.getPath(),
      record
    );
  }
};
