import { IRequestTransform } from "../../domain/interface/IRequestTransform.js";

export class DefaultRequestTransform implements IRequestTransform {
  public transform(request: RequestInit): RequestInit {
    var { headers, body } = request;

    if (!(headers instanceof Headers)) {
      headers = new Headers(headers ?? {});
    }

    if (body != null) {
      if (body instanceof URLSearchParams) {
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        body = body.toString();
      }
      else if (!(body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(body);
      }
    }

    const childRequest = { ...request, body, headers };

    return childRequest;
  }
};
