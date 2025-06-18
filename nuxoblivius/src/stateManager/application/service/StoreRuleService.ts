import type { IAnyStoreRule, IStoreMountTransformRule, IStoreReactiveRule, IStoreTransformRule } from "../../domain/interface/IStoreRule.js";

export class StoreRuleService {
  private readonly transformers: IStoreTransformRule[] = [];
  private readonly mountRules: IStoreMountTransformRule[] = [];
  private readonly reactiveRules: IStoreReactiveRule[] = [];

  public constructor(rules: IAnyStoreRule[] = []) {
    for (const rule of rules) {
      // @ts-ignore
      if (rule.canReactive) {
        this.reactiveRules.push(rule as IStoreReactiveRule);
      }
      // @ts-ignore
      if (rule.getTransform && rule.setTransform) {
        this.transformers.push(rule as IStoreTransformRule);
      }
      // @ts-ignore
      if (rule.onMountStore) {
        this.mountRules.push(rule as IStoreMountTransformRule);
      }
    }
  }

  public canReactive(propName: string, value: unknown): boolean {
    for (const rule of this.reactiveRules) {
      if (!rule.canReactive(propName, value)) {
        return false;
      }
    }

    return true;
  }

  public transformGet(propName: string, value: unknown): unknown {
    for (const rule of this.transformers) {
      var newValue = rule.getTransform(propName, value);

      if (typeof newValue !== undefined) {
        value = newValue;
      }
    }

    return value;
  }

  public transformSet(propName: string, value: unknown): unknown {
    for (const rule of this.transformers) {
      var newValue = rule.setTransform(propName, value);

      if (typeof newValue !== undefined) {
        value = newValue;
      }
    }

    return value;
  }

  public onStoreMount(store: object): object {
    for (const rule of this.mountRules) {
      rule.onMountStore(store);
    }
    return store;
  }
};
