import { SimpleFactory } from "../core/domain/interface/IContainer.js";
import { CreateStoreService } from "./application/service/CreateStoreService.js";
import { StoreService } from "./application/service/StoreService.js";

export const subStore = <T>(item: { new(): T }): SimpleFactory<T> => {
  const storeInstance = new CreateStoreService();

  return () => {
    return storeInstance.createFactoryStore(item).getInstance();
  };
};

export const defineLazyStore = <T>(item: { new(): T }): SimpleFactory<T> => {
  var instance: StoreService<T>;

  return () => {
    if (!instance) {
      instance = new CreateStoreService().createSingleton(item);
    }

    return instance.getInstance();
  };
};

export const defineStore = <T>(item: { new(): T }): T => {
  return new CreateStoreService()
    .createSingleton(item)
    .getInstance();
};
