import type { Instance, Token } from "../../domain/interface/IContainer.js";

export class StoreListService {
  private storeList = new Map<Token, Instance>();

  public register<T>(item: Token<T>, store: Instance<T>): void {
    this.storeList.set(item, store);
  }

  public get<T>(item: Token<T>): T {
    if (!this.storeList.has(item)) {
      throw new Error("Store List [Error]: Store doesn't exist");
    }

    return this.storeList.get(item) as T;
  }

  public delete(item: Token): void {
    this.storeList.delete(item);
  }

  public forEach(callback: (value: Instance, token: Token) => void): void {
    this.storeList.forEach(callback);
  }
}
