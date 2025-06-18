import { IStorage } from "../../domain/interface/IStorage.js";

export class LocalStorage implements IStorage {
  private cells: Record<string, any> = {};
  private isParsed: boolean = false;

  private tryParse() {
    if (this.isParsed) {
      return;
    }

    const data = localStorage.getItem("nx_storage") ?? "";
    if (data) {
      this.cells = JSON.parse(atob(data));
    }
    this.isParsed = true;
  }

  private async trySave() {
    localStorage.setItem("nx_storage", btoa(JSON.stringify(this.cells)));
  }

  public count(): number {
    return Object.values(this.cells).length;
  }

  public write(name: string, value: any): void {
    this.tryParse();
    this.cells[name] = value;
    this.trySave();
  }

  public read(name: string) {
    this.tryParse();
    return this.cells[name];
  }

  public *entries(): Iterator<[string, any], void, unknown> {
    this.tryParse();
    return Object.entries(this.cells) as any;
  }

  public delete(name: string) {
    this.tryParse();
    delete this.cells[name];
    this.trySave();
  }
};
