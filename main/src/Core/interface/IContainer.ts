export type FactoryValue<T = unknown, E extends unknown[] = unknown[]> = (() => T) | (new (...args: E) => T) | ((...args: E) => T);
export type SingletonValue<T = unknown> = T | (new (...args: unknown[]) => T) | (() => T);
export type ContainerToken<T = unknown, ARGS extends unknown[] = unknown[]> = Token<T, ARGS> | Symbol | (new (...args: ARGS) => T);

export type Token<T, ARGS> = { 'type': T, 'args': ARGS };
export type ToToken<T> = T extends new (args: infer ARGS) => infer TYPE ? Token<TYPE, ARGS>
  : Token<T, []>;

export interface IContainer {
  factory<T, E extends unknown[]>(token: ContainerToken<T, E>, value: FactoryValue<T, E>): IContainer;
  singleton<T>(token: ContainerToken<T, any>, value: SingletonValue<T>): IContainer;
  inject<T, ARGS extends unknown[]>(token: ContainerToken<T, ARGS>, ...args: ARGS | []): T | null;
  injectOrError<T, ARGS extends unknown[]>(token: ContainerToken<T, ARGS>, ...args: ARGS | []): T;
  injectOrCreate<T, ARGS extends unknown[]>(token: new (...args: ARGS) => T, ...args: ARGS): T;

  createScopeContainer(): IContainer;
  clean(): boolean;
}

export const asToken = <T>(): ToToken<T> => {
  return Symbol() as unknown as ToToken<T>;
};
