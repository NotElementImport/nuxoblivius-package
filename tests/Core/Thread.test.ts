import { expect, test } from "vitest";

import { IErrorInfo, IThread } from "../../main/src/Core/interface/IThread.js";
import defineNuxoblivius, {
  defineThread,
  onThreadSafe,
} from "../../main/src/Core/index.js";

let lastConsoleLog: string = "";

class TestThread extends IThread {
  public override onError(e: IErrorInfo, _: Function) {
    lastConsoleLog = e.error.message;
  }
}

class RetryThread extends IThread {
  public override onError(e: IErrorInfo, retry: Function) {
    lastConsoleLog = e.error.message;
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

test("Check: multithread", () => {
  var errorThreadMsg: string = "";
  var apiLoggerMsg: string = "";

  class ErrorThread extends IThread {
    public onError(e: IErrorInfo, _: Function) {
      errorThreadMsg = e.error.message;
    }
  }

  class ApiThread extends IThread {
    public onError(e: IErrorInfo, _: Function) {
      apiLoggerMsg = e.error.message;
    }
  }

  defineNuxoblivius();

  const testThread = defineThread(ErrorThread, ApiThread);

  onThreadSafe(testThread, () => {
    throw "This is error";
  })();

  expect(errorThreadMsg).toBe("This is error");
  expect(apiLoggerMsg).toBe("This is error");
});

test("Check: multithread retry", () => {
  var errorThreadMsg: string = "";
  var apiLoggerMsg: string = "";
  var failHook: boolean = true;

  class ErrorThread extends IThread {
    public onError(e: IErrorInfo, retry: Function) {
      errorThreadMsg = e.error.message;
      return retry();
    }
  }

  class ApiThread extends IThread {
    public onError(e: IErrorInfo, _: Function) {
      apiLoggerMsg = e.error.message;
    }
  }

  defineNuxoblivius({});

  const testThread = defineThread(ErrorThread, ApiThread);

  const returnData = onThreadSafe(testThread, () => {
    if (failHook) {
      failHook = false;
      throw "This is error";
    }
    return "Test";
  })();

  expect(errorThreadMsg).toBe("This is error");
  expect(apiLoggerMsg).toBe("This is error");
  expect(returnData).toBe("Test");
});
