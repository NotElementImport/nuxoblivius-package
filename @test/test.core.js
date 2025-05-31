import { suite } from "node:test";

suite("package: @nuxoblivius/core", async () => {
  await import("../core/dist/test/__boot.js");
});
