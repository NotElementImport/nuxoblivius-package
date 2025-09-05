import type { IRecordModule, IRecordModuleRequestContext, IRecordModuleResponseContext } from "../../domain/interface/IRecordModule.js";
import { HttpResponse } from "../../domain/valueObject/HttpResponse.js";

export class RecordModuleTransformers implements IRecordModule {
  private _isSetuped: boolean = false;

  public constructor(
    private _listOfModules: IRecordModule[]
  ) { }

  public onSetup(): void {
    for (var i = 0; i < this._listOfModules.length; i++) {
      this._listOfModules[i].onSetup();
    }
  }

  public beforeRequest(context: IRecordModuleRequestContext): void | HttpResponse {
    if (!this._isSetuped) {
      this.onSetup();
      this._isSetuped = false;
    }

    var response: void | HttpResponse;

    for (var i = 0; i < this._listOfModules.length; i++) {
      response = this._listOfModules[i].beforeRequest(context);

      if (response && response instanceof HttpResponse) {
        return response;
      }
    }
  }

  public afterRequest(context: IRecordModuleResponseContext): void | IRecordModuleResponseContext {
    var response: void | IRecordModuleResponseContext;

    for (var i = 0; i < this._listOfModules.length; i++) {
      response = this._listOfModules[i].afterRequest(context);

      if (response && typeof response === "object") {
        context = response;
      }
    }
  }

  public onClean(): void {
    for (var i = 0; i < this._listOfModules.length; i++) {
      this._listOfModules[i].onClean();
    }
  }

  public getList(): IRecordModule[] {
    return this._listOfModules;
  }
}
