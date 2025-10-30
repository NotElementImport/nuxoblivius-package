import { IValuebleItem } from "./ISerializeBridge.js";

export interface IBox {
  get<T extends unknown>(name: string): T;
  set(name: string, value: unknown): void;
  encode(): Promise<Record<string, IValuebleItem>>;
  decode(value: object): void;
}
