import { test } from "node:test";
import * as assert from "node:assert";

import { Nox } from "../Nox.js";

test("core/Nox: getInstance", () => {
  assert.equal(Nox.getInstance() instanceof Nox, true);
});
