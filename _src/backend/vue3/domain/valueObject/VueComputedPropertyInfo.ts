import { PropertyInfo } from "../../../../core/domain/valueObject/ProperyInfo.js";
import { computed, type ComputedRef } from "vue";

export class VueComputedPropertyInfo<T> extends PropertyInfo {
  private deps?: PropertyInfo<any>[];
  private value: ComputedRef<T>;

  public constructor(callback: () => T, deps?: PropertyInfo<any>[]) {
    var isNotFirstLaunch = false;
    var $ = computed(() => {
      if (!isNotFirstLaunch) {
        for (const item of deps ?? []) {
          item.get();
        }
        isNotFirstLaunch = true;
      }

      return callback();
    });

    super(
      () => $.value,
      (_) => {
        throw new Error("Object is readonly")
      }
    );

    this.deps = deps;
    this.value = $;
  }

  public getRef(): ComputedRef<T> {
    return this.value;
  }
}
