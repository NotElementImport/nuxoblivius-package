import { defineNuxtPlugin, useAppConfig, useCookie } from "#app";
import { settings } from "nuxoblivius/dist/ts/Config";
export default defineNuxtPlugin({
  enforce: "pre",
  parallel: false,
  env: {
    islands: false
  },
  setup: (_nuxtApp) => {
    console.log("CONFIG SET =>");
    settings.apiRoot(useAppConfig().nuxoblivius.api).isServer(false);
    settings.cookieWorker({
      get(name) {
        return useCookie(name).value;
      },
      set(name, value) {
        useCookie(name).value = value;
      }
    });
  }
});
