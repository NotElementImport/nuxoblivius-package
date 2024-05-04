import { defineNuxtPlugin } from "#app";
import { hydrateOnClient, onMountedApp } from "nuxoblivius/dist/ts/index.js";
export default defineNuxtPlugin({
    enforce: "pre",
    parallel: false,
    env: {
        islands: false
    },
    setup: (_nuxtApp) => {
        if (globalThis.__NUXOBLIVIUS_HYDRATION__) {
            hydrateOnClient(globalThis.__NUXOBLIVIUS_HYDRATION__);
            onMountedApp();
        }
    }
});
