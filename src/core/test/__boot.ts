import { suite } from "node:test";

suite("mod: core", async () => {
  await import("./DeepCloneTest.js");
  await import("./ObserverRepositoryTest.js");
  await import("./PropertyInfoTest.js");
  await import("./PropertyServiceTest.js");
  await import("./GarbageServiceTest.js");
});
