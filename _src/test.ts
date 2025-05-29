import test, { suite } from "node:test";
import * as assert from "node:assert";

suite("init", () => {
  test(`Heating ${new Date().toISOString()}`, () => {
    assert.equal(true, true);
  });
});

await import("./core/test/__bootstrap.js");
await import("./backend/plugins/vue3/test/__bootstrap.js");
await import("./stateManager/test/__bootstrap.js");
