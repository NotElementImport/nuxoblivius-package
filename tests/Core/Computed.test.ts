import { expect, test } from "vitest";
import { Computed, findAllProperties, Property, WrapProperty } from "../../main/src/Core/Property.js";

test('Check: get/set', () => {
  const a = new Property(4);
  const b = new Property(6);

  const c = Computed.lazy(() => a.get() + b.get());

  expect(c.get()).toBe(10);

  a.set(6);

  expect(c.get()).toBe(12);
});

test('Check: watch', () => {
  const a = new Property(4);
  const b = new Property(6);

  const c = Computed.lazy(() => a.get() + b.get());
  var mimicC = c.get();

  c.watch((value) => {
    mimicC = value;
  });

  expect(mimicC).toBe(c.get());

  a.set(6);
  c.get();

  expect(mimicC).toBe(12);
});

test('Check: nested', () => {
  const a = new Property(4);
  const b = new Property(6);

  const c = new Computed(() => a.get() + b.get());
  const d = Computed.lazy(() => c.get() * 2);

  expect(d.get()).toBe(20);

  a.set(6);

  expect(d.get()).toBe(24);
});

test('Check: Found props', () => {
  const a = new Property(4);
  const b = new Property(6);

  const c = new Computed(() => a.get() + b.get());

  const props = findAllProperties(() => {
    c.get();
  });

  expect(props.length).toBe(1);
  expect(props[0]).toBe(c);
});
