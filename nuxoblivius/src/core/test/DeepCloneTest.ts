import { test } from "node:test";
import * as assert from "node:assert";
import { DeepClone } from "../intrastructure/utils/DeepClone.js";

test("core/intrastructure/utils/DeepClone: Clone", () => {
  const deepClone = DeepClone.getInstance();
  const actor = {
    message: "hello",
    meta: {
      version: "1.0.0"
    }
  };

  // Test deep clone

  const clonedActor = deepClone.clone(actor);

  assert.equal(
    actor.meta.version,
    clonedActor.meta.version
  );

  clonedActor.meta.version = "2.0.0";

  assert.notEqual(
    actor.meta.version,
    clonedActor.meta.version
  );

  // Test other types

  const actorNumber = 0;
  var clonedNumber = deepClone.clone(actorNumber);

  assert.equal(actorNumber, clonedNumber);

  clonedNumber = 1;
  assert.notEqual(actorNumber, clonedNumber);
});
