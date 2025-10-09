import { BackendComputed, BackendProperty, CallStoreHandle, IBackend, SetBackend, StoreBackendContext, StoreType, WatchBackend } from "../interface/IBackend.js";
import { findAllProperties } from "../Property.js";

export class BasicProperty<T> extends BackendProperty<T> { }
export class BasicComputed<T> extends BackendComputed<T> { }

export class BasicBackend implements IBackend {
  public onMounted(handle: () => void): void {
    throw new Error("Method not implemented.");
  }

  public onUnMounted(handle: () => void): void {
    throw new Error("Method not implemented.");
  }

  protected isMuted: boolean = false;

  public muteContext(handle: () => void): void {
    const oldMuted = this.isMuted;
    this.isMuted = true;
    handle();
    this.isMuted = oldMuted;
  }

  public inContext(): StoreBackendContext {
    return this.isMuted
      ? new StoreBackendContext()
      : new StoreBackendContext();
  }

  public getActiveContext(): StoreBackendContext | undefined {
    return undefined;
  }

  public storeTransform(handle: CallStoreHandle): StoreType {
    return handle(this.inContext());
  }

  public isBackendValue(data: unknown): data is BasicProperty<unknown> {
    if (data) {
      return data instanceof BasicProperty
        || data instanceof BasicComputed;
    }

    return false;
  }

  public setBackendValue(data: unknown, value: SetBackend, ctx?: StoreBackendContext): void {
    if (this.isBackendValue(data)) {
      data.set(value);
      ctx?.setTrigger?.();
    }
  }

  public getBackendValue<T>(data: unknown): T | null {
    if (this.isBackendValue(data)) {
      return data.get() as T;
    }

    return data as T;
  }


  public watchBackendValue(data: WatchBackend, handle: (value: unknown) => void): Function {
    if (this.isBackendValue(data)) {
      return data.watch(handle);
    }
    else if (typeof data === "function") {
      const props = findAllProperties(() => data());

      if (props.length == 1) {
        return props[0].watch(handle);
      }
    }

    return () => { };
  }

  public createProperty<T>(value: T, ctx: StoreBackendContext): BackendProperty<T> {
    return new BasicProperty(value);
  }


  public createComputed<T>(handle: () => T, ctx: StoreBackendContext): BackendComputed<T> {
    return new BasicComputed(handle);
  }
}
