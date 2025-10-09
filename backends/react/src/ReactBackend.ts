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
  const value = useRef<T>(null);

  value.current ??= define(ctx);

  useEffect(() => {
    ctx.mount();

    return () => {
      ctx.unMount();
    };
  }, []);

  return value.current;
};

class ReactCtx extends StoreBackendContext {
  private _setState!: Function;
  private _stateIndex: number = 0;
  private _ctxIndex: number = 0;

  private _onMount: Function[] = [];
  private _onUnMount: Function[] = [];

  public get index() {
    return `${this._ctxIndex} / ${this._stateIndex}`;
  };

  public constructor() {
    super();
    this._ctxIndex = Math.floor(Math.random() * 10000);
  }

  public useSetTrigger(value: Function): void {
    this._stateIndex = Math.floor(Math.random() * 10000);
    this._setState = value;
  }

  public setTrigger(): void {
    try {
      this._setState();
    }
    catch (e) { }
  }

  public onMount(handle: Function): void {
    this._onMount.push(handle);
  }

  public onUnMount(handle: Function): void {
    this._onUnMount.push(handle);
  }

  public mount(): void {
    this._onMount.forEach((callback) => {
      callback();
    });
  }

  public unMount(): void {
    this._onUnMount.forEach((callback) => {
      callback();
    });
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
  private _activeCtx?: ReactCtx;

  public override onMounted(handle: () => void): void {
    if (this._activeCtx) {
      this._activeCtx.onMount(handle);
    }
  }

  public override onUnMounted(handle: () => void): void {
    if (this._activeCtx) {
      this._activeCtx.onUnMount(handle);
    }
  }

  public override inContext(): StoreBackendContext {
    return useReactCtx();
  }

  public override getActiveContext(): ReactCtx {
    if (this._activeCtx) {
      return this._activeCtx;
    }

    return this.inContext() as any;
  }

  public override storeTransform(handle: CallStoreHandle): StoreType {
    if (this.isMuted) {
      return handle(new StoreBackendContext());
    }

    const ctx = this.getActiveContext();

    if (this._activeCtx) {
      return handle(ctx);
    }

    return withReactCtx(() => {
      const oldCtx = this._activeCtx;

      this._activeCtx = ctx;
      const store = handle(ctx);
      this._activeCtx = oldCtx;

      return store
    }, ctx);
  }

  public override createProperty<T>(value: T, ctx: StoreBackendContext): BackendProperty<T> {
    return new ReactProperty(value, ctx as any);
  }
}
