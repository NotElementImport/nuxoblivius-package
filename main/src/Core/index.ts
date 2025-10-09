import { StateManagerFactory } from "../StateManager/index.js";
import { IPropReaderToken } from "../StateManager/interface/IPropReader.js";
import { BasicPropReader } from "../StateManager/propReaders/BasicPropReader.js";
import { DummyBuilder } from "../StateManager/templateBuilders/DummyBuilder.js";
import { MakeBuilder } from "../StateManager/templateBuilders/MakeBuilder.js";
import { ProxyBuilder } from "../StateManager/templateBuilders/ProxyBuilder.js";
import { BasicBackend } from "./backend/BasicBackend.js";
import { BasicContainer } from "./containers/BasicContainer.js";
import type { BackendComputed, BackendProperty, IBackend } from "./interface/IBackend.js";
import type { IContainer } from "./interface/IContainer.js";

interface CoreOptions {
  container: IContainer;
  backend: IBackend;
}

interface DefineOptions {
  define: (di: IContainer) => void;
}

export class Core {
  public constructor(
    private readonly config: CoreOptions
  ) { }

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
    throw new Error("Nuxoblivius not defined, use method `defineNuxoblivius` for create instance");
  }

  return nuxobliviusInstance;
}

// Main entry 
export default function defineNuxoblivius(params: Partial<CoreOptions & DefineOptions> = {}) {
  nuxobliviusInstance = new Core({
    container: params.container ?? new BasicContainer(),
    backend: params.backend ?? new BasicBackend()
  });

  const di = nuxobliviusInstance.getDI();

  di.singleton(StateManagerFactory, () => new StateManagerFactory(di));
  di.singleton(IPropReaderToken, () => new BasicPropReader());

  di.singleton(MakeBuilder, () => new MakeBuilder(
    di.inject(IPropReaderToken),
    nuxobliviusInstance.getBackend()
  ));

  di.singleton(DummyBuilder, () => new DummyBuilder(
    di.inject(IPropReaderToken),
    nuxobliviusInstance.getBackend()
  ));

  di.singleton(ProxyBuilder, () => new ProxyBuilder(
    nuxobliviusInstance.getBackend()
  ));

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
  }) as any;
}

export function computed<T>(handle: () => T): BackendComputed<T> {
  const backend = getNuxoblivius().getBackend();

  return backend.storeTransform((ctx) => {
    return backend.createComputed(handle, ctx);
  }) as any;
}

export function watch<T>(prop: BackendProperty<T> | BackendComputed<T> | (() => T), handle: (value: T, oldValue: T) => void): Function {
  const backend = getNuxoblivius().getBackend();

  return backend.storeTransform(() => {
    return backend.watchBackendValue(prop, handle as any)
  }) as any;
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
