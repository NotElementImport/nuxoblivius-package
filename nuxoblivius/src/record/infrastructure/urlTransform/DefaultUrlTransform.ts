import type { IUrlTransform } from "../../domain/interface/IUrlTransform.js";
import { PathParams } from "../../domain/valueObject/PathParams.js";

export class DefaultUrlTransform implements IUrlTransform {
  public transform(url: string, pathParams: PathParams): string {
    var finalUrl = url;

    // Parse `...` structure
    if (pathParams.has("...")) {
      const unpackSignValue = pathParams.get("...");

      finalUrl = finalUrl.replaceAll(
        "...",
        (Array.isArray(unpackSignValue) ? unpackSignValue : [unpackSignValue]).join("/")
      );
    }

    // Parse `/{name}` structure getting `name -> pathParams.get('name')`
    finalUrl = finalUrl.split("{")
      .map((item) => {
        const parts = item.split("}", 2);

        if (parts.length != 2 || !pathParams.has(parts[0])) {
          return item;
        }

        return `${pathParams.get(parts[0])}${parts[1]}`;
      }).join("");

    return finalUrl;
  }
};
