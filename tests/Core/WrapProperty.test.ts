import { expect, test } from "vitest";
import { findAllProperties, Property, WrapProperty } from "../../main/src/Core/Property.js";

test('Check: get/set', () => {
  var message = "Hello";

  const wrapMessage = new WrapProperty({
    get: () => message,
    set: (v: string) => message = v
  });

  expect(message).toBe("Hello");

  wrapMessage.set((v) => `${v} world!`);

  expect(message).toBe("Hello world!");
});

test('Check: watch', () => {
  var message = "Start message";

  const wrapMessage = new WrapProperty({
    get: () => message,
    set: (v: string) => message = v
  });

  var mimicMessage = wrapMessage.get();

  wrapMessage.watch((value) => {
    mimicMessage = value;
  });

  expect(mimicMessage).toBe(message);
  expect(mimicMessage).toBe("Start message");

  wrapMessage.set("new value 1");

  expect(mimicMessage).toBe(message);
  expect(mimicMessage).toBe("new value 1");
});

test('Check: FindProp', () => {
  const prop = new Property('Test');
  const wrapProp = new WrapProperty({
    get: () => prop.get(),
    set: (v) => prop.set(v)
  });

  const props = findAllProperties(() => {
    wrapProp.get();
  });

  expect(props.length).toBe(1);
  expect(props[0]).toBe(prop);
});
