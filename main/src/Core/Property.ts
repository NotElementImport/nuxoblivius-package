var isSeekerMode: boolean = false;
var seekerResult: Property[] = [];

export const ingnoreSeeker = <T>(handle: () => T): T => {
  const oldSeekerValue = isSeekerMode;
  isSeekerMode = false;
  const result = handle();
  isSeekerMode = oldSeekerValue;
  return result;
};

export const findAllProperties = (handle: () => void): Property[] => {
  const oldSeekerResult = seekerResult;
  const oldSeekerMode = isSeekerMode;
  const newSeekerResult: Property[] = [];

  isSeekerMode = true;
  seekerResult = newSeekerResult;

  handle();

  isSeekerMode = oldSeekerMode;
  seekerResult = oldSeekerResult

  return newSeekerResult;
};

export class Property<T = unknown> {
  private _subs: Set<Function> = new Set();
  private _toDestroy: Function[] = [];

  public constructor(private _value: T) { }

  protected notifySubs(newValue: T, oldValue: T) {
    if (newValue == oldValue) {
      return;
    }

    for (const callback of this._subs.values()) {
      callback(newValue, oldValue);
    }
  }

  protected silenceSet(newValue: T): void {
    this._value = newValue;
  }

  protected getRaw(): T {
    return this._value;
  }

  public watch(handle: (value: T) => unknown): Function {
    this._subs.add(handle);
    return () => this._subs.delete(handle);
  }

  public set(newValue: T | ((v: T) => T)): void {
    const value = typeof newValue === "function"
      ? (newValue as any)(this._value)
      : newValue;

    const oldValue = this._value;

    this.silenceSet(value);
    this.notifySubs(value, oldValue);
  }

  public get(): T {
    if (isSeekerMode) {
      seekerResult.push(this as Property);
    }

    return this.getRaw();
  }

  public toString(): string {
    return `${this._value}`;
  }

  public valueOf(): T {
    return this._value;
  }

  public isEqual(other: T): boolean {
    return this._value == other;
  }

  protected addToDestroy(handle: Function): void {
    this._toDestroy.push(handle);
  }

  public destroy(): void {
    for (const destroyHandle of this._toDestroy) {
      destroyHandle();
    }
  }
}

export class Computed<T> extends Property<T> {
  private _requireUpdate: boolean = true;
  private _isFirstRun: boolean = true;
  private readonly _isLazy: boolean = false;

  public static lazy<T>(handle: () => T): Computed<T> {
    return new this(handle, { lazy: true });
  }

  public constructor(
    private readonly handle: () => T,
    params: { lazy?: boolean } = {}
  ) {
    super(undefined);
    this._isLazy = params.lazy ?? false;

    if (!this._isLazy) {
      this.tryCompute();
    }
  }

  private tryCompute(): void {
    if (this._requireUpdate) {
      const oldValue = this.getRaw();

      ingnoreSeeker(() => {
        if (this._isFirstRun) {
          const props = findAllProperties(() => {
            this.silenceSet(
              this.handle()
            );
          });

          for (const prop of props) {
            this.addToDestroy(
              prop.watch(() => {
                this._requireUpdate = true;

                if (!this._isLazy) {
                  this.tryCompute();
                }
              })
            );
          }

          this._isFirstRun = false;
        }
        else {
          this.silenceSet(
            this.handle()
          );
        }
      });

      this.notifySubs(this.getRaw(), oldValue);
      this._requireUpdate = false;
    }
  }

  public override get(): T {
    if (this._isLazy) {
      this.tryCompute();
    }

    return super.get();
  }

  public override set(newValue: T | ((v: T) => T)): void {
    throw new Error("Error compute cannot be set");
  }
}

export class WrapProperty<T> extends Property<T> {
  public constructor(
    private readonly params: {
      get: () => T,
      set: (v: T) => unknown
    }
  ) {
    super(undefined);

    ingnoreSeeker(() => {
      this.silenceSet(
        params.get()
      );
    });
  }

  public override set(newValue: T | ((v: T) => T)): void {
    super.set(newValue);
    this.params.set(this.getRaw());
  }

  public override get(): T {
    return this.params.get();
  }
}
