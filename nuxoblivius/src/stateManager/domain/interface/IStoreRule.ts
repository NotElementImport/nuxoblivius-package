export interface IStoreReactiveRule {
  canReactive(propName: string, value: unknown): boolean;
};

export interface IStoreTransformRule {
  getTransform(propName: string, input: unknown): unknown;
  setTransform(propName: string, inputValue: unknown): unknown;
};

export interface IStoreMountTransformRule {
  onMountStore(store: object): object;
};

export interface IStoreRule extends IStoreReactiveRule, IStoreTransformRule, IStoreMountTransformRule { };

export type IAnyStoreRule = IStoreRule | IStoreReactiveRule | IStoreTransformRule | IStoreMountTransformRule;
