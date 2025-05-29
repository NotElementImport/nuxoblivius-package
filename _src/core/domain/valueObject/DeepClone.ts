export class DeepClone<T> {
  public constructor(
    private value: T
  ) { }

  public set(v: T) {
    this.value = v;
  }

  private recursiveClone(parent: object, child: Record<string, any>) {
    var isArray = Array.isArray(parent);

    for (var [key, parentValue] of Object.entries(parent)) {
      // @ts-ignore Optimization thing
      key = isArray ? +key : key;

      if (parentValue && typeof parentValue === "object") {
        child[key] = this.recursiveClone(
          parentValue,
          Array.isArray(parentValue) ? [] : {}
        );
      }
      else {
        child[key] = parentValue;
      }
    }

    return child;
  }

  public clone(): T {
    if (!this.value || typeof this.value !== "object") {
      return this.value;
    }

    return this.recursiveClone(
      this.value,
      Array.isArray(this.value) ? [] : {}
    ) as T;
  }
}
