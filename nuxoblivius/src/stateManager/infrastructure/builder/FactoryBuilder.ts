import { IStoreBuilder } from "../../domain/interface/IStoreBuilder.js";
import { Nuxoblivius } from "../../../core/Nuxoblivius.js";
import { EProprtyType } from "../../domain/enum/EPropertyType.js";
import { PropertyInspector } from "../inspector/PropertyInspector.js";
import { PropertyService } from "../../../core/application/service/ProperyService.js";
import { DeepClone } from "../../../core/intrastructure/utils/DeepClone.js";

const FactoryDestroyToken = Symbol();

export class FactoryBuilder implements IStoreBuilder<any, any> {
  private readonly propertyInspector = new PropertyInspector();

  public getInstance(store: new (...args: any) => any, ...args: any) {
    const nx = Nuxoblivius.getInstance();
    const backend = nx.getBackend();
    const garbage = nx.getGarbage();

    const instance = new store(...args);
    var cleanListCallback: Function[] = [];

    for (const propMeta of this.propertyInspector.inspectAll(instance)) {
      if (propMeta.isType(EProprtyType.DEFAULT)) {
        const property = new PropertyService({
          property: backend.newState(propMeta.getValue()),
          deepClone: DeepClone.getInstance(),
        });

        garbage.addProperty(property);
        cleanListCallback.push(
          () => garbage.removeProperty(property)
        );

        Object.defineProperty(instance, propMeta.getName(), {
          configurable: true,
          get() {
            return property.getValue();
          },
          set(v) {
            property.setValue(v);
          }
        });
      }
      else if (propMeta.isType(EProprtyType.READONLY_COMPUTED) || propMeta.isType(EProprtyType.WRITEBLE_COMPUTED)) {
        const property = backend.newComputed(() => propMeta.accessorGet().call(instance));
        const accessorSet = propMeta.accessorSet();

        Object.defineProperty(instance, propMeta.getName(), {
          configurable: true,
          get() {
            return property.getValue();
          },
          set(v) {
            if (accessorSet) {
              accessorSet.call(instance, v);
            }
          }
        });
      }
    }

    instance[FactoryDestroyToken] = () => {
      cleanListCallback.forEach((callback) => {
        callback();
      });

      cleanListCallback = [];
    };

    backend.onUnMounted(() => {
      instance[FactoryDestroyToken]();
    });

    return instance;
  }

  public destroyInstance(instance: any): boolean {
    if (instance && instance[FactoryDestroyToken]) {
      instance[FactoryDestroyToken]();
      return true;
    }

    return false;
  }
};
