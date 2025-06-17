import { test } from "node:test";
import * as assert from "node:assert";

import { CacheController } from "../interface/CacheController.js";
import { CacheRecord } from "../domain/valueObject/CacheRecord.js";

test("cache/interface/CacheController: Write", () => {
  const instance = new CacheController();

  instance.write(new CacheRecord({
    url: "/test"
  }));

  assert.equal(
    instance.count(), 1
  );
});
