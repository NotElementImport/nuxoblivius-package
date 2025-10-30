import { Property } from "../../Core/Property.js";
import { Instance, InstanceContext, ITemplateBuilder, RawInstance, SHARED_BUFFER } from "../interface/ITemplateBuilder.js";
import type { IBackend, StoreBackendContext } from "../../Core/interface/IBackend.js";

type ShelterMap = Map<string, Property<unknown>>;
const PARENT_TOKEN = Symbol();

export class ProxyBuilder extends ITemplateBuilder {
  public constructor(
    private readonly backend: IBackend
  ) { super(); }

  private getReactiveShelter(instance: RawInstance): Iterable<[string, Property<unknown>]> {
    const shelter: ShelterMap | undefined = instance[ITemplateBuilder.REACTIVE_SHELTER] as ShelterMap;

    if (shelter) {
      return shelter.entries();
    }

    return [];
  }

  protected build(instance: RawInstance, ctx: Readonly<InstanceContext>): Instance {
    const mimicInstance: Instance = {
      [PARENT_TOKEN]: instance,
      [ITemplateBuilder.REACTIVE_SHELTER]: new Map()
    };

    const proxyInstance = new Proxy(mimicInstance, {
      get(_, propName, __) {
        if (propName === "prototype") {
          return instance.prototype;
        }

        var value = mimicInstance[propName];

        if (value) {
          return value;
        }

        value = instance[propName];

        if (typeof value === "function") {
          return (...args: unknown[]) => (value as Function).bind(proxyInstance)(...args);
        }

        return value;
      }
    });

    const mimicShelter: ShelterMap = mimicInstance[ITemplateBuilder.REACTIVE_SHELTER] as ShelterMap;
    for (const [prop, value] of this.getReactiveShelter(instance)) {
      mimicShelter.set(prop, this.backend.createProperty(value.get(), ctx.storeBackend));

      value.watch((value) => {
        mimicShelter.get(prop).set(value);
      });

      Object.defineProperty(mimicInstance, prop, {
        get() {
          return mimicShelter.get(prop).get();
        },
        set(v) {
          value.set(v);
        },
      });
    }

    const dummyCtx = (instance[SHARED_BUFFER] as Record<string, unknown>).dummyCtx as StoreBackendContext;
    let breakRelationWithParent: Function;

    ctx.storeBackend.toStoreInit(() => {
      breakRelationWithParent = ctx.storeBackend.beChild(dummyCtx);

      dummyCtx.storeInit(instance);
    });

    ctx.storeBackend.toStoreDestroy(() => {
      breakRelationWithParent?.();

      dummyCtx.storeDestroy(instance);
    });

    ctx.storeBackend.toOnUnMount(() => {
      ctx.storeBackend.storeDestroy(instance);
    });

    return proxyInstance;
  }
}
