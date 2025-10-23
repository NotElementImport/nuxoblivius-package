import { StateManagerFactory } from "../StateManager/index.js";
import { BasicPropReader } from "../StateManager/propReaders/BasicPropReader.js";
import { DummyBuilder } from "../StateManager/templateBuilders/DummyBuilder.js";
import { MakeBuilder } from "../StateManager/templateBuilders/MakeBuilder.js";
import { ProxyBuilder } from "../StateManager/templateBuilders/ProxyBuilder.js";
import { IPropReaderToken } from "../StateManager/interface/IPropReader.js";

import { BasicContainer } from "./containers/BasicContainer.js";
import { BasicBackend } from "./backend/BasicBackend.js";
import type {
  BackendComputed,
  BackendProperty,
  IBackend,
} from "./interface/IBackend.js";
import type { IContainer } from "./interface/IContainer.js";
import { IThread, ThreadMultiple } from "./interface/IThread.js";
import { isSeekerWorking, Property } from "./Property.js";

interface CoreOptions {
  container: IContainer;
  backend: IBackend;
}

interface DefineOptions {
  define: (di: IContainer) => void;
}

export class Core {
  public constructor(private readonly config: CoreOptions) { }

  public getDI(): IContainer {
    return this.config.container;
  }

  public getBackend(): IBackend {
    return this.config.backend;
  }
}

var nuxobliviusInstance: Core;

export function getNuxoblivius(): Core {
  if (!nuxobliviusInstance) {
    throw new Error(
      "Nuxoblivius not defined, use method `defineNuxoblivius` for create instance",
    );
  }

  return nuxobliviusInstance;
}

// Main entry
export default function defineNuxoblivius(
  params: Partial<CoreOptions & DefineOptions> = {},
) {
  nuxobliviusInstance = new Core({
    container: params.container ?? new BasicContainer(),
    backend: params.backend ?? new BasicBackend(),
  });

  const di = nuxobliviusInstance.getDI();

  di.singleton(StateManagerFactory, () => new StateManagerFactory(di));
  di.singleton(IPropReaderToken, () => new BasicPropReader());

  di.singleton(
    MakeBuilder,
    () =>
      new MakeBuilder(
        di.inject(IPropReaderToken),
        nuxobliviusInstance.getBackend(),
      ),
  );

  di.singleton(
    DummyBuilder,
    () =>
      new DummyBuilder(
        di.inject(IPropReaderToken),
        nuxobliviusInstance.getBackend(),
      ),
  );

  di.singleton(
    ProxyBuilder,
    () => new ProxyBuilder(nuxobliviusInstance.getBackend()),
  );

  if (params.define) {
    params.define(di);
  }
}

export function signal<T>(value: T | (() => T)): BackendProperty<T> {
  const backend = getNuxoblivius().getBackend();

  return backend.storeTransform((ctx) => {
    if (typeof value === "function") {
      value = (value as Function)();
    }

    return backend.createProperty(value, ctx);
  }) as BackendProperty<T>;
}

export function spanSignal<T>(value: (() => T)): BackendProperty<T> {
  const backend = getNuxoblivius().getBackend();

  return backend.storeTransform((ctx) => {
    const signal = backend.createProperty(value(), ctx);

    backend.onStoreInit(() => {
      // @ts-ignore
      signal.set(value());
    }, ctx);

    return signal;
  }) as BackendProperty<T>;
}

type RawValue<T> = T extends Property<infer K> ? K : T;
export type OrSignal<T> = T | Property<T>;

export function toValue<T>(value: T): RawValue<T> {
  if (value instanceof Property) {
    return isSeekerWorking() ? value.get() : value.valueOf();
  }

  return value as RawValue<T>;
}

export function computed<T>(handle: () => T): BackendComputed<T> {
  const backend = getNuxoblivius().getBackend();

  return backend.storeTransform((ctx) => {
    return backend.createComputed(handle, ctx);
  }) as BackendComputed<T>;
}

export function watch<T>(
  prop: BackendProperty<T> | BackendComputed<T> | (() => T),
  handle: (value: T, oldValue: T) => void,
): Function {
  const backend = getNuxoblivius().getBackend();

  return backend.storeTransform(() => {
    return backend.watchBackendValue(prop as Property, handle as any);
  }) as Function;
}

export function onMounted(handle: () => void): void {
  const backend = getNuxoblivius().getBackend();

  backend.storeTransform(() => {
    backend.onMounted(handle);
  });
}

export function onUnMounted(handle: () => void): void {
  const backend = getNuxoblivius().getBackend();

  backend.storeTransform(() => {
    backend.onUnMounted(handle);
  });
}

export function onStoreInit(handle: () => void): void {
  const backend = getNuxoblivius().getBackend();

  backend.storeTransform((ctx) => {
    backend.onStoreInit(handle, ctx);
  });
}

export function onStoreDestroy(handle: () => void): void {
  const backend = getNuxoblivius().getBackend();

  backend.storeTransform((ctx) => {
    backend.onStoreDestroy(handle, ctx);
  });
}

export function onTimespan(
  handle: () => Function
): (() => void) {
  const backend = getNuxoblivius().getBackend();

  return backend.storeTransform((ctx) => {
    var canBeBrake = true;
    var breakHandle: Function;

    const safeBreakHandle = () => {
      if (canBeBrake && breakHandle && typeof breakHandle === "function") {
        breakHandle();
        canBeBrake = false;
      }
    };

    backend.onStoreInit(() => {
      canBeBrake = true;
      breakHandle = handle();
    }, ctx);

    backend.onStoreDestroy(safeBreakHandle, ctx);

    return safeBreakHandle;
  }) as (() => void);
}

export function defineThread(...instances: (new () => IThread)[]): IThread {
  const di = getNuxoblivius().getDI();

  if (instances.length > 1) {
    const threads = instances.map(
      (instance) => di.injectOrCreate(instance)
    );

    return new ThreadMultiple(threads);
  }

  return di.injectOrCreate(instances.pop());
}

export function onThread<T, K extends any[]>(
  channel: IThread,
  handle: (...args: K) => T,
): (...args: K) => T {
  return (...args) => channel.runOnThread(() => handle(...args), {});
}

export function onThreadSafe<T, K extends any[]>(
  channel: IThread,
  handle: (...args: K) => T,
): (...args: K) => T {
  return (...args) =>
    channel.runOnThread(() => handle(...args), { noThrow: true });
}
