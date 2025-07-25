import { IResponseTransform } from "../../domain/interface/IResponseTransform.js";
import { HttpResponse } from "../../domain/valueObject/HttpResponse.js";

export class DefaultResponseTransform implements IResponseTransform {
  private async tryTransformBlob(response: HttpResponse, originalResponse: Response) {
    const { headers } = originalResponse;
    const contentTransferEncoding = headers.get("Content-Transfer-Encoding");
    const contentType = headers.get("Content-Type") ?? "text/plain";
    const contentDisposition = headers.get("Content-Disposition") ?? "";

    if (contentDisposition) {
      contentDisposition.split(";").map((item) => {
        item = item.trim();

        const [name, value] = item.split("=").map((item) => {
          return item[0] == '"' ? item.slice(1, -1) : item;
        });

        response.addDataToTransfer(
          name, value ?? true
        );
      });
    }

    try {
      if (contentTransferEncoding) {
        if (contentTransferEncoding == "base64") {
          const bodyContent = atob(await originalResponse.text());

          response.setBody(
            new Blob([
              Uint8Array.from(bodyContent, ch => ch.charCodeAt(0))
            ], { type: contentType })
          );
          return;
        }
      }

      response.setBody(await originalResponse.blob());
    }
    catch (e) {
      response.setError(e instanceof Error ? e : new Error(e as any));
    }
  }

  public async transform(response: HttpResponse, originalResponse: Response): Promise<HttpResponse> {
    const { headers, bodyUsed, status } = originalResponse;
    const contentType = headers.get("Content-Type") ?? "text/plain";

    if (status == 204 || bodyUsed) {
      return response;
    }

    // Convert body
    const trySetBody = async (method: Function) => {
      try {
        response.setBody(await method());
      }
      catch (e) {
        response.setError(e instanceof Error ? e : new Error(e as any));
      }
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
    else if (contentType.startsWith("application/")
      || contentType.startsWith("images/")
      || contentType.startsWith("video/")
      || contentType.startsWith("audio/")
    ) {
      await this.tryTransformBlob(response, originalResponse);
    }
    else {
      await trySetBody(() => originalResponse.text());
    }

    return response;
  }
};
