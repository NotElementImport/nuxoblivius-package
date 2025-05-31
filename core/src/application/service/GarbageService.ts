import { PropertyService } from "./ProperyService.js";

export class GarbageService {
  private propertyList = new Set<PropertyService<any>>();

  public addProperty(item: PropertyService<any>) {
    this.propertyList.add(item);
  }

  public clean() {
    this.propertyList.forEach((value) => {
      value.destroy();
    });
  }
}
