import { EProprtyType } from "../enum/EPropertyType.js";

export class PropertyMeta {
  public constructor(
    private readonly name: string,
    private readonly value: unknown,
    private readonly type: EProprtyType,
    private readonly getAccessor: () => unknown = () => { },
    private readonly setAccessor: (v: unknown) => void = (v) => { }
  ) { }

  public isType(type: EProprtyType): boolean {
    return this.type === type;
  }

  public getName(): string {
    return this.name;
  }

  public getValue(): unknown {
    return this.value;
  }

  public accessorGet() {
    return this.getAccessor;
  }

  public accessorSet() {
    return this.setAccessor;
  }
};
