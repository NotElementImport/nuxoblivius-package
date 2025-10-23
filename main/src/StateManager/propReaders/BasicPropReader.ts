import { IPropReader, PropInfo, PropInfoBasic } from "../interface/IPropReader.js";

class DataPropInfo implements PropInfo {
  public constructor(
    private readonly options: {
      basicType: boolean;
      propName: string;
      value?: unknown;
      set?: (v: unknown) => void;
      get?: () => unknown;
    }
  ) { }

  public get propName() {
    return this.options.propName;
  }

  public get value() {
    return this.options.value;
  }

  public get get() {
    return this.options.get;
  };

  public get set() {
    return this.options.set;
  }

  public isBasicType(): this is PropInfoBasic {
    return this.options.basicType;
  }
}

export class BasicPropReader implements IPropReader {
  public *getPropsFrom(object: object): Iterable<PropInfo> {
    for (const entry of Object.entries(Object.getOwnPropertyDescriptors(object))) {
      const [propName, info] = entry;

      if (!info.configurable) {
        continue;
      }

      if (info.value) {
        yield new DataPropInfo({
          propName,
          basicType: true,
          value: info.value,
        });
      }
      else {
        yield new DataPropInfo({
          propName,
          basicType: false,
          set: (v: unknown) => info.set.call(object, v),
          get: () => info.get.call(object)
        });
      }
    }

    for (const entry of Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(object)))) {
      const [propName, info] = entry;

      if (!info.configurable) {
        continue;
      }

      if (info.set || info.get) {
        yield new DataPropInfo({
          propName,
          basicType: false,
          set: (v: unknown) => info.set.call(object, v),
          get: () => info.get.call(object)
        });
      }
    }
  }
}
