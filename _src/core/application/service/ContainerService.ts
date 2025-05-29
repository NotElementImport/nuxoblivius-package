import type { Instance, Token, SimpleFactory } from "../../domain/interface/IContainer.js";

export class ContainerService {
  private container = new Map<Token, Instance | SimpleFactory>();

  public register<T>(item: Token<T>, store: Instance<T> | SimpleFactory<T>): void {
    this.container.set(item, store);
  }

  public inject<T>(item: Token<T>): T {
    if (!this.container.has(item) && typeof item === "symbol") {
      throw new Error("Container [Error]: Symbol Token has not implement");
    }

    var setupInstance = (this.container.get(item) as Function);
    setupInstance ??= item as Function;

    return setupInstance.name === ""
      ? setupInstance()
      // @ts-ignore Its Contructor
      : new setupInstance();
  }
}
