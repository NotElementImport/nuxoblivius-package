import { URLInfo } from "../../domain/valueObject/URLInfo.js";
import type { IUrlTransform } from "../../domain/interface/IUrlTransform.js";
import type { PathParams } from "../../domain/valueObject/PathParams.js";
import { QueryParams } from "../../domain/valueObject/QueryParams.js";


export class DefaultUrlTransform implements IUrlTransform {
  public transform(url: string, pathParams: PathParams, queryParams: QueryParams): string {
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
        const [nameParam, rightUrl] = item.split("}", 2);

        if (rightUrl == null) {
          return item;
        }

        if (pathParams.has(nameParam)) {
          return `${pathParams.get(nameParam)}` + rightUrl;
        }

        return rightUrl;
      })
      .join("");

    // Append query:
    const urlInfo = new URLInfo(finalUrl);

    const urlQueryParams = new QueryParams(urlInfo.getQueryAsObject())
      .merge(queryParams);

    // Concat query and url path
    return urlInfo.getPathWithOrigin() + urlQueryParams.toString();
  }
};
