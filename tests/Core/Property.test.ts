import { expect, test } from "vitest";
import { findAllProperties, Property } from "../../main/src/Core/Property.js";

test('Check: get/set', () => {
  const message = new Property("Hello");

  expect(message.get()).toBe("Hello");

  message.set((val) => `${val} world!`);

  expect(message.get()).toBe("Hello world!");
});

test('Check: watch', () => {
  const prop = new Property("Hello");
  var mimicProp = prop.get();

  prop.watch((newValue) => {
    mimicProp = newValue;
  });

  expect(mimicProp).toBe(prop.get());

  prop.set("New value 1");

  expect(mimicProp).toBe("New value 1");

  prop.set("New value 2");

  expect(mimicProp).toBe("New value 2");
});

test('Check: Found props', () => {
  const test = new Property("Hello");

  const props = findAllProperties(() => {
    test.get();
  });

  expect(props.length).toBe(1);
  expect(props[0]).toBe(test);
});
