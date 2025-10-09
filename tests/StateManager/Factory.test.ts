import { expect, test } from "vitest";
import defineNuxoblivius, { getNuxoblivius } from "../../main/src/Core/index.js";
import { defineFactory } from "../../main/src/StateManager/index.js";
import type { BackendProperty, BackendComputed, WatchBackend } from "../../main/src/Core/interface/IBackend.js";

interface IMinBackend {
  state<T>(value: T): BackendProperty<T>;
  computed<T>(handle: () => T): BackendComputed<T>;
  watch<T>(prop: WatchBackend, handle: (value: T) => void): Function;
}

const getOblivius = (): IMinBackend => {
  defineNuxoblivius();

  const oblivius = getNuxoblivius();
  const backend = oblivius.getBackend();

  return {
    state: (value) => backend.createProperty(value),
    computed: (handle) => backend.createComputed(handle),
    watch: (prop, handle) => backend.watchBackendValue(prop, handle as any),
  };
};

test("Check: Create store as Functionaly", () => {
  const { state, computed } = getOblivius();

  const useCalcStore = defineFactory(() => {
    const a = state(4);
    const b = state(6);

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
  const { state, computed, watch } = getOblivius();

  const useCalcStore = defineFactory(() => {
    const a = state(4);
    const b = state(6);

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
  const { watch } = getOblivius();

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
