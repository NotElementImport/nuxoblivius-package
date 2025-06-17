import { IDeepClone } from "../../domain/interface/IDeepClone.js";

export class DeepClone implements IDeepClone {
  private static instance: DeepClone;
  public static getInstance() {
    if (!this.instance)
      this.instance = new DeepClone();
    return this.instance;
  }

  public clone<T>(item: T): T {
    if (typeof item !== "object")
      return item;
    return structuredClone(item);
  }
}
