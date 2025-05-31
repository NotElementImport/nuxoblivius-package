import { test } from "node:test";
import * as assert from "node:assert";

import { GarbageService } from "../application/service/GarbageService.js";
import { PropertyInfo } from "../domain/valueObject/PropertyInfo.js";
import { PropertyService } from "../application/service/ProperyService.js";
import { ObserverRepository } from "../infrastructure/repository/ObserverRepository.js"
import { DeepClone } from "../infrastructure/utils/DeepClone.js";

test("core/application/service/GarbageService: Functional", () => {
  const garbage = new GarbageService();

  var actor = 0;
  const instance = new PropertyService<number>({
    property: new PropertyInfo(() => actor, (value) => actor = value),
    observer: new ObserverRepository(),
    deepClone: DeepClone.getInstance()
  });

  garbage.addProperty(instance);

  instance.setValue(10);
  assert.equal(instance.getValue(), 10);

  garbage.clean();

  assert.equal(instance.getValue(), 0);
});
