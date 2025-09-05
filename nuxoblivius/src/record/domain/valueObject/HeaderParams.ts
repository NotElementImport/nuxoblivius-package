import { BaseParams } from "./BaseParams.js";
export class HeaderParams extends BaseParams<HeaderParams> {
  public toJsHeaders(): Headers {
    return new Headers(
      this.toObject() as HeadersInit
    );
  }
};
