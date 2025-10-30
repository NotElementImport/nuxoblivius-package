import { ISerializeBridge, IValuebleItem } from "../interface/ISerializeBridge.js";

export class SerializeBridge implements ISerializeBridge {
  private toBox(type: string, value: unknown): IValuebleItem {
    return {
      _type: type,
      _value: value
    }
  }

  private fromBox(item: IValuebleItem): [string, unknown] {
    return [
      item._type,
      item._value
    ];
  }

  private async blobToB64(content: File | Blob): Promise<string> {
    if (typeof window !== "undefined" && typeof FileReader !== "undefined") {
      return new Promise<string>((done, err) => {
        const reader = new FileReader();
        reader.onloadend = () => done(reader.result.toString().split("base64,").pop());
        reader.onerror = err;
        reader.readAsDataURL(content as Blob);
      });
    }

    // @ts-ignore
    return Buffer.from(await content.arrayBuffer()).toString("base64");
  }

  private b64ToBlob(content: { type: string, base64: string }): Blob {
    const base64 = atob(content.base64);
    const parts: Uint8Array[] = [];

    for (let offset = 0; offset < base64.length; offset += 512) {
      const slice = base64.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      parts.push(new Uint8Array(byteNumbers));
    }

    return new Blob(parts, { type: content.type });
  }

  public async encode(value: unknown): Promise<IValuebleItem> {
    if (value == null || typeof value !== "object") {
      return this.toBox("_*", value);
    }

    const typeName = Object.getPrototypeOf(value).constructor.name;

    if (typeName === "Object") {
      const object: Record<string, IValuebleItem> = {};

      await Promise.all(
        Object.entries(value)
          .map(async ([name, val]) => { object[name] = await this.encode(val); })
      );

      return this.toBox("Object", object);
    }
    else if (typeName === "Array") {
      const array: IValuebleItem[] = [];

      for (const val of (value as unknown[])) {
        array.push(await this.encode(val));
      }

      return this.toBox("Array", array);
    }
    else if (typeName === "FormData" || typeName === "Map" || typeName === "Set") {
      const item: Record<string, unknown> = {};

      await Promise.all(
        (value as FormData).entries()
          .map(async ([name, val]) => { item[name] = await this.encode(val); })

      )

      return this.toBox(typeName, item);
    }
    else if (typeName === "Blob") {
      return this.toBox("Blob", {
        type: (value as Blob).type,
        base64: await this.blobToB64(value as Blob)
      });
    }
    else if (typeName === "File") {
      return this.toBox("File", {
        name: (value as File).name,
        type: (value as Blob).type,
        base64: await this.blobToB64(value as Blob)
      });
    }
  }

  public decode(item: IValuebleItem): unknown {
    if (item == null) {
      return null;
    }

    const [typeField, valueField] = this.fromBox(item);

    if (typeField === "_*") {
      return valueField;
    }

    if (typeField === "Object") {
      return Object.fromEntries(Object.entries(valueField)
        .map(([name, val]) => [name, this.decode(val)])
      );
    }
    else if (typeField === "Array") {
      return (valueField as IValuebleItem[])
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
    else if (typeField === "Blob") {
      return this.b64ToBlob(valueField as any);
    }
    else if (typeField === "File") {
      return new File(
        [this.b64ToBlob(valueField as any)],
        (valueField as { name: string }).name,
        { type: (valueField as { type: string }).type }
      );
    }

    return valueField;
  }
}
