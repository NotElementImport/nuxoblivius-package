import { test } from "node:test";
import * as assert from "node:assert";

import { PropertyInfo } from "../domain/valueObject/PropertyInfo.js";
import { PropertyService } from "../application/service/ProperyService.js";
import { ObserverRepository } from "../infrastructure/repository/ObserverRepository.js"
import { DeepClone } from "../infrastructure/utils/DeepClone.js";

test("core/application/service/PropertyService: Functional", () => {
  var actor = 0;

  const instance = new PropertyService<number>({
    property: new PropertyInfo(() => actor, (value) => actor = value),
    observer: new ObserverRepository(),
    deepClone: DeepClone.getInstance()
  });

  assert.equal(instance.getValue(), actor);

  instance.setValue(10);

  assert.equal(instance.getValue(), 10);
  assert.equal(instance.getValue(), actor);
});

test("core/application/service/PropertyService: Observe", () => {
  var actor = 0;
  var invisibleActor = 0;

  const instance = new PropertyService<number>({
    property: new PropertyInfo(() => actor, (value) => actor = value),
    observer: new ObserverRepository(),
    deepClone: DeepClone.getInstance()
  });

  const unWatch = instance.getObserver().watch((value) => {
    invisibleActor = value;
  });

  assert.equal(instance.getValue(), actor);

  instance.setValue(10);

  assert.equal(instance.getValue(), 10);
  assert.equal(instance.getValue(), actor);
  assert.equal(actor, invisibleActor);

  unWatch();

  instance.setValue(20);

  assert.equal(instance.getValue(), 20);
  assert.equal(instance.getValue(), actor);
  assert.notEqual(actor, invisibleActor);
});

test("core/application/service/PropertyService: Destroy", () => {
  var actor = 0;
  var invisibleActor = 0;

  const instance = new PropertyService<number>({
    property: new PropertyInfo(() => actor, (value) => actor = value),
    observer: new ObserverRepository(),
    deepClone: DeepClone.getInstance()
  });

  instance.getObserver().watch((value) => {
    invisibleActor = value;
  });

  assert.equal(instance.getValue(), actor);

  instance.setValue(10);

  assert.equal(instance.getValue(), 10);
  assert.equal(instance.getValue(), actor);
  assert.equal(actor, invisibleActor);

  instance.destroy();

  assert.equal(instance.getValue(), 0);
  assert.equal(instance.getValue(), actor);
  assert.notEqual(actor, invisibleActor);
});
