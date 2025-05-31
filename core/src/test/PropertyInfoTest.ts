import { test } from "node:test";
import * as assert from "node:assert";

import { PropertyInfo } from "../domain/valueObject/PropertyInfo.js";

test("core/domain/valueObject/PropertyInfo: Functional", () => {
  var actor = 0;

  const propInfo = new PropertyInfo(
    () => actor,
    (value) => actor = value
  );

  assert.equal(propInfo.getValue(), actor);

  propInfo.setValue(10);

  assert.equal(propInfo.getValue(), 10);
  assert.equal(propInfo.getValue(), actor);
});
