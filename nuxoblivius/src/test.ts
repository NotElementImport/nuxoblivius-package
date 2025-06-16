
import { test, suite } from "node:test";

suite("init", () => {
  test(`Heating ${new Date().toISOString()}`, () => { });
});

await import("./core/test/__boot.js");
await import("./stateManager/test/__boot.js");

