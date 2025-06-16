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

    const instance = new store();
    const storageValue: any = {};

    for (const propMeta of this.propertyInspector.inspectAll(instance)) {
      if (propMeta.isType(EProprtyType.DEFAULT)) {
        const propName = propMeta.getName();
        storageValue[propName] = propMeta.getValue();

        const propertyRef = new PropertyInfo(
          function () { return storageValue[propName] },
          function (v: unknown) { storageValue[propName] = v }
        );

        const property = new PropertyService({
          property: propertyRef,
          deepClone: DeepClone.getInstance(),
        });

        garbage.addProperty(property);

        const ctx = this;

        Object.defineProperty(instance, propName, {
          get() {
            return property.getValue();
          },
          set(v) {
            ctx.childrens.forEach((child) => {
              child[`&${propName}`] = v;
            });
            property.setValue(v);
          }
        });
      }
    }

    this.parent = instance;

    backend.onUnMounted(() => {
      this.clearParent();
    });

    return instance;
  }

  public getInstance(store: new (...args: any) => any, ...args: any) {
    const backend = Nuxoblivius.getInstance().getBackend();

    const instance = new store(...args);
    const parentInstance = this.getParentInstance(store);

    var localCleanListDestroy: Function[] = [];

    for (const propMeta of this.propertyInspector.inspectAll(instance)) {
      const propName = propMeta.getName();

      if (propMeta.isType(EProprtyType.DEFAULT)) {
        if (`&${propName}` in instance) {
          continue;
        }

        const property = backend.newState(Reflect.get(parentInstance, propName, parentInstance));

        let isInnerChanges = false;

        localCleanListDestroy.push(
          backend.watch(property, () => {
            if (!isInnerChanges) {
              Reflect.set(parentInstance, propName, property.getValue(), parentInstance);
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
            // console.log(propName, property.getValue());
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
