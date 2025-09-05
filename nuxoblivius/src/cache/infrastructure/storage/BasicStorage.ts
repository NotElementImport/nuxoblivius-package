import { IStorage } from "../../domain/interface/IStorage.js";

export class BasicStorage implements IStorage {
  private storage: Map<string, any> = new Map<string, any>();

  public count(): number {
    return this.storage.size;
  }

  public write(name: string, value: any): void {
    this.storage.set(name, value);
  }

  public read(name: string) {
    return this.storage.get(name);
  }

  public *entries(): Generator<[string, any], void, unknown> {
    for (const item of this.storage.entries() as any) {
      yield item;
    }
  }

  public delete(name: string) {
    this.storage.delete(name);
  }

  public clear(): void {
    this.storage.clear();
  }
};
