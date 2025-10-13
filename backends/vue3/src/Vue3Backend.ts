import { BasicBackend, BasicComputed, BasicProperty } from "@nuxoblivius_builds/core/Core/Backend/Basic";
import { type CallStoreHandle, type StoreType, BackendComputed, BackendProperty, StoreBackendContext } from "@nuxoblivius_builds/core/Core/Backend/Interface";
import { onMounted, onUnmounted, shallowRef, ShallowRef } from "vue";

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

interface Vue3ContextOptions {
  readonly isMuted: boolean;
}

class Vue3Context extends StoreBackendContext {
  public constructor(private readonly options: Vue3ContextOptions) {
    super();
  }

  public isMuted(): boolean {
    return this.options.isMuted;
  }
}

export class Vue3Backend extends BasicBackend {
  public override inContext(): StoreBackendContext {
    return new Vue3Context({
      isMuted: this.isMuted
    });
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
    if (!ctx || (ctx instanceof Vue3Context && ctx.isMuted())) {
      return new BasicProperty(value);
    }
    return new Vue3Property(value);
  }

  public override createComputed<T>(handle: () => T, ctx: StoreBackendContext): BackendComputed<T> {
    if (!ctx || (ctx instanceof Vue3Context && ctx.isMuted())) {
      return new BasicComputed(handle);
    }
    return new Vue3Computed(handle);
  }
}
