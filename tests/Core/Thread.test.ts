import { expect, test } from "vitest";

import { IThread } from "../../main/src/Core/interface/IThread.js";
import defineNuxoblivius, {
  defineThread,
  onThreadSafe,
} from "../../main/src/Core/index.js";

let lastConsoleLog: string = "";

class TestThread extends IThread {
  public override onError(e: Error, _: Function): unknown {
    lastConsoleLog = e.message;
    return void 0;
  }
}

class RetryThread extends IThread {
  public override onError(e: Error, retry: Function): unknown {
    lastConsoleLog = e.message;
    return retry();
  }
}

test("Check: sync", () => {
  defineNuxoblivius();

  const testThread = defineThread(TestThread);

  const someSyncMethod = onThreadSafe(testThread, () => {
    throw "This is error";
  });

  someSyncMethod();

  expect(lastConsoleLog).toBe("This is error");
  lastConsoleLog = "";
});

test("Check: sync retry", () => {
  defineNuxoblivius();

  const thread = defineThread(RetryThread);
  var failHook = true;

  const getPersonalData = onThreadSafe(thread, () => {
    if (failHook) {
      failHook = false;
      throw "Unexcepted";
    }

    return "My personal data";
  });

  const personalData = getPersonalData();

  expect(lastConsoleLog).toBe("Unexcepted");
  expect(personalData).toBe("My personal data");
  lastConsoleLog = "";
});

test("Check: async", async () => {
  defineNuxoblivius();

  const testThread = defineThread(TestThread);

  const someAsyncMethod = onThreadSafe(testThread, async () => {
    throw "This is error";
  });

  await someAsyncMethod();

  expect(lastConsoleLog).toBe("This is error");
  lastConsoleLog = "";
});

test("Check: async retry", async () => {
  defineNuxoblivius();

  const thread = defineThread(RetryThread);
  var failHook = true;

  const getPersonalData = onThreadSafe(thread, async () => {
    if (failHook) {
      failHook = false;
      throw "Unexcepted";
    }

    return "My personal data";
  });

  const personalData = await getPersonalData();

  expect(lastConsoleLog).toBe("Unexcepted");
  expect(personalData).toBe("My personal data");
  lastConsoleLog = "";
});
