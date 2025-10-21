import { BackendComputed, BackendProperty, CallStoreHandle, IBackend, SetBackend, StoreBackendContext, StoreType, WatchBackend } from "../interface/IBackend.js";
import { findAllProperties } from "../Property.js";

export class BasicProperty<T> extends BackendProperty<T> { }
export class BasicComputed<T> extends BackendComputed<T> { }

export class BasicBackend implements IBackend {
  private _activeCtx: StoreBackendContext;
  protected isMuted: boolean = false;

  protected scopeContext<T>(ctx: StoreBackendContext, handle: (ctx: StoreBackendContext) => T): T {
    const oldCtx = this._activeCtx;
    this._activeCtx = ctx;
    const response = handle(ctx);
    this._activeCtx = oldCtx;
    return response;
  }

  public onStoreDestroy(handle: () => void, ctx: StoreBackendContext): void {
    ctx.toStoreDestroy(handle);
  }

  public onStoreInit(handle: () => void, ctx: StoreBackendContext): void {
    ctx.toStoreInit(handle);
  }

  public onMounted(handle: () => void): void {
    if (this._activeCtx) {
      this._activeCtx.toOnMount(handle);
    }
  }

  public onUnMounted(handle: () => void): void {
    if (this._activeCtx) {
      this._activeCtx.toOnUnMount(handle);
    }
  }

  public muteContext(handle: () => void): void {
    const oldMuted = this.isMuted;
    const oldCtx = this._activeCtx;
    this.isMuted = true;
    this._activeCtx = undefined;
    handle();
    this.isMuted = oldMuted;
    this._activeCtx = oldCtx;
  }

  public inContext(): StoreBackendContext {
    return this.isMuted || this._activeCtx
      ? new StoreBackendContext({ isMuted: true })
      : new StoreBackendContext({ isMuted: false });
  }

  public getActiveContext(): StoreBackendContext | undefined {
    return this._activeCtx;
  }

  public storeTransform(handle: CallStoreHandle): StoreType {
    if (this._activeCtx) {
      return handle(this._activeCtx);
    }

    const context = this.inContext();
    const response = this.scopeContext(context, (ctx) => handle(ctx));
    context.storeInit(response);
    return response;
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
