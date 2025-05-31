import { IDeepClone } from "../../domain/interface/IDeepClone.js";
import { IObservable } from "../../domain/interface/IObservable.js";
import { PropertyInfo } from "../../domain/valueObject/PropertyInfo.js";

export interface IPropertyConfig<T> {
  property: PropertyInfo<T>,
  observer: IObservable<T>,
  deepClone: IDeepClone
}

export class PropertyService<T> {
  private readonly initialValue: T;

  private readonly propertyInfo: PropertyInfo<T>;
  private readonly observer: IObservable<T>;
  private readonly deepClone: IDeepClone;

  public constructor(config: IPropertyConfig<T>) {
    this.propertyInfo = config.property;
    this.observer = config.observer;
    this.deepClone = config.deepClone;

    this.initialValue = this.deepClone.clone(
      this.propertyInfo.getValue()
    );
  }

  public getObserver(): typeof this.observer {
    return this.observer;
  }

  public getValue(): T {
    return this.propertyInfo.getValue();
  }

  public setValue(value: T): void {
    this.propertyInfo.setValue(value);

    // Tell to subs, value change
    this.observer.dispatch(
      this.getValue()
    );
  }

  public destroy(): void {
    this.observer.cleanUp();

    // Reset value to default
    this.propertyInfo.setValue(
      this.deepClone.clone(this.initialValue)
    );
  }
};
