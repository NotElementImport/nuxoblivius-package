import { PropertyInfo } from "@nuxoblivius/core/domain/property";
import type { IBackend } from "@nuxoblivius/core/interface/IBackend";

export class Vue3Backend implements IBackend {
  newState<T>(value: T): PropertyInfo<T> {
    throw new Error("Method not implemented.");
  }
  newComputed<T>(callback: () => T): PropertyInfo<T> {
    throw new Error("Method not implemented.");
  }
  watch<T>(prop: PropertyInfo<T>, callback: (value: T) => void): () => void {
    throw new Error("Method not implemented.");
  }
  onMounted(callback: () => void): void {
    throw new Error("Method not implemented.");
  }
  onUnMounted(callback: () => void): void {
    throw new Error("Method not implemented.");
  }
};
