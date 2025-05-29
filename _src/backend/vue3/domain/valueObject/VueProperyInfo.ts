import { PropertyInfo } from "../../../../core/domain/valueObject/ProperyInfo.js";
import { Ref, ref, shallowRef } from "vue";

export class VuePropertyInfo<T> extends PropertyInfo {
  private ref!: Ref<T>;

  public constructor(value: T) {
    var $ = (typeof value === "object"
      ? ref(value)
      : shallowRef(value)) as Ref<T>;

    super(
      () => $.value,
      (value) => $.value = value as T
    );

    this.ref = $;
  }

  public getRef(): Ref<T> {
    return this.ref;
  }
}
