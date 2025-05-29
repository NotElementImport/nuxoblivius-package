import { test } from "node:test";
import * as assert from "node:assert";
import { useVue3Backend, Vue3BackendController } from "../../../vue3/Vue3Backend.js";
import { Nox } from "../../../../core/Nox.js";
import { computed } from "vue";

test("backend/plugins/vue3/Vue3Backend: Init", () => {
  useVue3Backend();
  assert.equal(Nox.getInstance().getBackend() instanceof Vue3BackendController, true);
});

test("backend/plugins/vue3/Vue3Backend: State", () => {
  useVue3Backend();
  const backend = Nox.getInstance().getBackend();

  const state = backend.createState("_");
  const message = computed(() => `Hello ${state}`);

  assert.equal(message.value, "Hello _");

  state.set("world!");

  assert.equal(message.value, "Hello world!");
});

test("backend/plugins/vue3/Vue3Backend: Computed", () => {
  useVue3Backend();
  const backend = Nox.getInstance().getBackend();

  const state = backend.createState("_");
  const message = backend.createComputed(() => `Hello ${state}`);

  assert.equal(message.get(), "Hello _");

  state.set("world!");

  assert.equal(message.get(), "Hello world!");
});
