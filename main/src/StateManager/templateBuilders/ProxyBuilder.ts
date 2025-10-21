import type { IBackend, StoreBackendContext } from "../../Core/interface/IBackend.js";
import { type Property } from "../../Core/Property.js";
import { uniqId } from "../../Core/Utils.js";
import { type InstanceContext, ITemplateBuilder, SHARED_BUFFER } from "../interface/ITemplateBuilder.js";

type ShelterMap = Map<string, Property<unknown>>;
const PARENT_TOKEN = Symbol();

export class ProxyBuilder extends ITemplateBuilder {
  public constructor(
    private readonly backend: IBackend
  ) { super(); }

  private getReactiveShelter(instance: any): Iterable<[string, Property<unknown>]> {
    const shelter: ShelterMap | undefined = instance[ITemplateBuilder.REACTIVE_SHELTER];

    if (shelter) {
      return shelter.entries();
    }

    return [];
  }

  protected build(instance: object, ctx: Readonly<InstanceContext>): object {
    const mimicInstance: Record<string, unknown> = {
      [PARENT_TOKEN]: instance,
      [ITemplateBuilder.REACTIVE_SHELTER]: new Map()
    };

    const proxyInstance = new Proxy(mimicInstance, {
      get(_, propName, __) {
        if (propName === "prototype") {
          return (instance as any).prototype;
        }

        var value = mimicInstance[propName as any];

        if (value) {
          return value;
        }

        value = (instance as any)[propName];

        if (typeof value === "function") {
          return (...args: any) => (value as Function).call(proxyInstance, proxyInstance, ...args);
        }

        return value;
      }
    });

    const mimicShelter: ShelterMap = mimicInstance[ITemplateBuilder.REACTIVE_SHELTER as any] as any;
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

    const dummyCtx = (instance as any)[SHARED_BUFFER].dummyCtx as StoreBackendContext;
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
