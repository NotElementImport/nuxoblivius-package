export type Token<T = unknown> = T | { new(): T };
export type Instance<T = unknown> = T;
export type SimpleFactory<T = unknown> = () => Instance<T>;
