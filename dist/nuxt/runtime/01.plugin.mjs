import { defineNuxtPlugin, useAppConfig, useCookie, useAsyncData } from "#app";
import { settings, options as ConfigOptions } from "nuxoblivius/dist/ts/Config";
import { deleteDump } from "nuxoblivius/dist/ts/index.js";
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
        });
        _nuxtApp.hook('app:rendered', function () {
            deleteDump();
        });
        _nuxtApp.hook('app:created', function () {
            settings.apiRoot(useAppConfig().nuxoblivius.api);
            settings.httpClient(async (url, options) => {
                const { data } = await useAsyncData(url, () => (async () => {
                    const data = await fetch(ConfigOptions.isServer ? ConfigOptions.apiRoot + url : url, options);
                    return data.json();
                })());
                return data.value;
            });
            settings.isServer(true);
        });
    }
});
