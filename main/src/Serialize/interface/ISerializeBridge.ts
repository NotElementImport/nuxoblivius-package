export interface IValuebleItem {
  _type: string;
  _value: unknown;
}

export interface ISerializeBridge {
  encode(value: unknown): Promise<IValuebleItem | null>;
  decode(item: IValuebleItem): unknown;
}
