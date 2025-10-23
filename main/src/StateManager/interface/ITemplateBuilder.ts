import { getNuxoblivius } from "../../Core/index.js";
import { StoreBackendContext } from "../../Core/interface/IBackend.js";
import { IContainer } from "../../Core/interface/IContainer.js";

export type StateConstructor = (new (...args: unknown[]) => object) | ((di: IContainer, ...args: unknown[]) => object);
export type RawInstance = Record<string | symbol, unknown>;
export type Instance = RawInstance;

export const SHARED_BUFFER = Symbol();

const tryIsClass = (instance: unknown) => {
  const asText = `${instance}`;

  if (asText.startsWith('class')) {
    return true;
  }
  else if (asText.startsWith('function')) {
    try {
      new (instance as new () => unknown)();
      return true;
    }
    catch {
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

  private createInstanceFromConstructor(storeCtx: StoreBackendContext, instance: StateConstructor, args: unknown[]): [RawInstance, InstanceContext] {
    const ctx = new InstanceContext(storeCtx);

    ctx.isClass = tryIsClass(instance);

    const storeInstance = ctx.isClass
      ? new (instance as new (...args: unknown[]) => unknown)(...args)
      : (instance as Function)(getNuxoblivius().getDI(), ...args);

    return [storeInstance, ctx];
  }

  protected abstract build(instance: RawInstance, ctx: Readonly<InstanceContext>): Instance;

  public buildOrFail(ctx: StoreBackendContext, instance: StateConstructor, args: unknown[]): Instance {
    return this.build(
      ...this.createInstanceFromConstructor(ctx, instance, args)
    );
  }
}
