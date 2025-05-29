import { test } from "node:test";
import * as assert from "node:assert";

import { ObserverRepository } from "../intrastructure/repository/ObserverRepository.js"

test("core/application/service/GarbageService: Functional", () => {


});

test("core/application/service/GarbageService: Remove Watch", () => {
  var counter = 0;
  const observer = new ObserverRepository();

  const removeObserve = observer.watch(() => { counter += 1 });
  observer.dispatch(null);
  observer.dispatch(null);

  removeObserve();

  observer.dispatch(null);
  observer.dispatch(null);

  assert.equal(counter, 2);
});
