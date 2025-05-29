import { Nox } from "../../../core/Nox.js";
import { StoreService } from "./StoreService.js";

export class CreateStoreService {
  public createSingleton<T>(item: { new(): T }): StoreService<T> {
    const store = this.createFactoryStore(item);

    Nox.getInstance()
      .garbage
      .registerService(
        store.getPropertyList()
      );

    return store;
  }

  public createFactoryStore<T>(item: { new(): T }): StoreService<T> {
    return new StoreService(item);
  }
};
