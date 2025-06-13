import { IStoreBuilder } from "../../domain/interface/IStoreBuilder";

export interface IStoreServiceConfig<T, K extends any[]> {
  store: { new(...args: K): T };
  builder: IStoreBuilder<T, K>;
};

export class StoreService<T, K extends any[]> {
  private readonly store: { new(...args: K): T };
  private readonly builder: IStoreBuilder<T, K>;

  public constructor(config: IStoreServiceConfig<T, K>) {
    this.store = config.store;
    this.builder = config.builder;
  }

  public getInstance(...args: K): T {
    return this.builder.getInstance(this.store, ...args);
  }
};
