export interface IStoreBuilder<T, K extends any[]> {
  getInstance(store: { new(...args: K): T }, ...args: K): T;
};
