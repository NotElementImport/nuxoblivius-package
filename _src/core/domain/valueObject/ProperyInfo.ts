import { DeepClone } from "./DeepClone.js";
import { Watchers } from "./Watchers.js";

export class PropertyInfo<T = unknown> {
  public static fromObject<T extends object, K extends keyof T>(item: T, key: K) {
    return new PropertyInfo<T[K]>(
      () => item[key],
      (value) => item[key] = value
    );
  }

  private initialValue: T;
  private deepClone: DeepClone<T>;

  public readonly onUpdate: Watchers<T> = new Watchers<T>();

  public constructor(
    private getter: () => T,
    private setter: (v: T) => void
  ) {
    this.deepClone = new DeepClone(
      getter()
    );

    this.initialValue = this.deepClone.clone() as T;
  }

  public set(value: T): void {
    this.setter(value);
    this.onUpdate.dispatch(this.get());
  }

  public get(): T {
    return this.getter();
  }

  public reset(): void {
    this.deepClone.set(this.initialValue);

    this.setter(
      this.deepClone.clone() as T
    );

    this.onUpdate.dispatch(this.get());
  }

  public toString(): string {
    return `${this.getter()}`;
  }
}
