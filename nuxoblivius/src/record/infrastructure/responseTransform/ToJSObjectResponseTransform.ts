
import { IResponseTransform } from "../../domain/interface/IResponseTransform.js";
import { HttpResponse } from "../../domain/valueObject/HttpResponse.js";

export class ToJSObjectResponseTransform implements IResponseTransform {
  public async transform(response: HttpResponse, originalResponse: Response): Promise<HttpResponse> {
    // If Response cannot be proccesed
    if (!response.hasData() || !response.isOk()) {
      return response;
    }

    // Read converted data
    const rawBody = response.getData();

    // If meets FormData or URLSearchParams convert to JSObject
    if (rawBody instanceof FormData || rawBody instanceof URLSearchParams) {
      return response.extend({
        body: Object.fromEntries(rawBody.entries())
      });
    }

    // Blob and other stuff don't touch
    return response;
  }
}
