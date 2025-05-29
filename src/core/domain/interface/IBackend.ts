import { PropertyInfo } from "../valueObject/PropertyInfo";

export interface IBackend {
  newState<T>(value: T): PropertyInfo<T>;
  newComputed<T>(callback: () => T): PropertyInfo<T>;

  watch<T>(prop: PropertyInfo<T>, callback: (value: T) => void): () => void;

  onMounted(callback: () => void): void;
  onUnMounted(callback: () => void): void;
};
