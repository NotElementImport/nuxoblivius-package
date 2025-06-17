import { suite } from "node:test";

suite("mod: State Manager", async () => {
  await import("./PropertyInspectorTest.js");
  await import("./FactoryBuilderTest.js");
  await import("./SingletonBuilderTest.js");
});
