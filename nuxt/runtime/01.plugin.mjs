import { defineNuxtPlugin, useAppConfig, useCookie, useAsyncData } from "#app";
import { settings, options as ConfigOptions } from "nuxoblivius/dist/ts/Config";
export default defineNuxtPlugin({
  enforce: "pre",
  parallel: false,
  env: {
    islands: false
  },
  setup: (_nuxtApp) => {
    _nuxtApp.hook('page:finish', () => {
      settings.cookieWorker({
        get(name) {
          return useCookie(name).value;
        },
        set(name, value) {
          useCookie(name).value = value;
        }
      });

      settings.isServer(false);
    })

    settings.apiRoot(useAppConfig().nuxoblivius.api);

    settings.httpClient(async (url, options) => {
      const { data } = await useAsyncData(url, () => $fetch(ConfigOptions.isServer ? ConfigOptions.apiRoot + url : url, options))
      return data.value
    })

    settings.isServer(true);
  }
});
