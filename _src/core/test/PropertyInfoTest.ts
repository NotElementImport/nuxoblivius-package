import { test } from "node:test";
import * as assert from "node:assert";
import { PropertyInfo } from "../domain/valueObject/ProperyInfo.js";

test("core/domain/valueObject/ProperyInfo: Init", () => {
  assert.equal(new PropertyInfo(() => { }, () => { }) instanceof PropertyInfo, true);
});

test("core/domain/valueObject/ProperyInfo: Functional", () => {
  const actor = {
    message: "Hello"
  };

  const instance = new PropertyInfo(
    () => actor.message,
    (v) => actor.message = v
  );

  assert.equal(
    instance.get(),
    "Hello"
  );

  assert.equal(
    `${instance}`,
    "Hello"
  );

  instance.set("Hello world!");

  assert.equal(
    instance.get(),
    "Hello world!"
  );

  assert.equal(
    `${instance}`,
    "Hello world!"
  );

  assert.equal(
    actor.message,
    "Hello world!"
  );
});
