import { IStorage } from "../../domain/interface/IStorage.js";
import { CacheRecord } from "../../domain/valueObject/CacheRecord.js";

export class SessionStorage implements IStorage {
  private cells: Record<string, any> = {};
  private isParsed: boolean = false;

  private tryParse() {
    if (this.isParsed) {
      return;
    }

    const data = sessionStorage.getItem("nx_storage") ?? "";
    if (data) {
      this.cells = JSON.parse(atob(data));
    }
    this.isParsed = true;
  }

  private async trySave() {
    sessionStorage.setItem("nx_storage", btoa(JSON.stringify(this.cells)));
  }

  public count(): number {
    return Object.values(this.cells).length;
  }

  public write(name: string, value: any): void {
    this.tryParse();
    this.cells[name] = `${value}`;
    this.trySave();
  }

  public read(name: string) {
    this.tryParse();
    return CacheRecord.fromJson(this.cells[name]);
  }

  public *entries(): Iterator<[string, any], void, unknown> {
    this.tryParse();

    for (const key of Object.keys(this.cells)) {
      yield [key, this.read(key)];
    }
  }

  public delete(name: string) {
    this.tryParse();
    delete this.cells[name];
    this.trySave();
  }

  public clear(): void {
    this.cells = {};
    this.trySave();
  }
};
