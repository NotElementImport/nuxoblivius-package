import { suite } from "node:test";

suite("mod: core", async () => {
  await import("./DeepCloneTest.js");
  await import("./WatchersTest.js");
  await import("./PropertyInfoTest.js");
  await import("./PropertyListServiceTest.js");
  await import("./GarbageServiceTest.js");
  await import("./ContainerTest.js");
  await import("./StoreListTest.js");
  await import("./NoxTest.js");
});
