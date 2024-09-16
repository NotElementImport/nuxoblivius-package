import { defineNuxtPlugin, useAppConfig, useAsyncData } from "#app";
import { settings, options as ConfigOptions } from "nuxoblivius/dist/ts/config.js";
import { deleteDump } from "nuxoblivius/dist/ts/index.js";
const defaultFetch = ConfigOptions.http;
let oblivStats = {
    connections: {},
    uses: {}
};
const getUID = () => {
    let result = '';
    const hashTable = 'qwertyuiopasdfghjklzxcvbnm123456789#@';
    for (let i = 0; i < 16; i++)
        result += hashTable[~~(Math.random() * (hashTable.length - 1))];
    return result;
};
const isClient = typeof document !== "undefined";
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
            const uid = getUID();
            if (!isClient && isUseLogs) {
                console.log(' ');
                console.log(` ⚡  Awake [caller: ${uid}] `);
            }
            settings.httpClient(async (url, options, isBlob) => {
                const startStamp = performance.now();
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
                    const busyAt = (performance.now() - startStamp) * (1 / 1000);
                    let speedRating = 'Best  ⭐';
                    if (busyAt > 8)
                        speedRating = 'Danger';
                    else if (busyAt >= 4)
                        speedRating = 'Very slow';
                    else if (busyAt >= 2.1)
                        speedRating = 'Slow';
                    else if (busyAt >= 1.2)
                        speedRating = 'Slower, usually';
                    else if (busyAt >= 0.7)
                        speedRating = 'Mid speed';
                    else if (busyAt >= 0.5)
                        speedRating = 'Normal';
                    else if (busyAt >= 0.2)
                        speedRating = 'Good';
                    else if (busyAt >= 0.1)
                        speedRating = 'Fast';
                    console.log(' ');
                    console.log(' 🔗  Nuxoblivius  : SSR Fetch info ');
                    console.log(` 🔗  UID          : ${uid} `);
                    console.log(` 🔗  URL          : ${(options.method ?? 'GET').toLocaleUpperCase()} ${fetchUrl} `);
                    console.log(` ⚡  It took time : ${(busyAt).toFixed(4)} s. / ${speedRating}`);
                    if (ruleURL != '') {
                        console.log(` 🔗  Rule Prefix  : ${rule} `);
                    }
                    console.log(` ⚠️  Code         : ${response._meta.code} / ${response._meta.text} `);
                    if (typeof response.body == 'object' && response.body._errorCode) {
                        console.log(` 🚫  Error        : ${response.body._errorBody} `);
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
