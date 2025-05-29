import { test } from "node:test";
import * as assert from "node:assert";
import { GarbageService } from "../application/service/GarbageService.js";
import { PropertyInfo } from "../domain/valueObject/ProperyInfo.js";
import { PropertyListService } from "../application/service/PropertyListService.js";

test("core/application/service/GarbageService: Init", () => {
  assert.equal(new GarbageService() instanceof GarbageService, true);
});

test("core/application/service/GarbageService: Functional", () => {
  const actor = {
    test1: 1,
    test2: 2,
    test3: 3
  };

  const actor1 = PropertyInfo.fromObject(actor, "test1");
  const actor2 = PropertyInfo.fromObject(actor, "test2");
  const actor3 = PropertyInfo.fromObject(actor, "test3");

  const service1 = new PropertyListService();
  service1.register("test2", actor2);
  service1.register("test3", actor3);

  const garbage = new GarbageService();
  garbage.registerService(service1);
  garbage.registerProprty(actor1);

  actor1.set(100);
  actor2.set(101);
  actor3.set(102);

  assert.equal(actor1.get(), 100);
  assert.equal(actor2.get(), 101);
  assert.equal(actor3.get(), 102);

  garbage.cleanUp();

  assert.equal(actor1.get(), 1);
  assert.equal(actor2.get(), 2);
  assert.equal(actor3.get(), 3);
});
