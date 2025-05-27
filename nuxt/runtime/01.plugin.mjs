import { defineNuxtPlugin, useAppConfig, useAsyncData } from "#app";
import { settings, options as ConfigOptions } from "nuxoblivius/dist/config.js";
import { forgetAllStores } from "nuxoblivius/dist/index.js";

const isServer = typeof document === "undefined";
const nxDefaultFetch = ConfigOptions.http;

const printOnServer = (...args) => {
    if (!isServer) {
        return
    }
    console.log(...args);
};

const isUseAsyncDataFetch = (url, isHydrate) => {
    return isServer || isHydrate;
};

const useDefaultFetch = async (url, options, isBlob) => {
    const result = await nxDefaultFetch(url, options, isBlob);
    result.header = Object.fromEntries(result.header.entries());
    return JSON.stringify(result);
};

const useFetch = async (isHydrate, key, url, options, isBlob) => {
    if (isUseAsyncDataFetch(key, isHydrate)) {
        var { data } = await useAsyncData(key, async () => {
            return await useDefaultFetch(url, options, isBlob);
        });
        return data.value;
    }

    var response = await useDefaultFetch(url, options, isBlob);

    return response;
};

const useTrackFetch = async (isHydrate, key, url, options, isBlob) => {
    var isAsyncBehaviour = isUseAsyncDataFetch(key, isHydrate);

    var response = await useFetch(isHydrate, key, url, options, isBlob);

    if (!isServer) {
        console.groupCollapsed(` ⟡ - Nuxoblivius /  ${isAsyncBehaviour ? "[Hydrating] Request" : "Request"} : ${options.method ?? "GET"} ${url}`);
        console.table({
            url: url,
            options: JSON.stringify(options),
        })
        console.log(` ⟡ - Response:`, response);
        console.groupEnd();
    }

    return response;
};

const getUID = () => {
    if (!isServer) {
        return "";
    }

    let result = '';
    const hashTable = 'qwertyuiopasdfghjklzxcvbnm123456789#@';
    for (let i = 0; i < 16; i++)
        result += hashTable[~~(Math.random() * (hashTable.length - 1))];
    return result;
};

export default defineNuxtPlugin({
    setup: (_nuxtApp) => {
        const isUseLogs = useAppConfig().nuxoblivius.logs ?? false;
        const isUseClientLogs = useAppConfig().nuxoblivius.clientLogs ?? false;

        _nuxtApp.hook('app:rendered', function () {
            if (isUseLogs) {
                printOnServer(`  _`)
                printOnServer(` |`)
                printOnServer(` ⟡ ✄ Nuxoblivius: Cleaning stores`)
                printOnServer(` |_`)
            }

            forgetAllStores();
        });

        _nuxtApp.hook('app:created', function () {
            settings.router({
                get path() {
                    console.log('test')

                    return _nuxtApp.$router.currentRoute.value.path
                },
                get query() {
                    return _nuxtApp.$router.currentRoute.value.query
                },
                get params() {
                    return _nuxtApp.$router.currentRoute.value.params
                }
            })

            const uid = getUID();

            if (isUseLogs) {
                printOnServer(`  _`)
                printOnServer(` | \\\\`)
                printOnServer(` ⟡  ·•—– Nuxoblivius: New request \`${uid}\``)
                printOnServer(` |_//`)
            }

            settings.httpClient(async (url, options, isBlob) => {
                const startStamp = performance.now();
                const rules = useAppConfig().nuxoblivius.rules;
                let fetchUrl = url;
                let rule = 'without';
                let ruleURL = '';
                if (isServer && !fetchUrl.startsWith('http')) {
                    for (const [prefix, to] of Object.entries(rules)) {
                        if (url.startsWith(prefix)) {
                            fetchUrl = to + fetchUrl.replace(prefix, '');
                            rule = prefix;
                            ruleURL = to;
                        }
                    }
                }
                const response = JSON.parse(
                    await (isUseClientLogs
                        ? useTrackFetch(_nuxtApp.isHydrating, url, fetchUrl, options, isBlob)
                        : useFetch(_nuxtApp.isHydrating, url, fetchUrl, options, isBlob))
                );

                response.header = new Headers(response.header);

                if (isServer && isUseLogs) {
                    const busyAt = (performance.now() - startStamp) * (1 / 1000);
                    let speedRating = ' ·•—– Best —–•·';
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

                    const method = (options.method ?? 'get').toLocaleUpperCase();

                    printOnServer(`  _`)
                    printOnServer(` | Nuxoblisius: SSR Info`)
                    printOnServer(` | `)
                    printOnServer(` ⟡ Uniq ID      : ${uid}`)
                    printOnServer(` ⟡ URL          : ${response._meta.code} ${method} ${fetchUrl}`)
                    printOnServer(` ⟡ Request Time : ${(busyAt).toFixed(4)} s. / ${speedRating}`);
                    if (ruleURL != '') {
                        printOnServer(` ⟡ Rule URL     : ${rule}`);
                    }
                    if (typeof response.body == 'object' && response.body._errorCode) {
                        printOnServer(` 🚫 Error       : ${response.body._errorBody} `);
                    }
                    else {
                        printOnServer(` ✅ OK `);
                    }
                    printOnServer(` |_`);
                }
                return response;
            });
        });
    }
});
