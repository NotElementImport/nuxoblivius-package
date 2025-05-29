import { test } from "node:test";
import * as assert from "node:assert";

import { Watchers } from "../domain/valueObject/Watchers.js";

test("core/domain/valueObject/Watchers: Init", () => {
  assert.equal(new Watchers() instanceof Watchers, true);
});

test("core/domain/valueObject/Watchers: Functional", () => {
  const watcher = new Watchers();

  var counter = 0;

  const unWatch = watcher.watch(() => counter += 1);
  watcher.dispatch(null);
  watcher.dispatch(null);

  assert.equal(counter, 2);

  unWatch();

  watcher.dispatch(null);
  watcher.dispatch(null);

  assert.equal(counter, 2);
});
