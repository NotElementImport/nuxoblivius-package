interface HttpResponseBodySafe extends HttpResponse {
  getData<T = unknown>(): T;
};

interface HttpResponseBodyError extends HttpResponse {
  getData<T = Error>(): T;
};

interface HttpResponseConfig {
  headers: Headers;
  status: number;
  body?: unknown | Error;
  dataTransfer?: Record<string, unknown>;
};

export class HttpResponse {
  private readonly _isOkComputed: boolean;
  private readonly _error: Error;

  public constructor(
    private readonly _config: Readonly<HttpResponseConfig>
  ) {
    if (this._config.body instanceof Error) {
      this._error = this._config.body;
    }

    const statusFirstNum = +`${this._config.status}`[0];
    const isStatusError = !(statusFirstNum == 2 || statusFirstNum == 3);

    // @ts-ignore
    if (isStatusError && typeof this._config.body === "object" && this._config.body.message) {
      // @ts-ignore
      this._error = new Error(this._config.body.message);
    }

    this._isOkComputed = !isStatusError || (this._error == null);
  }

  public getHeaders(): Headers {
    return this._config.headers;
  }

  public isOk(): boolean {
    return this._isOkComputed;
  }

  public isNotOk(): this is HttpResponseBodyError {
    return !this.isOk();
  }

  public hasData(): this is HttpResponseBodySafe {
    return this._config.body != null;
  }

  public getData<T = unknown>(): T | undefined {
    return this._error as any || this._config.body;
  }

  public getStatus(): number {
    return this._config.status;
  }

  public getValueFromTransfer<T = unknown>(name: string, defaultValue: T): T {
    return (this._config.dataTransfer?.[name] as T) ?? defaultValue;
  }

  public extend(value: Partial<HttpResponseConfig> | ((oldValue: HttpResponseConfig) => HttpResponseConfig)) {
    const duplicateConfig: HttpResponseConfig = {
      body: this._config.body,
      dataTransfer: { ...this._config.dataTransfer },
      headers: new Headers(this._config.headers),
      status: this._config.status
    };

    if (typeof value === "function") {
      return new HttpResponse(value(duplicateConfig));
    }

    return new HttpResponse({
      ...duplicateConfig,
      ...value
    });
  }
};
