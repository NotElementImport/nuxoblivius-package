import { Computed, Property } from "../Property.js";
import { uniqId } from "../Utils.js";

export abstract class BackendProperty<T> extends Property<T> { }
export abstract class BackendComputed<T> extends Computed<T> { }

export type SetBackend = unknown | ((v: unknown) => unknown);
export type WatchBackend = BackendProperty<unknown> | BackendComputed<unknown> | (() => unknown);

export type CallStoreHandle = (ctx: StoreBackendContext) => StoreType;
export type StoreType = unknown;

export interface StoreBackendContextOptions {
  readonly isMuted: boolean;
}

export class StoreBackendContext {
  private _UID: string;
  private _pointerCount: Map<unknown, number> = new Map();
  private _childs: Set<StoreBackendContext> = new Set();
  private _parent?: StoreBackendContext;

  private _subsStoreInit: Function[] = [];
  private _subsStoreDestroy: Function[] = [];

  private _subsToMount: Function[] = [];
  private _subsToUnMount: Function[] = [];

  private _asSingleton: boolean = false;

  public constructor(private readonly options: StoreBackendContextOptions) {
    this._UID = uniqId();
  }

  public setTrigger(): void {
    this._childs.forEach((child) => {
      child.setTrigger();
    });
  }

  public beChild(parent: StoreBackendContext): () => void {
    if (this._parent) {
      parent._childs.delete(this);
      this._parent = null;
    }

    if (parent) {
      this._parent = parent;
      parent._childs.add(this);
      return () => parent._childs.delete(this);
    }

    return () => { };
  }

  public getParent(): StoreBackendContext | null {
    return this._parent;
  }

  public isMuted(): boolean {
    return this.options.isMuted;
  }

  public setAsSingleton(): void {
    this._asSingleton = true;
  }

  public toOnMount(handle: () => void): void {
    this._subsToMount.push(handle);
  }

  public toOnUnMount(handle: () => void): void {
    this._subsToUnMount.push(handle);
  }

  public toStoreInit(handle: () => void): void {
    this._subsStoreInit.push(handle);
  }

  public toStoreDestroy(handle: () => void): void {
    this._subsStoreDestroy.push(handle);
  }

  public storeInit(instance: unknown): void {
    if (!instance) {
      return;
    }

    if (this._asSingleton) {
      const currentCount = this._pointerCount.get(instance) ?? 0;
      this._pointerCount.set(instance, currentCount + 1);

      if (currentCount !== 0) {
        return void 0;
      }
    }

    this._subsStoreInit.forEach((callback) => {
      callback();
    });
  }

  public storeDestroy(instance: unknown): void {
    if (!instance) {
      return;
    }

    if (this._asSingleton) {
      const currentCount = Math.max((this._pointerCount.get(instance) ?? 0) - 1, 0);
      this._pointerCount.set(instance, currentCount);

      if (currentCount !== 0) {
        return void 0;
      }
    }

    this._subsStoreDestroy.forEach((callback) => {
      callback();
    });
  }

  public mount(): void {
    this._subsToMount.forEach((callback) => {
      callback();
    });
  }

  public unMount(): void {
    this._subsToUnMount.forEach((callback) => {
      callback();
    });
  }

  public toString(): string {
    return `${this._UID}`;
  }
}

export interface IBackend {
  getActiveContext(): StoreBackendContext | undefined;

  isBackendValue(data: unknown): boolean;
  setBackendValue(data: unknown, value: SetBackend, ctx?: StoreBackendContext): void;
  getBackendValue<T>(data: unknown): T | null;
  watchBackendValue(data: WatchBackend, handle: (value: unknown) => void): Function;

  onMounted(handle: () => void): void;
  onUnMounted(handle: () => void): void;
  onStoreDestroy(handle: () => void, ctx: StoreBackendContext): void;
  onStoreInit(handle: () => void, ctx: StoreBackendContext): void;

  createProperty<T>(value: T, ctx?: StoreBackendContext): BackendProperty<T>;
  createComputed<T>(handle: () => T, ctx?: StoreBackendContext): BackendComputed<T>;

  muteContext(handle: () => void): void;
  inContext(): StoreBackendContext;
  storeTransform(handle: CallStoreHandle): StoreType;
}
