import type { ContainerToken, FactoryValue, IContainer, SingletonValue, ToToken } from "../interface/IContainer.js";

abstract class ContainerValue {
  public constructor(
    private readonly _value: SingletonValue | FactoryValue
  ) { }

  public abstract getInstance(...args: unknown[]): unknown;

  public onClean(): void { }
  public makeInstance(...args: unknown[]): unknown {
    if (typeof this._value === "function") {
      // is constructor
      if (this._value.name != "") {
        return new (this._value as new (...args: unknown[]) => unknown)(...args);
      }

      return (this._value as Function)(...args);
    }

    return this._value;
  }
}

class FactoryContainerValue extends ContainerValue {
  public getInstance(...args: unknown[]): unknown {
    return this.makeInstance(...args);
  }
}

class SingletonContainerValue extends ContainerValue {
  private _existValue: unknown;

  public getInstance(...args: unknown[]): unknown {
    if (!this._existValue) {
      this._existValue = this.makeInstance(...args);
    }

    return this._existValue;
  }

  public override onClean(): void {
    this._existValue = undefined;
  }
}

export class BasicContainer implements IContainer {
  public constructor(
    private _container: Map<ContainerToken, ContainerValue> = new Map()
  ) { }

  public factory<T, E extends any[]>(token: ContainerToken<T, any>, value: FactoryValue<T, E>): IContainer {
    this._container.set(
      token, new FactoryContainerValue(
        value
      )
    );

    return this;
  }

  public singleton<T>(token: ContainerToken<T, any>, value: SingletonValue<T>): IContainer {
    this._container.set(
      token, new SingletonContainerValue(
        value
      )
    );

    return this;
  }

  public inject<T, ARGS extends any[]>(token: ContainerToken<T, ARGS>, ...args: ARGS | []): T | null {
    const container = this._container.get(token as ContainerToken);

    if (!container) {
      return null;
    }

    return container.getInstance(...args) as T;
  }

  public injectOrError<T, ARGS extends unknown[]>(token: ContainerToken<T, ARGS>, ...args: ARGS | []): T {
    if (!this._container.has(token as ContainerToken)) {
      throw new Error("Token not exist in container");
    }

    return this.inject(token, ...args);
  }

  public injectOrCreate<T, ARGS extends unknown[]>(token: new (...args: ARGS) => T, ...args: ARGS): T {
    const value = this.inject(token, ...args);

    if (!value) {
      return new token(...args);
    }

    return value;
  }

  public createScopeContainer(): IContainer {
    const parent = this;

    const childContainer = new Proxy(new Map(), {
      get(target, prop, reciver) {
        if (prop === "set") {
          return function (key: ContainerToken, value: ContainerValue) {
            parent._container.set(key, value);
            return target.set(key, value);
          }
        }

        const value = (target as unknown as Record<string, unknown>)[prop as string];

        if (typeof value === "function") {
          return value.bind(target);
        }

        return value;
      }
    });

    const child = new BasicContainer(childContainer);

    return child;
  }

  public clean(): boolean {
    for (const value of this._container.values()) {
      value.onClean();
    }

    return !!this._container.size;
  }
}
