import { StoreService } from "../application/service/StoreService.js";
import type { IStoreBuilder } from "../domain/interface/IStoreBuilder.js";

interface ICreateStoreConfig<T, K extends any[]> {
  store: { new(...args: K): T };
  builder: { new(): IStoreBuilder<any, any> };
};

export class StateManagerController {
  private static instance: StateManagerController;
  public static getInstance() {
    if (!this.instance) {
      this.instance = new StateManagerController();
    }
    return this.instance;
  }

  public createStore<T, K extends any[]>(config: ICreateStoreConfig<T, K>) {
    return new StoreService({
      store: config.store,
      builder: new config.builder(),
    });
  }
};
