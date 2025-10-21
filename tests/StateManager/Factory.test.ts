import { expect, test } from "vitest";
import defineNuxoblivius, { signal, computed, watch, getNuxoblivius, onStoreDestroy, onStoreInit } from "../../main/src/Core/index.js";
import { defineFactory, destroyStore } from "../../main/src/StateManager/index.js";

test("Check: Create store as Functionaly", () => {
  defineNuxoblivius();

  const useCalcStore = defineFactory(() => {
    const a = signal(4);
    const b = signal(6);

    const result = computed(() => {
      return a.get() + b.get();
    });

    return { a, b, result };
  });

  const calc = useCalcStore();

  expect(calc.result).toBe(10);

  calc.a = 6;

  expect(calc.result).toBe(12);
});

test("Check: Watch props in store as Functionaly", () => {
  defineNuxoblivius();

  const useCalcStore = defineFactory(() => {
    const a = signal(4);
    const b = signal(6);

    const result = computed(() => {
      return a.get() + b.get();
    });

    return { a, b, result };
  });

  const calc = useCalcStore();
  var mimicResult = calc.result;

  watch(() => calc.result, (value: number) => {
    mimicResult = value;
  });

  expect(mimicResult).toBe(10);

  calc.a = 6;

  expect(mimicResult).toBe(12);
});

test("Check: Create store as Class", () => {
  defineNuxoblivius();

  const useCalcStore = defineFactory(class {
    public a: number = 4;
    public b: number = 6;

    public get result() {
      return this.a + this.b;
    }
  });

  const calc = useCalcStore();

  expect(calc.result).toBe(10);

  calc.a = 6;

  expect(calc.result).toBe(12);
});

test("Check: Watch props in store as Class", () => {
  defineNuxoblivius();

  const useCalcStore = defineFactory(class {
    public a: number = 4;
    public b: number = 6;

    public get result() {
      return this.a + this.b;
    }
  });

  const calc = useCalcStore();
  var mimicResult = calc.result;

  watch(() => calc.result, (value: number) => {
    mimicResult = value;
  });

  expect(mimicResult).toBe(10);

  calc.a = 6;

  expect(mimicResult).toBe(12);
});

test("Check: Lifespan", () => {
  defineNuxoblivius();

  let spanState = "Not created";

  const useStore = defineFactory(() => {
    onStoreInit(() => spanState = "Store created");
    onStoreDestroy(() => spanState = "Store removed");

    return {};
  });

  expect(spanState).toBe("Not created");

  const test = useStore();

  expect(spanState).toBe("Store created");

  destroyStore(test);

  expect(spanState).toBe("Store removed");
});

test("Check: Nested lifespan", () => {
  defineNuxoblivius();

  let spanState = "Not created";
  let spanSecondState = "Not created";

  const useNested = defineFactory(() => {
    onStoreInit(() => spanSecondState = "Store created");
    onStoreDestroy(() => spanSecondState = "Store removed");

    return {};
  });

  const useStore = defineFactory(() => {
    const nested = useNested();

    onStoreInit(() => spanState = "Store created");
    onStoreDestroy(() => spanState = "Store removed");

    return {};
  });

  expect(spanState).toBe("Not created");
  expect(spanSecondState).toBe("Not created");

  const test = useStore();

  expect(spanState).toBe("Store created");
  expect(spanSecondState).toBe("Store created");

  destroyStore(test);

  expect(spanState).toBe("Store removed");
  expect(spanSecondState).toBe("Store removed");
});
