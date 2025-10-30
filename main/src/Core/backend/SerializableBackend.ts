import { StoreBackendContext } from "../interface/IBackend.js";
import { BasicBackend } from "./BasicBackend.js";

interface BoxItem {
  _transferType: string;
  _transferValue: unknown;
}

export class SerializeBridge {
  private static TypeField = "_transferType";
  private static ValueField = "_transferContent";
  private static Type_Primitive = "_*";

  public static toBox(type: string, value: unknown) {
    return {
      [this.TypeField as "_transferType"]: type,
      [this.ValueField as "_transferValue"]: value
    }
  }

  public static fromBox(item: BoxItem): [string, unknown] {
    return [
      item[this.TypeField as "_transferType"],
      item[this.ValueField as "_transferValue"]
    ];
  }

  public static encode(value: unknown): BoxItem {
    if (value == null || typeof value !== "object") {
      return this.toBox(this.Type_Primitive, value);
    }

    const typeName = Object.getPrototypeOf(value).constructor.name;

    if (typeName === "Object") {
      return this.toBox("Object", Object.fromEntries(
        Object.entries(value)
          .map(([name, val]) => [name, this.encode(val)])
      ));
    }
    else if (typeName === "Array") {
      return this.toBox("Array", (value as unknown[]).map((v) => this.encode(v)));
    }
    else if (typeName === "FormData" || typeName === "Map" || typeName === "Set") {
      return this.toBox("FormData", Object.fromEntries(
        (value as FormData).entries()
          .map(([name, val]) => [name, this.encode(val)])
      ));
    }
  }

  public static decode(value: BoxItem): unknown {
    const [typeField, valueField] = this.fromBox(value);

    if (typeField === this.Type_Primitive) {
      return valueField;
    }

    if (typeField === "Object") {
      return Object.fromEntries(Object.entries(valueField)
        .map(([name, val]) => [name, this.decode(val)])
      );
    }
    else if (typeField === "Array") {
      return (valueField as BoxItem[])
        .map((val) => this.decode(val));
    }
    else if (typeField === "FormData") {
      const formData = new FormData();

      Object.entries(valueField)
        .forEach(([name, val]) => {
          formData.append(name, this.decode(val) as string);
        });

      return formData;
    }
    else if (typeField === "Map") {
      const mapData = new Map();

      Object.entries(valueField)
        .forEach(([name, val]) => {
          mapData.set(name, this.decode(val));
        });

      return mapData;
    }
    else if (typeField === "Set") {
      const setData = new Set();

      Object.entries(valueField)
        .forEach(([_, val]) => {
          setData.add(this.decode(val));
        });

      return setData;
    }

    return valueField;
  }
}

export class TransferBox {
  private readonly _map = new Map<string, BoxItem>();

  public static from(data: Record<string, unknown>): TransferBox {
    const instance = new TransferBox();
    instance.decode(data);
    return instance;
  }

  public set(name: string, value: unknown) {
    this._map.set(name, SerializeBridge.encode(value));
  }

  public get<T extends unknown>(name: string): T | null {
    const _tempItem = this._map.get(name) as BoxItem;

    if (_tempItem == null) {
      return null;
    }

    return SerializeBridge.decode(_tempItem) as T;
  }

  public encode(): object {
    return Object.fromEntries(this._map.entries());
  }

  public decode(value: object) {
    Object.entries(value)
      .forEach(([name, value]) => {
        this._map.set(name, value);
      });
  }

  public toJsonString(): string {
    return JSON.stringify(this.encode());
  }
}

export class SerializableContext extends StoreBackendContext {

}

export class SerializableBackend extends BasicBackend {

}
