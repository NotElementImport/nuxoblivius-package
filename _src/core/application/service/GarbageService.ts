import { PropertyInfo } from "../../domain/valueObject/ProperyInfo.js";
import { PropertyListService } from "./PropertyListService.js";

export class GarbageService {
  private propertyList = new Set<PropertyListService>();
  private uniqPropertyList = new Set<PropertyInfo>();

  public registerService(service: PropertyListService) {
    this.propertyList.add(service);
  }

  public registerProprty(propInfo: PropertyInfo<any>) {
    this.uniqPropertyList.add(propInfo);
  }

  public cleanUp() {
    for (const [_, service] of this.propertyList.entries()) {
      service.resetAll();
    }

    for (const [_, service] of this.uniqPropertyList.entries()) {
      service.reset();
    }
  }
};
