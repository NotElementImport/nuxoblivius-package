import { defineNuxtPlugin, useAppConfig, useAsyncData } from "#app";
import { settings, options as ConfigOptions } from "nuxoblivius/dist/ts/config.js";
import { deleteDump } from "nuxoblivius/dist/ts/index.js";
const defaultFetch = ConfigOptions.http;
export default defineNuxtPlugin({
    setup: (_nuxtApp) => {
        const isUseLogs = useAppConfig().nuxoblivius.logs;
        _nuxtApp.hook('app:rendered', function () {
            if (isUseLogs) {
                console.log(' ');
                console.log(' 🪄  Nuxoblivius - Clearing trash after SSR ');
                console.log(' ');
            }
            deleteDump();
        });
        _nuxtApp.hook('app:created', function () {
            const isClient = typeof document !== "undefined";
            settings.httpClient(async (url, options, isBlob) => {
                const rules = useAppConfig().nuxoblivius.rules;
                let fetchUrl = url;
                let rule = 'without';
                let ruleURL = '';
                if (!isClient && !fetchUrl.startsWith('http')) {
                    for (const [prefix, to] of Object.entries(rules)) {
                        if (url.startsWith(prefix)) {
                            fetchUrl = to + fetchUrl.replace(prefix, '');
                            rule = prefix;
                            ruleURL = to;
                        }
                    }
                }
                const { data } = await useAsyncData(url, async () => {
                    const result = await defaultFetch(fetchUrl, options, isBlob);
                    result.header = Object.fromEntries(result.header.entries());
                    return JSON.stringify(result);
                });
                const response = JSON.parse(data.value);
                response.header = new Headers(response.header);
                if (!isClient && isUseLogs) {
                    console.log(' ');
                    console.log(' 🔗  Nuxoblivius : SSR Fetch info ');
                    console.log(` 🔗  URL         : ${(options.method ?? 'GET').toLocaleUpperCase()} ${fetchUrl} `);
                    if (ruleURL != '') {
                        console.log(` 🔗  Rule Prefix : ${rule} `);
                        console.log(` 🔗  Rule To     : ${ruleURL} `);
                    }
                    console.log(` ⚠️  Code        : ${response._meta.code} / ${response._meta.text} `);
                    if (typeof response.body == 'object' && response.body._errorCode) {
                        console.log(` 🚫  Error       : ${response.body._errorBody} `);
                    }
                    else {
                        console.log(` ✅  OK `);
                    }
                    console.log(' ');
                }
                return response;
            });
        });
    }
});
