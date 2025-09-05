import { test } from "node:test";
import * as assert from "node:assert";
import { BaseParams } from "../domain/valueObject/BaseParams.js";

test("record/domain/valueObject/BaseParams: Basic", () => {
  const baseParams = new BaseParams({
    message1: "Hello",
    message2: "world!"
  });

  assert.equal(
    baseParams.has("message1"), true
  );
  assert.equal(
    baseParams.has("message2"), true
  );

  assert.equal(
    baseParams.get("message1"), "Hello"
  );
  assert.equal(
    baseParams.get("message2"), "world!"
  );

  baseParams.set("message2", null);

  assert.equal(
    baseParams.has("message2"), false
  );
  assert.equal(
    baseParams.get("message2"), null
  );
});

test("record/domain/valueObject/BaseParams: Advanced", () => {
  const parentParams = new BaseParams({
    city: "test"
  });

  const baseParams = new BaseParams({
    id: 1
  }).link(parentParams);

  assert.equal(
    baseParams.has("city"), true
  );
  assert.equal(
    baseParams.has("id"), true
  );

  assert.equal(
    baseParams.get("city"), "test"
  );
  assert.equal(
    baseParams.get("id"), 1
  );

  baseParams.set("city", "newValue");

  assert.equal(
    baseParams.has("city"), true
  );
  assert.equal(
    baseParams.get("city"), "newValue"
  );
});
