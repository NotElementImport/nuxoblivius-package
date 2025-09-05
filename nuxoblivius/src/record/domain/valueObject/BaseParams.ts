export class BaseParams<T extends BaseParams<any> = BaseParams<any>> {
  private _lastPickItemName: string = "";
  private _lastPickItemValue: unknown;

  private _links: T[] = [];

  public constructor(
    private _list: Record<string, unknown>
  ) { }

  public set(name: string, value: unknown | (() => unknown)) {
    this._lastPickItemName = "";

    if (value == null) {
      delete this._list[name];
      return;
    }

    this._list[name] = value;
  }

  public get<T extends unknown>(name: string): T {
    if (this._lastPickItemName == name) {
      return this._lastPickItemValue as T;
    }

    var value = this._list[name] as T;

    if (!value) {
      for (const linkItem of this._links) {
        if (linkItem.has(name)) {
          value = linkItem.get(name);
          break;
        }
      }
    }

    if (typeof value === "function") {
      value = value();
    }

    this._lastPickItemName = name;
    this._lastPickItemValue = value;

    return value;
  }

  public has(name: string): boolean {
    return this.get(name) != null;
  }

  public delete(name: string): void {
    this.set(name, null);
  }

  public link(other: T): this {
    this._links.push(other);
    return this;
  }

  public merge(other: T): this {
    for (const [otherKeyItem, otherValueItem] of other.entries()) {
      this.set(otherKeyItem, otherValueItem);
    }

    return this;
  }

  public *entries() {
    for (const key of this.keys()) {
      yield [key, this.get(key)] as [string, unknown];
    }
  }

  public get length() {
    return Array.from(this.keys()).length;
  }

  public keys() {
    const keysSet = new Set<string>();

    for (const key of Object.keys(this._list)) {
      keysSet.add(key);
    }

    for (const linkItem of this._links) {
      for (const linkKey of linkItem.keys()) {
        keysSet.add(linkKey);
      }
    }

    return keysSet.values();
  }

  public *values() {
    for (const key of this.keys()) {
      yield this.get(key);
    }
  }

  public toObject(): object {
    const filteredData = Array.from(this.entries())
      .filter(([_, value]) => value != null);

    return Object.fromEntries(filteredData);
  }

  public compare(other: T): boolean {
    if (this.length != other.length) {
      return false;
    }

    for (const keyValue of this.keys()) {
      const a = this.get(keyValue);
      const b = other.get(keyValue);

      if (a != b) {
        return false;
      }
    }

    return true;
  }
};
