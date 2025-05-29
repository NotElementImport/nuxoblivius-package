import { test } from "node:test";
import * as assert from "node:assert";
import { PropertyListService } from "../application/service/PropertyListService.js";
import { PropertyInfo } from "../domain/valueObject/ProperyInfo.js";

test("core/application/service/PropertyListService: Init", () => {
  assert.equal(new PropertyListService() instanceof PropertyListService, true);
});

test("core/application/service/PropertyListService: Register", () => {
  const list = new PropertyListService();

  const actor = {
    message: "Hello"
  };

  list.register("message", new PropertyInfo(
    () => actor.message,
    (value) => actor.message = value
  ));

  const instance = list.get<string>("message");
  assert.equal(instance instanceof PropertyInfo, true);
});

test("core/application/service/PropertyListService: Reset", () => {
  const list = new PropertyListService();

  const actor = {
    message: "Hello"
  };

  list.register("message", new PropertyInfo(
    () => actor.message,
    (value) => actor.message = value
  ));

  const instance = list.get<string>("message");
  assert.equal(instance.get(), "Hello");

  instance.set("test");
  assert.equal(instance.get(), "test");
  assert.equal(actor.message, "test");

  list.resetAll();
  assert.equal(instance.get(), "Hello");
  assert.equal(actor.message, "Hello");

  instance.set("test");
  assert.equal(instance.get(), "test");
  assert.equal(actor.message, "test");

  list.reset("message");
  assert.equal(instance.get(), "Hello");
  assert.equal(actor.message, "Hello");
});
