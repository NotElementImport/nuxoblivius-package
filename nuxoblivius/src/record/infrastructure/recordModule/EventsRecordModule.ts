import type { IBeforeRequestType, IRecordModule, IRecordModuleRequestContext, IRecordModuleResponseContext } from "../../domain/interface/IRecordModule.js";
import { HttpResponse } from "../../domain/valueObject/HttpResponse.js";

interface IEventsRecordModuleConfig {
  onFinish: (response: HttpResponse) => void;
  onError: (error: Error, response: HttpResponse) => void;
}

export class EventsRecordModule implements IRecordModule {
  public constructor(
    private readonly _config: IEventsRecordModuleConfig
  ) { }

  public onSetup(): void { }
  public onClean(): void { }
  public beforeRequest(_: IRecordModuleRequestContext): IBeforeRequestType { }

  public afterRequest(context: IRecordModuleResponseContext): void | IRecordModuleResponseContext {
    const response = context.response;
    const isOk = response.isOk();

    if (isOk) {
      this._config.onFinish(response);
    }
    else {
      this._config.onError(
        response.getData<Error>() as Error,
        response
      );
    }
  }
}
