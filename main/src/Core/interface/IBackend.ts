import { Computed, Property } from "../Property.js";

export abstract class BackendProperty<T> extends Property<T> { }
export abstract class BackendComputed<T> extends Computed<T> { }

export type SetBackend = unknown | ((v: unknown) => unknown);
export type WatchBackend = BackendProperty<any> | BackendComputed<any> | (() => unknown);

export type CallStoreHandle = (ctx: StoreBackendContext) => StoreType;
export type StoreType = unknown;

export class StoreBackendContext {
  public setTrigger(): void { }
}

export interface IBackend {
  getActiveContext(): StoreBackendContext | undefined;

  isBackendValue(data: unknown): boolean;
  setBackendValue(data: unknown, value: SetBackend, ctx?: StoreBackendContext): void;
  getBackendValue<T>(data: unknown): T | null;
  watchBackendValue(data: WatchBackend, handle: (value: unknown) => void): Function;
  onMounted(handle: () => void): void;
  onUnMounted(handle: () => void): void;

  createProperty<T>(value: T, ctx?: StoreBackendContext): BackendProperty<T>;
  createComputed<T>(handle: () => T, ctx?: StoreBackendContext): BackendComputed<T>;

  muteContext(handle: () => void): void;
  inContext(): StoreBackendContext;
  storeTransform(handle: CallStoreHandle): StoreType;
}
