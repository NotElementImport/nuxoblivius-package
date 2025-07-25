import { suite } from "node:test";

suite("mod: Record", async () => {
  await import("./BaseParamsTest.js");
  await import("./RequestTransformTest.js");
  await import("./ResponseTransformTest.js");
  await import("./UrlTransformTest.js");
});
