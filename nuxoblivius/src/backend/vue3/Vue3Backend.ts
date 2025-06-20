import type { IBackend } from "../../core/domain/interface/IBackend.js";
import { PropertyInfo } from "../../core/domain/valueObject/PropertyInfo.js";
import { computed, onMounted, onUnmounted, ref, watch } from "vue"

export class Vue3Backend implements IBackend {
  public newState<T>(value: T): PropertyInfo<T> {
    const state = ref(value);

    return new PropertyInfo<T>(
      () => state.value as T,
      (value: T) => (state.value as T) = value
    );
  }

  public newComputed<T>(callback: () => T): PropertyInfo<T> {
    const state = computed(() => {
      return callback();
    });

    return new PropertyInfo<T>(
      () => state.value,
      (_) => new Error("Computed, is readonly")
    );
  }

  public watch<T>(prop: PropertyInfo<T> | (() => T), callback: (value: T) => void): () => void {
    if (typeof prop === "function") {
      return watch(prop, (value) => {
        callback(value);
      }, { flush: "sync" });
    }

    return watch(() => prop.getValue(), (value) => {
      callback(value);
    }, { flush: "sync" });
  }

  public isReactive<T>(prop: PropertyInfo<T> | (() => T)): boolean {
    prop = typeof prop === "function"
      ? prop
      : () => (prop as PropertyInfo<any>).getValue();

    var isReactive = false;
    const unWatch = watch(
      prop,
      () => { },
      {
        onTrack: (_) => {
          isReactive = true
        },
        immediate: true,
        flush: "sync"
      }
    );
    unWatch();
    return isReactive;
  }

  public onMounted(callback: () => void): void {
    onMounted(() => {
      callback();
    });
  }

  public onUnMounted(callback: () => void): void {
    onUnmounted(() => {
      callback();
    });
  }
}
