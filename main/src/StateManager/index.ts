import type { IContainer } from "../Core/interface/IContainer.js";
import type { ITemplateBuilder } from "./interface/ITemplateBuilder.js";
import { getNuxoblivius } from "../Core/index.js";
import { MakeBuilder } from "./templateBuilders/MakeBuilder.js";
import type { Property } from "../Core/Property.js";
import { ProxyBuilder } from "./templateBuilders/ProxyBuilder.js";
import { DummyBuilder } from "./templateBuilders/DummyBuilder.js";
import type { StoreBackendContext } from "../Core/interface/IBackend.js";

type ToStore<T> = { [K in keyof T]: (T[K] extends Property<infer Type> ? Type : T[K]) }
type FactoryInstance<T = unknown, K extends any[] = any> = ((di: IContainer, ...args: K) => T) | (new (...args: K) => T);
type SingletonInstance<T = unknown> = ((di: IContainer) => T) | (new (...args: any) => T);

interface CreateByTemplateOptions {
  backendCtx: StoreBackendContext;
  store: FactoryInstance | SingletonInstance;
  args: any[];
  templateArgs?: any[];
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
      options.store as any, options.args
    );
  }
}

export function defineFactory<T, K extends any[]>(store: FactoryInstance<T, K>): (...args: K) => ToStore<T> {
  return (...args: K) => {
    const nx = getNuxoblivius();
    const bk = nx.getBackend();

    return bk.storeTransform((backendCtx) => {
      const di = nx.getDI();
      const managerFactory = di.injectOrError(StateManagerFactory);

      return managerFactory.createByTemplate({
        backendCtx, store, args, template: MakeBuilder
      });
    }) as any;
  }
}

export function defineSingleton<T, K extends []>(store: SingletonInstance<T>): () => ToStore<T> {
  var dummyInstance: T;

  return () => {
    const nx = getNuxoblivius();
    const di = nx.getDI();
    const bk = nx.getBackend();
    var managerFactory: StateManagerFactory;


    if (!dummyInstance) {
      managerFactory = di.injectOrError(StateManagerFactory);

      bk.muteContext(() => {
        dummyInstance = managerFactory.createByTemplate({
          backendCtx: undefined, store, args: [di], template: DummyBuilder
        }) as T;
      });
    }

    return bk.storeTransform((backendCtx) => {
      managerFactory ??= di.injectOrError(StateManagerFactory);

      return managerFactory.createByTemplate({
        backendCtx, store: () => dummyInstance, args: [], template: ProxyBuilder
      }) as any;
    }) as any;
  }
}
