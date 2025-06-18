import { StoreRuleService } from "../application/service/StoreRuleService.js";
import { StoreService } from "../application/service/StoreService.js";
import type { IStoreBuilder } from "../domain/interface/IStoreBuilder.js";

interface ICreateStoreConfig<T, K extends any[]> {
  store: { new(...args: K): T };
  builder: { new(rules: StoreRuleService): IStoreBuilder<any, any> };
  rules?: StoreRuleService;
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
    var rules = new StoreRuleService([]);

    return new StoreService({
      store: config.store,
      builder: new config.builder(rules),
      rules
    });
  }
};
