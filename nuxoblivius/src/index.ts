import { Vue3Backend } from "./backend/vue3/Vue3Backend.js";
import { Nuxoblivius } from "./core/Nuxoblivius.js";
import { FactoryBuilder } from "./stateManager/infrastructure/builder/FactoryBuilder.js";
import { SingletonBuilder } from "./stateManager/infrastructure/builder/SingletonBuilder.js";
import { StateManagerController } from "./stateManager/interface/StateManagerController.js";

export const defineNuxoblivius = () => {
  new Nuxoblivius({
    backend: new Vue3Backend()
  });
};

export const getNuxobliviusInstance = () => {
  return Nuxoblivius.getInstance();
};

export const defineStore = <T>(store: { new(): T }) => {
  const manager = StateManagerController.getInstance().createStore({
    store: store,
    builder: SingletonBuilder
  });

  return () => manager.getInstance() as T;
};

export const defineFactoryStore = <T, K extends any[]>(store: { new(...args: K): T }) => {
  const manager = StateManagerController.getInstance().createStore({
    store: store,
    builder: FactoryBuilder
  });

  return (...args: K) => manager.getInstance(...args) as T;
};
