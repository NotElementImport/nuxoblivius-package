import { test } from "node:test";
import * as assert from "node:assert";

import { Nuxoblivius } from "../../core/Nuxoblivius.js";
import { Vue3Backend } from "../../backend/vue3/Vue3Backend.js";
import { SingletonBuilder } from "../infrastructure/builder/SingletonBuilder.js";
import { StoreRuleService } from "../application/service/StoreRuleService.js";

test("stateManager/intrastructure/builder/SingletonBuilder: Behaviour", () => {
  class Test {
    public basic1 = "Hello ";
    public basic2 = "World!";
    public get readonlyRef1() { return `${this.basic1} ${this.basic2}`; }
  };

  // Config

  new Nuxoblivius({
    backend: new Vue3Backend()
  });

  const backend = Nuxoblivius.getInstance().getBackend();
  const builder = new SingletonBuilder(new StoreRuleService());

  // Test

  const instance = builder.getInstance(Test) as Test;

  // Test: Is Reactive

  assert.equal(
    backend.isReactive(() => instance.basic1), true
  );

  assert.equal(
    backend.isReactive(() => instance.readonlyRef1), true
  );

  // Test: Singleton works

  instance.basic1 = "_Hello";

  const secondInstance = builder.getInstance(Test) as Test;

  assert.equal(
    instance.basic1, "_Hello"
  );

  assert.equal(
    secondInstance.basic1, instance.basic1
  );

  // Test: Update value

  secondInstance.basic1 = "Hello";

  assert.equal(
    instance.basic1, "Hello"
  );

  assert.equal(
    instance.readonlyRef1, "Hello World!"
  );

  assert.equal(
    secondInstance.basic1, "Hello"
  );

  assert.equal(
    secondInstance.readonlyRef1, "Hello World!"
  );

  // Clean

  builder.clearParent();
  Nuxoblivius.destroy();
});
