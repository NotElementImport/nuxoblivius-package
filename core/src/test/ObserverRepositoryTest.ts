import { test } from "node:test";
import * as assert from "node:assert";
import { ObserverRepository } from "../infrastructure/repository/ObserverRepository.js"

test("core/intrastructure/repository/ObserverRepository: Watch", () => {
  var counter = 0;
  const observer = new ObserverRepository();

  observer.watch(() => { counter += 1 });
  observer.dispatch(null);
  observer.dispatch(null);

  assert.equal(counter, 2);
});

test("core/intrastructure/repository/ObserverRepository: Remove Watch", () => {
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
