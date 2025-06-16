export interface ICacheRecordConfig {
  url: string;
  params?: Record<string, any>;
  headers?: Headers | Record<string, any>;
  body?: any;
};

export class CacheRecord {
  private readonly path: string;
  private readonly headers: Headers;
  private readonly params: Record<string, any>;
  private readonly body?: string;

  public constructor(config: ICacheRecordConfig) {
    this.path = config.url;

    this.headers = new Headers();
    if (config.headers) {
      this.headers = config.headers instanceof Headers
        ? config.headers
        : new Headers(config.headers);
    }

    this.params = config.params ?? {};
    this.body = config.body;
  }

  public getParams() {
    return this.params;
  }

  public getPath() {
    return this.path;
  }

  public getPathAsUrl() {
    if (this.path.startsWith("http")) {
      return new URL(this.path);
    }
    return new URL(this.path, "http://localhost");
  }

  public getHeaders() {
    return this.headers;
  }

  public getBody() {
    return this.body;
  }
};
