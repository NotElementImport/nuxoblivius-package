import { EProprtyType } from "../../domain/enum/EPropertyType.js";
import { IInspector } from "../../domain/interface/IInspector.js";
import { PropertyMeta } from "../../domain/meta/PropertyMeta.js";

export class PropertyInspector implements IInspector<PropertyMeta> {
  public *inspectAll(instance: object): Generator<PropertyMeta, void, unknown> {
    var checked: string[] = [];

    for (const propName of Object.getOwnPropertyNames(instance)) {
      checked.push(propName);

      yield new PropertyMeta(
        propName,
        Reflect.get(instance, propName, instance),
        EProprtyType.DEFAULT
      );
    }

    for (const [propName, info] of Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(instance)))) {
      if (checked.includes(propName)) {
        continue;
      }

      checked.push(propName);

      if (info.set && info.get) {
        yield new PropertyMeta(
          propName,
          null,
          EProprtyType.WRITEBLE_COMPUTED,
          info.get,
          info.set
        );
      }
      else if (info.get && !info.set) {
        yield new PropertyMeta(
          propName,
          null,
          EProprtyType.READONLY_COMPUTED,
          info.get
        );
      }
    }
  }
};
