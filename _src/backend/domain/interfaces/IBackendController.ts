import { PropertyInfo } from "../../../core/domain/valueObject/ProperyInfo.js";

export interface IBackendController {
  onUnmount(callback: () => void): void;
  watch<T>(property: PropertyInfo<T>, callback: (value: T) => void): () => void;

  createState<T>(initValue: T): PropertyInfo<T>;
  createComputed<T>(handle: () => T, deps?: PropertyInfo<T>[]): PropertyInfo<T>;
}
