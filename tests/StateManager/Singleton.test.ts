import { expect, test } from "vitest";
import defineNuxoblivius, { getNuxoblivius } from "../../main/src/Core/index.js";
import { defineSingleton } from "../../main/src/StateManager/index.js";
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

  const useCalcStore = defineSingleton(() => {
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

  const calcChild = useCalcStore();

  expect(calcChild.result).toBe(12);

  calcChild.a = 4;

  expect(calcChild.result).toBe(10);
  expect(calc.result).toBe(10);
});

test("Check: Create store as Class", () => {
  const useCalcStore = defineSingleton(class {
    public a: number = 4;
    public b: number = 6;

    public get result(): number {
      return this.a + this.b;
    }
  });

  const calc = useCalcStore();

  expect(calc.result).toBe(10);

  calc.a = 6;

  expect(calc.result).toBe(12);

  const calcChild = useCalcStore();

  expect(calcChild.result).toBe(12);

  calcChild.a = 4;

  expect(calcChild.result).toBe(10);
  expect(calc.result).toBe(10);
});

test("Check how functions work", () => {
  const useUser = defineSingleton(class {
    public userName: string = "test";
    public age: number = 20;

    public getFullUserInfo(): string {
      return `User ${this.userName} his age ${this.age} y.o`;
    }
  });

  const user = useUser();

  expect(user.getFullUserInfo()).toBe("User test his age 20 y.o");
});
