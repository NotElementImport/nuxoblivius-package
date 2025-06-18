import { IStoreBuilder } from "../../domain/interface/IStoreBuilder.js";
import { StoreRuleService } from "./StoreRuleService.js";

export interface IStoreServiceConfig<T, K extends any[]> {
  store: { new(...args: K): T };
  builder: IStoreBuilder<T, K>;
  rules: StoreRuleService;
};

export class StoreService<T, K extends any[]> {
  private readonly store: { new(...args: K): T };
  private readonly builder: IStoreBuilder<T, K>;
  private readonly rules: StoreRuleService;

  public constructor(config: IStoreServiceConfig<T, K>) {
    this.store = config.store;
    this.builder = config.builder;
    this.rules = config.rules;
  }

  public getInstance(...args: K): T {
    var store = this.builder.getInstance(this.store, ...args);

    return this.rules.onStoreMount(
      store as object
    ) as T;
  }
};
