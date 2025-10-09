import { expect, test } from "vitest";
import { BasicBackend } from "../../main/src/Core/backend/BasicBackend.js";

const getBackend = () => new BasicBackend();

test("Check: Create property", () => {
  const backend = getBackend();

  const prop = backend.createProperty("Message", null as any);

  expect(prop.get()).toBe("Message");
});

test("Check: Create computed", () => {
  const backend = getBackend();

  const a = backend.createProperty(4, null as any);
  const b = backend.createProperty(6, null as any);

  const result = backend.createComputed(() => a.get() + b.get(), null as any);

  expect(result.get()).toBe(10);

  a.set(6);

  expect(result.get()).toBe(12);
});

test("Check: Is backend value", () => {
  const backend = getBackend();

  const a = backend.createProperty("test", null as any);

  expect(backend.isBackendValue(a)).toBe(true);

  const b = backend.createComputed(() => a.get(), null as any);

  expect(backend.isBackendValue(b)).toBe(true);
});

test("Check: get backend value", () => {
  const backend = getBackend();

  const a = backend.createProperty("Test value 1", null as any);

  expect(backend.getBackendValue(a)).toBe("Test value 1");
  expect(backend.getBackendValue("Test value 2")).toBe("Test value 2");
});

test("Check: set backend value", () => {
  const backend = getBackend();

  const a = backend.createProperty("Hello", null as any);

  expect(a.get()).toBe("Hello");
  backend.setBackendValue(a, (v: string) => `${v} world!`);
  expect(a.get()).toBe("Hello world!");
});

test("Check: watch backend value", () => {
  const backend = getBackend();

  const a = backend.createProperty("Test", null as any);
  var mimicA = a.get();

  backend.watchBackendValue(a, (value) => {
    mimicA = value as string;
  });

  expect(mimicA).toBe(a.get());

  a.set("Value 1");

  expect(mimicA).toBe("Value 1");
});
