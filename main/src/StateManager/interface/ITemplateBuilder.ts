import { getNuxoblivius } from "../../Core/index.js";
import { StoreBackendContext } from "../../Core/interface/IBackend.js";
import type { IContainer } from "../../Core/interface/IContainer.js";

type StateConstructor = (new (...args: any) => object) | ((di: IContainer, ...args: any) => object);

export const SHARED_BUFFER = Symbol();

const tryIsClass = (instance: any) => {
  const asText = `${instance}`;

  if (asText.startsWith('class')) {
    return true;
  }
  else if (asText.startsWith('function')) {
    try {
      new instance();
      return true;
    }
    catch (e) {
      return false;
    }
  }
  return false;
};

export class InstanceContext {
  public constructor(
    private _storeBackend: StoreBackendContext
  ) { }

  public get storeBackend() {
    return this._storeBackend;
  }

  public isClass: boolean = false;
}

export abstract class ITemplateBuilder {
  protected static REACTIVE_SHELTER = Symbol();

  private createInstanceFromConstructor(storeCtx: StoreBackendContext, instance: StateConstructor, args: any[]): [object, InstanceContext] {
    const ctx = new InstanceContext(storeCtx);

    ctx.isClass = tryIsClass(instance);

    const storeInstance = ctx.isClass
      ? new (instance as any)(...args)
      : (instance as Function)(getNuxoblivius().getDI(), ...args);

    return [storeInstance, ctx];
  }

  protected abstract build(instance: object, ctx: Readonly<InstanceContext>): object;

  public buildOrFail(ctx: StoreBackendContext, instance: StateConstructor, args: any[]): object {
    return this.build(
      ...this.createInstanceFromConstructor(ctx, instance, args)
    );
  }
}
