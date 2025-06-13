import { IStoreBuilder } from "../../domain/interface/IStoreBuilder.js";
import { Nuxoblivius } from "../../../core/Nuxoblivius.js";
import { EProprtyType } from "../../domain/enum/EPropertyType.js";
import { PropertyInspector } from "../inspector/PropertyInspector.js";
import { PropertyService } from "../../../core/application/service/ProperyService.js";
import { DeepClone } from "../../../core/intrastructure/utils/DeepClone.js";
import { PropertyInfo } from "../../../core/domain/valueObject/PropertyInfo.js";

const SingletonDestroyToken = Symbol();

export class SingletonBuilder implements IStoreBuilder<any, any> {
  private readonly propertyInspector = new PropertyInspector();

  private parent?: any;
  private cleanListCallback: Function[] = [];
  private childrens: Set<any> = new Set();

  protected getParentInstance(store: new (...args: any) => any) {
    if (this.parent) {
      return this.parent;
    }

    const nx = Nuxoblivius.getInstance();
    const garbage = nx.getGarbage();
    const backend = nx.getBackend();

    this.parent = new store();

    for (const propMeta of this.propertyInspector.inspectAll(this.parent)) {
      const propName = propMeta.getName();

      if (propMeta.isType(EProprtyType.DEFAULT)) {
        var propValue: unknown = propMeta.getValue();

        const property = new PropertyService({
          property: new PropertyInfo(
            () => propValue,
            (v: unknown) => { propValue = v }
          ),
          deepClone: DeepClone.getInstance(),
        });

        garbage.addProperty(property);

        Object.defineProperty(this.parent, propName, {
          configurable: false,
          get: () => {
            return property.getValue();
          },
          set: (v) => {
            this.childrens.forEach((child) => {
              child[`&${propName}`] = v;
            });
            property.setValue(v);
          }
        });
      }
    }

    backend.onUnMounted(() => {
      this.clearParent();
    });

    return this.parent;
  }

  public getInstance(store: new (...args: any) => any, ...args: any) {
    const backend = Nuxoblivius.getInstance().getBackend();

    const instance = new store(...args);
    const parentInstance = this.getParentInstance(store);

    var localCleanListDestroy: Function[] = [];

    for (const propMeta of this.propertyInspector.inspectAll(instance)) {
      const propName = propMeta.getName();

      if (propMeta.isType(EProprtyType.DEFAULT)) {
        if (instance[`&${propName}`]) {
          continue;
        }

        const property = backend.newState(parentInstance[propName]);

        let isInnerChanges = false;

        localCleanListDestroy.push(
          backend.watch(property, () => {
            if (!isInnerChanges) {
              parentInstance[propName] = property.getValue();
            }
            isInnerChanges = false;
          })
        );

        // Callback for parent
        Object.defineProperty(instance, `&${propName}`, {
          set(v) {
            isInnerChanges = true;
            property.setValue(v);
          }
        });

        Object.defineProperty(instance, propName, {
          configurable: true,
          get() {
            return property.getValue();
          },
          set(v) {
            parentInstance[propName] = v;
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

    instance[SingletonDestroyToken] = () => {
      if (!this.childrens.has(instance)) {
        return;
      }

      // Break all relation with parent

      localCleanListDestroy.forEach((callback) => {
        callback();
      });

      localCleanListDestroy = [];

      // Remove at self

      this.childrens.delete(instance);
    };

    backend.onUnMounted(() => {
      instance[SingletonDestroyToken]();
    });

    this.childrens.add(instance);

    return instance;
  }

  public clearParent() {
    // Delete self from Garbage

    this.cleanListCallback.forEach((callback) => {
      callback();
    });

    this.cleanListCallback = [];

    // Break all relations with childrens

    this.childrens.forEach((instance) => {
      this.destroyInstance(instance);
    });

    this.childrens.clear();

    // Remove at self

    this.parent = undefined;
  }

  public hasParent() {
    return !!this.parent;
  }

  public destroyInstance(instance: any): boolean {
    if (instance && instance[SingletonDestroyToken]) {
      instance[SingletonDestroyToken]();
      return true;
    }

    return false;
  }
};
