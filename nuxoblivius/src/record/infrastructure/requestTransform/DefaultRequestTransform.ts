import { IRequestTransform } from "../../domain/interface/IRequestTransform.js";

export class DefaultRequestTransform implements IRequestTransform {
  public transform(request: RequestInit): RequestInit {
    var { headers, body } = request;

    // Convert JSObject to Headers
    if (!(headers instanceof Headers)) {
      headers = new Headers(headers ?? {});
    }

    // If body sets
    if (body != null) {
      // URLSearchParams to string, and set header
      if (body instanceof URLSearchParams) {
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        body = body.toString();
      }
      // JSON to string, and set header
      else if (!(body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(body);
      }
      // FormData automaticly set at self in Web
    }

    return { ...request, body, headers };
  }
};
