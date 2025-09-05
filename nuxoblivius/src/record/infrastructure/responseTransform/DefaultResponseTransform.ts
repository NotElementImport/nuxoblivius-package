import { IResponseTransform } from "../../domain/interface/IResponseTransform.js";
import { HttpResponse } from "../../domain/valueObject/HttpResponse.js";

export class DefaultResponseTransform implements IResponseTransform {
  public async transform(response: HttpResponse, originalResponse: Response): Promise<HttpResponse> {
    const { headers, bodyUsed, status } = originalResponse;

    const contentType = headers.get("Content-Type") ?? "text/plain";

    // If status 204 (empty) or body used drop transform 
    if (status == 204 || bodyUsed) {
      return response;
    }

    // Resolve response stream object
    const trySetBody = async (method: Function) => {
      response = response.extend({
        body: await method().catch((e: any) => {
          return e instanceof Error ? e : new Error(e);
        })
      });
    };

    if (contentType.startsWith("application/json")) {
      await trySetBody(() => originalResponse.json());
    }
    else if (contentType.startsWith("application/multimedia")) {
      await trySetBody(() => originalResponse.formData());
    }
    else if (contentType.startsWith("application/x-www-form-urlencoded")) {
      await trySetBody(async () => new URLSearchParams(await originalResponse.text()));
    }
    else if (contentType.startsWith("text/")) {
      await trySetBody(() => originalResponse.text());
    }

    return response;
  }
};
