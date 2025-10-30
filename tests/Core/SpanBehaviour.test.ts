
import { expect, test } from "vitest";
import defineNuxoblivius, { signal, computed, watch, getNuxoblivius, onStoreDestroy, onStoreInit, onTimespan, waitEventLoop } from "../../main/src/Core/index.js";
import { defineFactory, destroyStore } from "../../main/src/StateManager/index.js";

test("Check: Create store as Functionaly", async () => {
  defineNuxoblivius();
  let secretMessage = "";

  onTimespan(async () => {
    await new Promise((r) => setTimeout(r, 500));
    secretMessage = "My secret message";
  });

  await waitEventLoop();
  expect(secretMessage).toBe("My secret message");
});
