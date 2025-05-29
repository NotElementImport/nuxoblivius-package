import { PropertyListService } from "../../../core/application/service/PropertyListService.js";
import { PropertyInfo } from "../../../core/domain/valueObject/ProperyInfo.js";
import { Nox } from "../../../core/Nox.js";

export class StoreService<T> {
  private mainInstance!: T;

  public constructor(
    private readonly classItem: { new(): T },
    private readonly propertyList: PropertyListService = Nox.getInstance().container.inject(PropertyListService)
  ) {
    this.createMainInstance();
  }

  private createMainInstance() {
    this.mainInstance = new this.classItem();

    for (const propName of Object.getOwnPropertyNames(this.mainInstance)) {
      this.propertyList.register(
        propName,
        new PropertyInfo(
          // @ts-ignore
          () => this.mainInstance[propName],
          // @ts-ignore
          (value) => this.mainInstance[propName] = value
        )
      );
    }
  }

  public getPropertyList(): PropertyListService {
    return this.propertyList;
  }

  public getInstance(): T {
    const tempInstance = new this.classItem();
    const backend = Nox.getInstance().getBackend();

    for (const propName of Object.getOwnPropertyNames(this.mainInstance)) {
      const parentProp = this.propertyList.get(propName);
      const state = backend.createState(parentProp.get());
      var isOutterChange = false;

      const unWatchParent = parentProp.onUpdate.watch((value) => {
        state.set(value);
        isOutterChange = true;
      });

      const unWatchState = backend.watch(state, (value) => {
        if (isOutterChange) {
          isOutterChange = false;
          return;
        }
        parentProp.set(value);
      });

      backend.onUnmount(() => {
        unWatchState();
        unWatchParent();
      });

      Object.defineProperty(tempInstance, propName, {
        get() {
          return state.get();
        },
        set(v: unknown) {
          state.set(v);
        }
      });
    }

    return tempInstance;
  }
};
