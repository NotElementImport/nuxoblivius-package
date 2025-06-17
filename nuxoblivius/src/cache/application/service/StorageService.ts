import { IStorage } from "../../domain/interface/IStorage.js";

export class StorageService {
  public constructor(
    private readonly storage: IStorage
  ) { }

  public count(): number {
    return this.storage.count();
  }

  public write(name: string, value: any) {
    this.storage.write(name, value);
  }

  public read<T extends unknown>(name: string): T | null {
    return this.storage.read(name) as T | null;
  }

  public entries(): Generator<[string, unknown], void, unknown> {
    return this.entries();
  }
};
