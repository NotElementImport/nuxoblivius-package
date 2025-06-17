
/**
 * PropertyInfo - Layer for data retrieval, without injecting it into the object
*/
export class PropertyInfo<T> {
  public constructor(
    private readonly getter: () => T,
    private readonly setter: (value: T) => void
  ) { }

  public getValue() {
    return this.getter();
  }

  public setValue(value: T) {
    this.setter(value);
  }
};
