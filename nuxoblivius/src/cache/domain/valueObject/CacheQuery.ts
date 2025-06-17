type PathExp = RegExp | string | ((path: URL) => boolean);
type QueryExp = RegExp | ((query: Record<string, any>) => boolean);
type HeadersExp = RegExp | ((headers: Headers) => boolean);
type ParamsExp = ((params: Record<string, any>) => boolean);

export interface ICacheQueryConfig {
  url?: PathExp;
  params?: ParamsExp;
  headers?: HeadersExp;
  query?: QueryExp;
};

export class CacheQuery {
  public static andRegExp(...formulas: RegExp[]): RegExp {
    let finalFormula = "";

    for (const formula of formulas) {
      finalFormula += `(?=.*(${formula.source}))`;
    }

    return new RegExp(finalFormula);
  }

  private readonly path?: PathExp;
  private readonly query?: QueryExp;
  private readonly headers?: HeadersExp;
  private readonly params?: ParamsExp;

  public constructor(config: ICacheQueryConfig) {
    this.path = config.url;
    this.params = config.params;
    this.query = config.query;
    this.headers = config.headers;
  }

  public checkUrl(url: URL): boolean {
    if (!this.path) {
      return true;
    }

    if (typeof this.path === "string") {
      return url.pathname == this.path;
    }
    else if (typeof this.path === "function") {
      return this.path(url);
    }

    return !!url.href.match(this.path);
  }

  public checkQuery(url: URL): boolean {
    if (!this.query) {
      return true;
    }

    if (typeof this.query === "function") {
      const query = Object.fromEntries(url.searchParams.entries());
      return this.query(query);
    }

    return !!decodeURIComponent(url.searchParams.toString()).match(this.query);
  }

  public checkHeader(header: Headers): boolean {
    if (!this.headers) {
      return true;
    }

    if (typeof this.headers === "function") {
      return this.headers(header);
    }

    const toUpperHeaderName = (key: string) => {
      return key.split("-")
        .map((v) => v[0].toUpperCase() + v.slice(1))
        .join("-");
    };

    var finalResponse: string[] = [];

    for (const [key, value] of header.entries()) {
      finalResponse.push(`${toUpperHeaderName(key)}: ${value};`);
    }

    return !!finalResponse.join(" ").match(this.headers);
  }

  public checkParams(params: Record<string, any>): boolean {
    if (!this.params) {
      return true;
    }

    return this.params(params);
  }
};
