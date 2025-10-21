import { expect, test } from "vitest";
import defineNuxoblivius, { computed, onStoreDestroy, onStoreInit, signal } from "../../main/src/Core/index.js";
import { defineSingleton, destroyStore } from "../../main/src/StateManager/index.js";

defineNuxoblivius();

test("Check: Create store as Functionaly", () => {
  const useCalcStore = defineSingleton(() => {
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

test("Check: Lifespan", () => {
  let spanState = "Not created";

  const useStore = defineSingleton(() => {
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
  let spanState = "Not created";
  let spanSecondState = "Not created";

  const useNested = defineSingleton(() => {
    onStoreInit(() => spanSecondState = "Store created");
    onStoreDestroy(() => spanSecondState = "Store removed");

    return { uid: 2 };
  });

  const useStore = defineSingleton(() => {
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
