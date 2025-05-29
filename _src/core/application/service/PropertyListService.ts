import { PropertyInfo } from "../../domain/valueObject/ProperyInfo.js";

export class PropertyListService {
  private initialValueList = new Map<string, PropertyInfo>();

  public register(name: string, value: PropertyInfo<any>) {
    this.initialValueList.set(name, value);
  }

  public has(name: string): boolean {
    return this.initialValueList.has(name);
  }

  public get<T extends unknown>(name: string): PropertyInfo<T> {
    return this.initialValueList.get(name) as PropertyInfo<T>;
  }

  public resetAll(): void {
    for (const [_, value] of this.initialValueList.entries()) {
      value.reset();
    }
  }

  public reset(name: string): boolean {
    if (this.has(name)) {
      this.get(name).reset();
      return true;
    }
    return false;
  }
}
