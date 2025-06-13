import { test } from "node:test";
import * as assert from "node:assert";

import { Nuxoblivius } from "../../core/Nuxoblivius.js";
import { Vue3Backend } from "../../backend/vue3/Vue3Backend.js";
import { SingletonBuilder } from "../infrastructure/builder/SingletonBuilder.js";

test("stateManager/intrastructure/builder/SingletonBuilder: Behaviour", () => {
  class Test {
    public basic1 = "Hello ";
    public get readonlyRef1() { return `${this.basic1} world!`; }
  };

  // Config

  new Nuxoblivius({
    backend: new Vue3Backend()
  });

  const backend = Nuxoblivius.getInstance().getBackend();
  const builder = new SingletonBuilder();

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
    instance.readonlyRef1, "Hello world!"
  );

  assert.equal(
    secondInstance.basic1, "Hello"
  );

  assert.equal(
    secondInstance.readonlyRef1, "Hello world!"
  );

  // Clean

  builder.clearParent();
  Nuxoblivius.destroy();
});
