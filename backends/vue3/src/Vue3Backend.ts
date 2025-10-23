import { onMounted, onUnmounted, shallowRef, ShallowRef } from "vue";
import { BasicBackend, BasicComputed, BasicProperty } from "@nuxoblivius_builds/core/Core/Backend/Basic";
import { BackendComputed, BackendProperty, StoreBackendContext } from "@nuxoblivius_builds/core/Core/Backend/Interface";

class Vue3Property<T> extends BasicProperty<T> {
  private _vueRef!: ShallowRef;

  public constructor(value: T) {
    super(value);
    this._vueRef = shallowRef(value);
  }

  public override set(newValue: T | ((v: T) => T)): void {
    super.set(newValue);
    this._vueRef.value = this.getRaw();
  }

  public override get(): T {
    super.get();
    return this._vueRef.value;
  }

  public override toString(): string {
    return `${this.get()}`;
  }
}

class Vue3Computed<T> extends BasicComputed<T> {
  private _vueRef!: ShallowRef;

  public constructor(value: () => T) {
    super(value);
    this._vueRef = shallowRef(this.getRaw());
  }

  public override notifySubs(newValue: T, oldValue: T): void {
    super.notifySubs(newValue, oldValue);
    this._vueRef.value = this.getRaw();
  }

  public override get(): T {
    super.get();
    return this._vueRef.value;
  }

  public override toString(): string {
    return `${this.get()}`;
  }
}

class Vue3Context extends StoreBackendContext {
  public constructor() {
    super({ isMuted: false });
    onMounted(() => this.mount());
    onUnmounted(() => this.unMount());
  }
}

export class Vue3Backend extends BasicBackend {
  public override inContext(): StoreBackendContext {
    return this.isMuted
      ? new StoreBackendContext({ isMuted: true })
      : new Vue3Context();
  }

  public override onMounted(handle: () => void): void {
    if (!this.isMuted) {
      onMounted(() => handle());
    }
  }

  public override onUnMounted(handle: () => void): void {
    if (!this.isMuted) {
      onUnmounted(() => handle());
    }
  }

  public override createProperty<T>(value: T, ctx: StoreBackendContext): BackendProperty<T> {
    return new Vue3Property(value);
  }

  public override createComputed<T>(handle: () => T, ctx: StoreBackendContext): BackendComputed<T> {
    return new Vue3Computed(handle);
  }
}
