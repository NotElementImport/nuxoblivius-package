import { test } from "node:test";
import * as assert from "node:assert";

import { ContainerService } from "../application/service/ContainerService.js";

test("core/application/service/ContainerService: Init", () => {
  const container = new ContainerService();
  assert.equal(container instanceof ContainerService, true);
});

class TestContainer { }
class TestContainer2 { }

test("core/application/service/ContainerService: Functional", () => {
  var container = new ContainerService();

  // Register Service, using simple build by class

  container.register(TestContainer, TestContainer);

  var instance = container.inject(TestContainer);
  assert.equal(instance instanceof TestContainer, true);

  // Rewrite Service, and using arrow build

  container.register(TestContainer, () => new TestContainer2());

  instance = container.inject(TestContainer);
  assert.equal(instance instanceof TestContainer2, true);
});
