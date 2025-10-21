import { startTransition, useEffect, useRef, useState } from 'react';
import { BasicBackend, BasicProperty } from "@nuxoblivius_builds/core/Core/Backend/Basic";
import { type CallStoreHandle, type StoreType, BackendProperty, StoreBackendContext } from "@nuxoblivius_builds/core/Core/Backend/Interface";

const useReactCtx = () => {
  const ctx = useRef<ReactCtx>(null);
  const [_, setState] = useState(0);

  ctx.current ??= new ReactCtx();
  ctx.current.useSetTrigger(() => {
    startTransition(() => {
      setState(v => v + 1);
    });
  });

  return ctx.current;
};

const withReactCtx = <T extends unknown>(define: ((ctx: ReactCtx) => T), ctx: ReactCtx) => {
  try {
    const value = useRef<T>(null);

    value.current ??= define(ctx);

    useEffect(() => {
      ctx.storeInit(value.current);
      ctx.mount();

      return () => {
        ctx.unMount();
      };
    }, []);

    return value.current;
  }
  catch (e) {
    console.warn(e);
    return define(ctx);
  }
};

class ReactCtx extends StoreBackendContext {
  private _setState!: Function;

  public constructor() {
    super({ isMuted: false });
  }

  public useSetTrigger(value: Function): void {
    this._setState = value;
  }

  public setTrigger(): void {
    super.setTrigger();
    try {
      this._setState();
    }
    catch (e) { }
  }
}

class ReactProperty<T> extends BasicProperty<T> {
  private readonly ctx: ReactCtx;

  public constructor(value: T, ctx: ReactCtx) {
    super(value);
    this.ctx = ctx;
  }

  protected override notifySubs(newValue: T, oldValue: T): void {
    super.notifySubs(newValue, oldValue);

    if (newValue !== oldValue) {
      this.ctx.setTrigger();
    }
  }
}

export class ReactBackend extends BasicBackend {
  public override inContext(): StoreBackendContext {
    return this.isMuted
      ? new StoreBackendContext({ isMuted: true })
      : useReactCtx();
  }

  public override storeTransform(handle: CallStoreHandle): StoreType {
    const activeCtx = this.getActiveContext();

    if (activeCtx) {
      return handle(activeCtx);
    }

    if (this.isMuted) {
      return this.scopeContext(this.inContext(), (ctx) => handle(ctx));
    }

    return withReactCtx((ctx) => {
      return this.scopeContext(ctx, () => handle((ctx)));
    }, useReactCtx());
  }

  public override createProperty<T>(value: T, ctx: StoreBackendContext): BackendProperty<T> {
    return new ReactProperty(value, ctx as any);
  }
}
