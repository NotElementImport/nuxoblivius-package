import { StorageService } from "../application/service/StorageService";
import { IStorage } from "../domain/interface/IStorage";
import { BasicStorage } from "../infrastructure/storage/BasicStorage";

export interface ICacheControllerConfig {
  storage?: new () => IStorage;
};

export class CacheController {
  private readonly storage: StorageService;

  public constructor(config: ICacheControllerConfig) {
    this.storage = new StorageService(
      new (config.storage ?? BasicStorage)()
    );
  }

  public read() {

  }

  public write() {

  }

  public async writeAsync() {

  }

  public async readAsync() {

  }
};
