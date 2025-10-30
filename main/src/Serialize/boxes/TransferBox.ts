import { IBox } from "../interface/IBox.js";
import { ISerializeBridge, IValuebleItem } from "../interface/ISerializeBridge.js";

export class TransferBox implements IBox {
  private readonly _valueMap = new Map<string, unknown>();

  public constructor(private readonly bridge: ISerializeBridge) {
  }

  public set(name: string, value: unknown) {
    this._valueMap.set(name, value);
  }

  public get<T extends unknown>(name: string): T | null {
    return this._valueMap.get(name) as T | null;
  }

  public async encode(): Promise<Record<string, IValuebleItem>> {
    const object: Record<string, IValuebleItem> = {};

    await Promise.all(
      this._valueMap.entries()
        .map(async ([name, val]) => {
          const response = await this.bridge.encode(val);

          if (response) {
            object[name] = response;
          }
        })
    );

    return object;
  }

  public decode(value: object) {
    Object.entries(value)
      .forEach(([name, val]) => {
        this._valueMap.set(name, this.bridge.decode(val));
      });
  }
}
