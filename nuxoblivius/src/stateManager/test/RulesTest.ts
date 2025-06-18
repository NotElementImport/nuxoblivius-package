import { test } from "node:test";
import * as assert from "node:assert";

import { Nuxoblivius } from "../../core/Nuxoblivius.js";
import { Vue3Backend } from "../../backend/vue3/Vue3Backend.js";
import { SingletonBuilder } from "../infrastructure/builder/SingletonBuilder.js";
import { StoreRuleService } from "../application/service/StoreRuleService.js";
import { IStoreReactiveRule } from "../domain/interface/IStoreRule.js";

test("stateManager: StoreRule / Is Reactive", () => {
  class Test {
    public notReactive = new FormData();
    public reactive = {};
  };

  // Config

  new Nuxoblivius({
    backend: new Vue3Backend()
  });

  class TestRule implements IStoreReactiveRule {
    public canReactive(propName: string, value: unknown): boolean {
      if (value && value instanceof FormData) {
        return false;
      }
      return true;
    }
  }

  const backend = Nuxoblivius.getInstance().getBackend();
  const builder = new SingletonBuilder(
    new StoreRuleService([
      new TestRule()
    ])
  );

  // Test

  const instance = builder.getInstance(Test) as Test;

  // Test: Is Reactive

  assert.equal(
    backend.isReactive(() => instance.reactive), true
  );

  assert.equal(
    backend.isReactive(() => instance.notReactive), false
  );
});
