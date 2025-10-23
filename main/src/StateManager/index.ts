import { getNuxoblivius } from "../Core/index.js";
import { Property } from "../Core/Property.js";
import { StoreBackendContext } from "../Core/interface/IBackend.js";
import { IContainer } from "../Core/interface/IContainer.js";

import { DummyBuilder } from "./templateBuilders/DummyBuilder.js";
import { ProxyBuilder } from "./templateBuilders/ProxyBuilder.js";
import { MakeBuilder } from "./templateBuilders/MakeBuilder.js";
import { ITemplateBuilder, StateConstructor } from "./interface/ITemplateBuilder.js";

type ToStore<T> = { [K in keyof T]: (T[K] extends Property<infer Type> ? Type : T[K]) }
type FactoryInstance<T = unknown, K extends any[] = any> = ((di: IContainer, ...args: K) => T) | (new (...args: K) => T);
type SingletonInstance<T = unknown> = ((di: IContainer) => T) | (new (...args: any) => T);

interface CreateByTemplateOptions {
  backendCtx: StoreBackendContext;
  store: FactoryInstance | SingletonInstance;
  args: unknown[];
  templateArgs?: unknown[];
  template: new (...args: any[]) => ITemplateBuilder;
}

export class StateManagerFactory {
  public constructor(
    private readonly container: IContainer
  ) { }

  public createByTemplate(options: CreateByTemplateOptions): unknown {
    const builder = this.container
      .injectOrCreate(options.template, ...(options.templateArgs ?? []));

    return builder.buildOrFail(
      options.backendCtx,
      options.store as StateConstructor,
      options.args
    );
  }
}

const DESTROY_TOKEN = Symbol();

export function defineFactory<T, K extends unknown[]>(store: FactoryInstance<T, K>): (...args: K) => ToStore<T> {
  return (...args: K) => {
    const nx = getNuxoblivius();
    const bk = nx.getBackend();

    return bk.storeTransform((backendCtx) => {
      const di = nx.getDI();
      const managerFactory = di.injectOrError(StateManagerFactory);

      const instance = managerFactory.createByTemplate({
        backendCtx, store, args, template: MakeBuilder
      });

      // @ts-ignore
      instance[DESTROY_TOKEN] = () => {
        backendCtx.unMount();
      };

      return instance;
    }) as ToStore<T>;
  }
}

export function defineSingleton<T>(store: SingletonInstance<T>): () => ToStore<T> {
  var dummyInstance: T;

  return () => {
    const nx = getNuxoblivius();
    const di = nx.getDI();
    const bk = nx.getBackend();
    var managerFactory: StateManagerFactory;

    if (!dummyInstance) {
      managerFactory = di.injectOrError(StateManagerFactory);

      bk.muteContext(() => {
        bk.storeTransform((backendCtx) => {
          dummyInstance = managerFactory.createByTemplate({
            backendCtx, store, args: [di], template: DummyBuilder
          }) as T;
        });
      });
    }

    return bk.storeTransform((backendCtx) => {
      managerFactory ??= di.injectOrError(StateManagerFactory);

      const instance = managerFactory.createByTemplate({
        backendCtx, store: () => dummyInstance, args: [], template: ProxyBuilder
      });

      // @ts-ignore
      instance[DESTROY_TOKEN] = () => {
        backendCtx.unMount();
      };

      return instance;
    }) as ToStore<T>;
  }
}

export function destroyStore(store: unknown): boolean {
  // @ts-ignore
  if (store && store[DESTROY_TOKEN]) {
    // @ts-ignore
    store[DESTROY_TOKEN]();
    return true;
  }
  return false;
}
