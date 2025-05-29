import { test } from "node:test";
import * as assert from "node:assert";
import { DeepClone } from "../domain/valueObject/DeepClone.js";

test("core/domain/valueObject/DeepClone: Init", () => {
  assert.equal(new DeepClone(true) instanceof DeepClone, true);
});

test("core/domain/valueObject/DeepClone: Functional", () => {
  const testActor = {
    firstLayer: "message1",
    secondLayer: {
      message: "message2"
    }
  };

  const deepClone = new DeepClone(testActor);
  const cloned = deepClone.clone();

  cloned.secondLayer.message = "message3";

  assert.equal(cloned.secondLayer.message, "message3");
  assert.equal(testActor.secondLayer.message, "message2");
});
