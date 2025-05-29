import type { PropertyInfo } from "../../core/domain/valueObject/ProperyInfo.js";
import type { IBackendController } from "../domain/interfaces/IBackendController.js";

import { VuePropertyInfo } from "./domain/valueObject/VueProperyInfo.js";
import { VueComputedPropertyInfo } from "./domain/valueObject/VueComputedPropertyInfo.js";
import { onUnmounted, watch } from "vue";

export class Vue3BackendController implements IBackendController {
  public watch<T>(property: PropertyInfo<T>, callback: (value: T) => void): () => void {
    return watch(() => property.get(), (value) => {
      callback(value);
    }, { flush: "sync" });
  }

  public onUnmount(callback: () => void): void {
    onUnmounted(() => {
      callback();
    });
  }
  public createState<T>(initValue: T): PropertyInfo<T> {
    return new VuePropertyInfo(initValue) as PropertyInfo<T>;
  }

  public createComputed<T>(handle: () => T, deps?: PropertyInfo<T>[]): PropertyInfo<T> {
    return new VueComputedPropertyInfo(handle, deps) as PropertyInfo<T>;
  }
};
