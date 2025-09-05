export class URLInfo {
  private readonly _hasOrigin: boolean;
  private readonly _url: URL;

  public constructor(private readonly _originalUrl: string | URL) {
    this._hasOrigin = true;

    if (this._originalUrl instanceof URL) {
      this._url = this._originalUrl;
    }
    else if (!this._originalUrl.startsWith("http")) {
      this._hasOrigin = false;
      var tempUrl = this._originalUrl;

      if (tempUrl[0] != "/") {
        tempUrl = `/${tempUrl}`;
      }

      tempUrl = `http://localhost${tempUrl}`;

      this._url = new URL(tempUrl);
    }
    else {
      this._url = new URL(this._originalUrl);
    }
  }

  public getPath(): string {
    return this._url.pathname;
  }

  public getPathWithOrigin(): string {
    return this.getOrigin() + this.getPath();
  }

  public getQuery(): URLSearchParams {
    return this._url.searchParams;
  }

  public getQueryAsObject(): Record<string, string> {
    return Object.fromEntries(this._url.searchParams.entries());
  }

  public getOrigin(): string {
    if (!this._hasOrigin) {
      return ``;
    }

    return this._url.origin;
  }
}
