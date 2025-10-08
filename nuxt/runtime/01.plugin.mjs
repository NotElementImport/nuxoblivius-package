import { defineNuxtPlugin, useAppConfig, useAsyncData } from "#app";
import { settings, options as ConfigOptions } from "../../dist/config.js";
import { forgetAllStores } from "../../dist/index.js";
import { version } from 'nuxt/package.json'

const isServer = typeof document === "undefined";
const nxDefaultFetch = ConfigOptions.http;

const [nuxtMajorVersion, nuxtMinorVersion, nuxtAtomVersion] = version.split(".");
let nuxtIs3_17_4;

const isNuxt3_17_4 = () => {
    if (nuxtIs3_17_4) {
        return nuxtIs3_17_4;
    }

    const nuxt3_17_4 = 3 * 17 * 4;
    const currentNuxt = (+nuxtMajorVersion) * (+nuxtMinorVersion) * (+nuxtAtomVersion);

    nuxtIs3_17_4 = nuxt3_17_4 >= currentNuxt;

    return nuxtIs3_17_4;
};

const printOnServer = (...args) => {
    if (!isServer) {
        return
    }
    console.log(...args);
};

const isUseAsyncDataFetch = (isHydrate) => {
    return isServer || isHydrate;
};

const useDefaultFetch = async (url, options, isBlob, abort) => {
    const result = await nxDefaultFetch(url, options, isBlob, abort);
    result.header = Object.fromEntries(result.header.entries());
    return JSON.stringify(result);
};

const useFetch = async (isHydrate, key, url, options, isBlob, abort) => {
    if (isNuxt3_17_4()) {
        if (isUseAsyncDataFetch(isHydrate)) {
            var { data } = await useAsyncData(key, async () => {
                return await useDefaultFetch(url, options, isBlob, abort);
            });
            return data.value;
        }

        var response = await useDefaultFetch(url, options, isBlob, abort);
        return response;
    }
    else {
        var { data } = await useAsyncData(key, async () => {
            return await useDefaultFetch(url, options, isBlob, abort);
        });

        return data.value;
    }
};

const useTrackFetch = async (isHydrate, key, url, options, isBlob, abort) => {
    var response = await useFetch(isHydrate, key, url, options, isBlob, abort);

    const statusColor = {
        '1': "#f8f8f8",
        '2': "#78be7e",
        '3': "#e1d040",
        '4': "#b04540",
        '5': '#b04540'
    };

    const statusSymbol = {
        '1': '✪',
        '2': '✔',
        '3': '♻',
        '4': '✖',
        '5': '✖'
    };

    if (!isServer) {
        var tempResponse = response;

        try {
            if (typeof response === "string") {
                tempResponse = JSON.parse(response);
            }

            if (tempResponse._meta) {
                const statusType = `${tempResponse._meta.code}`[0];
                const status = tempResponse._meta.code;

                console.groupCollapsed(`%c ⟡ - Nuxoblivius %c Request %c ${statusSymbol[statusType]} ${status} %c ${options.method ?? "GET"} ${url}`, `
            font-weight: bold;
                background: #78be7e;
                color: black;
                border-radius: 3px;
            `, `
            font-weight: bold;
                background: #008f99;
                color: black;
                margin-left: 5px;
                border-radius: 3px;
            `, `
            font-weight: bold;
                background: ${statusColor[statusType]};
                color: black;
                margin-left: 5px;
                border-radius: 3px;
            `);
                console.table({
                    url: url,
                    options: JSON.stringify(options),
                })
                console.log(` ⟡ - Response:`, response);
                console.groupEnd();
            }
        }
        catch (e) {
            console.warn(e);
        }
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

            settings.httpClient(async (url, options, isBlob, abort) => {
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
                        ? useTrackFetch(_nuxtApp.isHydrating, url, fetchUrl, options, isBlob, abort)
                        : useFetch(_nuxtApp.isHydrating, url, fetchUrl, options, isBlob, abort))
                );

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
                    if (abort.aborted) {
                        printOnServer(` | [! ABORTED]`)
                    }
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
