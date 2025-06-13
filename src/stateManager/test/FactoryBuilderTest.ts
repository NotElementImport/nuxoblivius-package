import { test } from "node:test";
import * as assert from "node:assert";

import { Nuxoblivius } from "../../core/Nuxoblivius.js";
import { Vue3Backend } from "../../backend/vue3/Vue3Backend.js";
import { FactoryBuilder } from "../infrastructure/builder/FactoryBuilder.js";

test("stateManager/intrastructure/builder/FactoryBuilder: Behaviour", () => {
  class Test {
    public basic1 = "Hello";
    public get readonlyRef1() { return `${this.basic1} world!`; }

    public getValue() {
      return "data";
    }
  };

  // Config

  new Nuxoblivius({
    backend: new Vue3Backend()
  });

  const backend = Nuxoblivius.getInstance().getBackend();
  const builder = new FactoryBuilder();

  // Test: Is reactive

  const instance = builder.getInstance(Test) as Test;

  assert.equal(
    backend.isReactive(() => instance.basic1), true
  );

  assert.equal(
    backend.isReactive(() => instance.readonlyRef1), true
  );

  assert.equal(
    backend.isReactive(() => instance.getValue()), false
  );

  // Test: Reset from Garbage

  instance.basic1 = "Reset value";

  assert.equal(instance.basic1, "Reset value");
  assert.equal(instance.readonlyRef1, "Reset value world!");

  Nuxoblivius.getInstance().getGarbage().clean();

  assert.equal(instance.basic1, "Hello");
  assert.equal(instance.readonlyRef1, "Hello world!");

  // Clean

  assert.equal(
    builder.destroyInstance(instance), true
  );

  Nuxoblivius.destroy();
});

test("stateManager/intrastructure/builder/FactoryBuilder: With Args", () => {
  class Test {
    public get fullName() {
      return `${this.lastName} ${this.firstName}`;
    }

    public constructor(
      private firstName: string,
      private readonly lastName: string
    ) { }

    public setFisrtName(v: string) {
      this.firstName = v;
    }
  };

  // Config

  new Nuxoblivius({
    backend: new Vue3Backend()
  });

  const backend = Nuxoblivius.getInstance().getBackend();
  const builder = new FactoryBuilder();

  // Test: Is Reactive

  const instance = builder.getInstance(Test, "Ryan", "Gosling") as Test;

  assert.equal(
    backend.isReactive(() => instance.fullName), true
  );

  // Test: Readonly Computed

  assert.equal(instance.fullName, "Gosling Ryan");

  // Test: Reset from Garbage

  instance.setFisrtName("NewValue");

  assert.equal(instance.fullName, "Gosling NewValue");

  Nuxoblivius.getInstance().getGarbage().clean();

  assert.equal(instance.fullName, "Gosling Ryan");

  // Clean

  assert.equal(
    builder.destroyInstance(instance), true
  );

  Nuxoblivius.destroy();
});
