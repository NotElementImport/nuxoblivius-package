import { expect, test } from "vitest";
import { SerializeBridge } from "../../main/src/Serialize/bridges/SerializeBridge.js";

test("Check: primitives", async () => {
  const bridge = new SerializeBridge();

  // Number:
  var simplify = await bridge.encode(10);
  expect(bridge.decode(simplify)).toBe(10);

  // String:
  simplify = await bridge.encode("hello_world");
  expect(bridge.decode(simplify)).toBe("hello_world");

  // Boolean:
  simplify = await bridge.encode(false);
  expect(bridge.decode(simplify)).toBe(false);
});

test("Check: form data", async () => {
  const bridge = new SerializeBridge();
  const formData = new FormData();

  formData.set("number", "10");
  formData.set("string", "hello_world");
  formData.set("blob", new Blob(["Hello"], { type: "plain/text" }), "file.txt");

  var simplify = await bridge.encode(formData);
  const dublicate = bridge.decode(simplify) as FormData;
  const file = dublicate.get("blob") as File;

  expect(dublicate.get("number")).toBe("10");
  expect(dublicate.get("string")).toBe("hello_world");
  expect(await file.text()).toBe("Hello");
});

test("Check: map", async () => {
  const bridge = new SerializeBridge();
  const map = new Map();

  map.set("number", 10);
  map.set("string", "hello_world");
  map.set("array", [0, 1, { message: "test" }]);

  var simplify = await bridge.encode(map);
  const dublicate = bridge.decode(simplify) as Map<string, unknown>;

  expect(dublicate.get("number")).toBe(10);
  expect(dublicate.get("string")).toBe("hello_world");
  expect((dublicate.get("array") as any)[0]).toBe(0);
  expect((dublicate.get("array") as any)[2].message).toBe("test");
});

test("Check: set", async () => {
  const bridge = new SerializeBridge();
  const list = new Set();

  list.add(10);
  list.add(20);
  list.add(23);

  var simplify = await bridge.encode(list);
  const dublicate = bridge.decode(simplify) as Set<number>;

  expect(dublicate.has(10)).toBeTruthy();
  expect(dublicate.has(20)).toBeTruthy();
  expect(dublicate.has(23)).toBeTruthy();
});
