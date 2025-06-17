import type { PropertyInfo } from "../valueObject/PropertyInfo.js";

export interface IBackend {
  newState<T>(value: T): PropertyInfo<T>;
  newComputed<T>(callback: () => T): PropertyInfo<T>;

  watch<T>(prop: PropertyInfo<T> | (() => T), callback: (value: T) => void): () => void;

  /**
   * Check is reactive. Only for Debug!
   * @debug 
  */
  isReactive<T>(prop: PropertyInfo<T> | (() => T)): boolean;

  onMounted(callback: () => void): void;
  onUnMounted(callback: () => void): void;
};
