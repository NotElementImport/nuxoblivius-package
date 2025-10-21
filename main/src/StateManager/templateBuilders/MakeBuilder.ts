import { IBackend } from "../../Core/interface/IBackend.js";
import { Property, WrapProperty } from "../../Core/Property.js";
import type { IPropReader, PropInfo } from "../interface/IPropReader.js";
import { InstanceContext, ITemplateBuilder } from "../interface/ITemplateBuilder.js";

type ShelterMap = Map<string, Property<unknown>>;

export class MakeBuilder extends ITemplateBuilder {
  public constructor(
    private readonly propReader: IPropReader,
    private readonly backend: IBackend
  ) { super(); }

  private basicToReactive(map: ShelterMap, prop: PropInfo, ctx: Readonly<InstanceContext>): PropertyDescriptor {
    const
      isClassStore = ctx.isClass,
      propValue = prop.value,
      propName = prop.propName;

    if (typeof propValue === "function") {
      return {
        get: () => propValue
      }
    }

    if (!isClassStore) {
      if (this.backend.isBackendValue(propValue)) {
        map.set(propName, propValue as any);
      }
      else {
        map.set(
          propName,
          new WrapProperty({
            get: () => this.backend.getBackendValue(propValue),
            set: (v) => this.backend.setBackendValue(propValue, v, ctx.storeBackend)
          })
        );
      }
    }
    else {
      map.set(
        propName,
        this.backend.createProperty(propValue, ctx.storeBackend)
      );
    }

    return {
      get: () => map.get(propName).get(),
      set: (v) => map.get(propName).set(v)
    }
  }

  private accessorToReactive(map: ShelterMap, prop: PropInfo, ctx: Readonly<InstanceContext>): PropertyDescriptor {
    const
      isClassStore = ctx.isClass,
      propName = prop.propName;

    if (isClassStore && prop.get) {
      map.set(
        propName,
        this.backend.createComputed(() => prop.get(), ctx.storeBackend)
      );

      return {
        get: () => map.get(propName).get(),
        set: () => { throw new Error("Readonly Computed property edit") }
      }
    }

    return {
      get: () => prop.get?.(),
      set: (v) => prop.set?.(v)
    }
  }

  protected build(instance: object, ctx: Readonly<InstanceContext>): object {
    (instance as any)[ITemplateBuilder.REACTIVE_SHELTER] = new Map();

    for (const propInfo of this.propReader.getPropsFrom(instance)) {
      Object.defineProperty(
        instance,
        propInfo.propName,
        propInfo.isBasicType()
          ? this.basicToReactive(
            (instance as any)[ITemplateBuilder.REACTIVE_SHELTER],
            propInfo,
            ctx)
          : this.accessorToReactive(
            (instance as any)[ITemplateBuilder.REACTIVE_SHELTER],
            propInfo,
            ctx)
      );
    }

    ctx.storeBackend.toOnUnMount(() => {
      ctx.storeBackend.storeDestroy(instance);
    });

    return instance;
  }
}
