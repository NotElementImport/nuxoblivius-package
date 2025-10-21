import { expect, test } from "vitest";
import { BasicContainer } from "../../main/src/Core/containers/BasicContainer.js";
import { asToken } from "../../main/src/Core/interface/IContainer.js";

let counter = 0;

class DITest {
  public constructor(
    public message: number = counter
  ) {
    counter += 1;
  }
}

test('Check: singleton (class method)', () => {
  const di = new BasicContainer();

  di.singleton(DITest, DITest);

  const originalInstance = di.inject(DITest);
  const mimicInstance = di.inject(DITest);

  expect(originalInstance.message).toBe(mimicInstance.message);
});

test('Check: singleton (anon func)', () => {
  const di = new BasicContainer();

  di.singleton(DITest, () => new DITest());

  const originalInstance = di.inject(DITest);
  const mimicInstance = di.inject(DITest);

  expect(originalInstance.message).toBe(mimicInstance.message);
});

test('Check: singleton (just value)', () => {
  const di = new BasicContainer();

  di.singleton(DITest, new DITest());

  const originalInstance = di.inject(DITest);
  const mimicInstance = di.inject(DITest);

  expect(originalInstance.message).toBe(mimicInstance.message);
});

test('Check: factory (class method)', () => {
  const di = new BasicContainer();

  di.factory(DITest, DITest);

  const originalInstance = di.inject(DITest);
  const mimicInstance = di.inject(DITest);

  expect(originalInstance.message === mimicInstance.message).toBe(false);
});

test('Check: factory (anon func)', () => {
  const di = new BasicContainer();

  di.factory(DITest, () => new DITest());

  const originalInstance = di.inject(DITest);
  const mimicInstance = di.inject(DITest);

  expect(originalInstance.message === mimicInstance.message).toBe(false);
});

test('Check: factory (args)', () => {
  const di = new BasicContainer();

  di.factory(DITest, DITest);

  const originalInstance = di.inject(DITest, 10);
  const mimicInstance = di.inject(DITest, 10);

  expect(originalInstance.message).toBe(mimicInstance.message);
});

test('Check: scope', () => {
  const constToken = asToken<string>();
  const di = new BasicContainer();
  di.singleton(constToken, () => `${Math.random()}`);

  const globalBefore = di.inject(constToken);

  // Scope prepare:
  const scopeDi = di.createScopeContainer();

  scopeDi.singleton(DITest, DITest);

  const firstValue = scopeDi.inject(DITest);

  scopeDi.clean();

  const secondValue = scopeDi.inject(DITest);

  // Check result
  expect(firstValue.message != secondValue.message).toBe(true);
  expect(di.inject(constToken)).toBe(globalBefore);
});

test('Check: injectOrCreate', () => {
  const di = new BasicContainer();

  const instance = di.injectOrCreate(DITest, 10);

  expect(instance.message).toBe(10);
});

test('Check: injectOrError', () => {
  const di = new BasicContainer();

  expect(() => {
    di.injectOrError(DITest);
  }).toThrow();
});
