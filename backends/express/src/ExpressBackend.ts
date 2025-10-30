import { BasicBackend } from "@nuxoblivius_builds/core/Core/Backend/Basic";
import { CallStoreHandle, StoreBackendContext, StoreType } from "@nuxoblivius_builds/core/Core/Backend/Interface";

export class ExpressController {
  private _tempUnLoadListiners: Function[] = [];
  private _alwaysUnLoadListiners: Function[] = [];
  private _alwaysLoadListiners: Function[] = [];

  public unLoad(): void {
    for (const callback of this._tempUnLoadListiners) {
      callback();
    }
    this._tempUnLoadListiners = [];

    for (const callback of this._alwaysUnLoadListiners) {
      callback();
    }
  }

  public onUnLoadWeak(handle: Function) {
    this._tempUnLoadListiners.push(handle);
  }

  public onUnLoad(handle: Function) {
    this._alwaysUnLoadListiners.push(handle);
  }

  public onLoad(handle: Function) {
    this._alwaysLoadListiners.push(handle);
  }
}

export class ExpressContexnt extends StoreBackendContext {
  public constructor(isMuted: boolean, controller: ExpressController) {
    super({ isMuted });
    controller.onUnLoadWeak(() => this.unMount());
  }
}

export class ExpressBackend extends BasicBackend {
  public constructor(private readonly _controller: ExpressController) {
    super();
  }

  public inContext(): StoreBackendContext {
    return new ExpressContexnt(this.isMuted, this._controller);
  }

  public storeTransform(handle: CallStoreHandle): StoreType {
    return super.storeTransform((ctx) => {
      const response = handle(ctx);
      ctx.mount();
      return response;
    });
  }
}
