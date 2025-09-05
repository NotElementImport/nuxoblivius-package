export interface ICacheRecordConfig {
  url: string;
  params?: Record<string, any>;
  headers?: Headers | Record<string, any>;
  body?: any;
  dataTransfer?: Record<string, unknown>;
};

export class CacheRecord {
  private readonly path: string;
  private readonly headers: Headers;
  private readonly params: Record<string, any>;
  private readonly body: unknown;
  private readonly createdAt: number;
  private readonly dataTransfer: Record<string, unknown>;

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
    this.createdAt = Date.now();
    this.dataTransfer = config.dataTransfer;
  }

  public getParams() {
    return this.params;
  }

  public getPath() {
    return this.path;
  }

  public getCreatedAt() {
    return this.createdAt;
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

  public getDataTransfer() {
    return this.dataTransfer;
  }

  public toResponse(): Response {
    return new Response(this.body as BodyInit, {
      headers: this.headers,
      status: 200
    });
  }

  public toString(): string {
    var body = {};
    var bodyType = "NONE";

    if (this.body && !(this.body instanceof FormData)) {
      if (this.body instanceof URLSearchParams) {
        body = Object.fromEntries(this.body);
        bodyType = "URL";
      }
      else {
        body = this.body;
        bodyType = "JSON";
      }
    }
    else if (this.body instanceof FormData) {
      console.warn("Cache: FormData cannot be translated to string");
      bodyType = "FORMDATA";
    }

    return JSON.stringify({
      headers: Object.fromEntries(this.headers.entries()),
      bodyType,
      body,
      dataTransfer: this.getDataTransfer(),
      url: this.path,
      params: this.params
    });
  }

  public static fromJson(jsonString: string): CacheRecord {
    try {
      const item = JSON.parse(jsonString);

      var body = null;
      const bodyType = item.bodyType ?? null;

      if (bodyType == "JSON") {
        body = item.body;
      }
      else if (bodyType == "URL") {
        body = new URLSearchParams(item.body);
      }

      return new CacheRecord({
        url: item.url,
        body: body,
        dataTransfer: item.dataTransfer,
        headers: new Headers(item.headers),
        params: item.params
      })
    }
    catch (e) {
      throw new Error("[ERROR] CacheRecord::from -> Wrong format");
    }
  }
};
