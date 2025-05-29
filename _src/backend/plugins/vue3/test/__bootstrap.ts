import { suite } from "node:test";

suite("mod: backend/plugin/vue3", async () => {
  await import("./BackendTest.js");
});
