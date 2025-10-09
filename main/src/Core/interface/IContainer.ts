export type FactoryValue<T = any, E extends any[] = any[]> = (() => T) | (new (...args: E) => T) | ((...args: E) => T);
export type SingletonValue<T = any> = T | (new (...args: any[]) => T) | (() => T);
export type ContainerToken<T = any, ARGS extends any[] = any[]> = Token<T, ARGS> | Symbol | (new (...args: ARGS) => T);

export type Token<T, ARGS> = { 'type': T, 'args': ARGS };
export type ToToken<T> = T extends new (args: infer ARGS) => infer TYPE ? Token<TYPE, ARGS>
  : Token<T, []>;

export interface IContainer {
  factory<T, E extends any[]>(token: ContainerToken<T, E>, value: FactoryValue<T, E>): IContainer;
  singleton<T>(token: ContainerToken<T, any>, value: SingletonValue<T>): IContainer;
  inject<T, ARGS extends any[]>(token: ContainerToken<T, ARGS>, ...args: ARGS | []): T | null;
  injectOrError<T, ARGS extends any[]>(token: ContainerToken<T, ARGS>, ...args: ARGS | []): T;
  injectOrCreate<T, ARGS extends any[]>(token: new (...args: ARGS) => T, ...args: ARGS): T;

  createScopeContainer(): IContainer;
  clean(): boolean;
}

export const asToken = <T>(): ToToken<T> => {
  return Symbol() as any;
};
