interface HttpResponseBodySafe extends HttpResponse {
  getBody<T = unknown>(): T;
};

interface HttpResponseErrorSafe extends HttpResponse {
  getError(): Error;
};

export class HttpResponse {
  private readonly _hrefAsUrl: URL;
  private _isOkComputed: boolean;
  private _error: Error;
  private _dataTransfer: Record<string, unknown>;

  public constructor(
    href: string,
    private readonly _headers: Headers,
    private _body: unknown,
    private readonly _status: number,
    private readonly _isOk: boolean,
  ) {
    this._hrefAsUrl = new URL(href);
    this._isOkComputed = this._isOk;
  }

  public getUrl(): URL {
    return this._hrefAsUrl;
  }

  public getHeaders(): Headers {
    return this._headers;
  }

  public hasBody(): this is HttpResponseBodySafe {
    return this._body != null;
  }

  public getBody<T extends unknown>(): T | undefined {
    return this._body as T;
  }

  public setBody(body: unknown): void {
    this._body = body;
  }

  public getStatus(): number {
    return this._status;
  }

  public addDataToTransfer(name: string, value: unknown): void {
    this._dataTransfer[name] = value;
  }

  public getDataFromTransfer<T>(name: string, defaultValue: T = null as T): T {
    return this._dataTransfer[name] ?? defaultValue as any;
  }

  public getAllDataFromTransfer() {
    return this._dataTransfer;
  }

  public setError(error: Error) {
    this._isOkComputed = false;
    this._error = error;
  }

  public getError(): Error | undefined {
    return this._error ?? new Error(this._body as any);
  }

  public hasError(): this is HttpResponseErrorSafe {
    return this._error != null;
  }

  public isOk(): boolean {
    return this._isOk == true && this._isOkComputed == true;
  }
};
