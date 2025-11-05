import { defineNuxtPlugin, useAppConfig, useNuxtApp } from "#app";
import { forgetAllStores } from "nuxoblivius/dist";
import { settings, options as configOptions } from "nuxoblivius/dist/config.js";

const sc = {
    red: (t) => appInfo.isDev ? `\x1b[31m${t}\x1b[0m` : t,
    green: (t) => appInfo.isDev ? `\x1b[32m${t}\x1b[0m` : t,
    yellow: (t) => appInfo.isDev ? `\x1b[33m${t}\x1b[0m` : t,
    blue: (t) => appInfo.isDev ? `\x1b[34m${t}\x1b[0m` : t,
}

const originalConfigNuxoblivius = {
    ...configOptions
};

const appInfo = {
    uid: "",
    isDev: false,
    serverRequests: {},
    serverRewriteRules: [],
    runOnServer: typeof document === "undefined",
    useNuxtFetchWrapper: true,
    isAnyLogEnabled: false,
    isLogClientEnabled: false,
    isLogServerEnabled: false,
    appStartTime: 0,
    parseError: false,
    requestStats: {
        total: 0,
        success: 0,
        slow: {},
        leaks: {}
    }
};

function generateUID() {
    if (crypto && 'generateUID' in crypto) {
        return `${crypto.generateUID()}`;
    }

    let result = '';
    const hashTable = 'qwertyuiopasdfghjklzxcvbnm123456789#@';
    for (let i = 0; i < 16; i++)
        result += hashTable[~~(Math.random() * (hashTable.length - 1))];
    return result;
}

function printLogOnServer(...data) {
    if (appInfo.runOnServer && appInfo.isLogServerEnabled) {
        if (appInfo.isDev) {
            console.log(new Date().toISOString(), ...data);
        }
        else {
            console.log(...data);
        }
    }
};

function printLogOnClient(...data) {
    if (!appInfo.runOnServer && appInfo.isLogClientEnabled && appInfo.isDev) {
        console.log(...data);
    }
};

function printLogOnAny(...data) {
    if (appInfo.runOnServer) {
        printLogOnServer(...data);
    }
    else {
        printLogOnClient(...data);
    }
};

function getFetchUrl(url) {
    let finalUrl = url;
    let rule = "";

    if (appInfo.runOnServer) {
        for (const [rulePattern, prefixUrl] of Object.entries(appInfo.serverRewriteRules)) {
            if (url.startsWith(rulePattern)) {
                rule = rulePattern;
                finalUrl = prefixUrl + url.slice(rulePattern.length);
            }
        }
    }

    return { url, finalUrl, rule };
}

async function doRequest(url, options, isBlob, abort) {
    let { finalUrl } = getFetchUrl(url);

    // If client and hydration return from cache:
    if (appInfo.useNuxtFetchWrapper && !appInfo.runOnServer) {
        if (url in appInfo.serverRequests) {
            const response = appInfo.serverRequests[url];

            return {
                ...response,
                header: new Headers(response.header)
            };
        }
    }
    // Else do request:
    const response = await originalConfigNuxoblivius.http(finalUrl, options, isBlob, abort);

    // Save on server, send to client
    if (appInfo.runOnServer) {
        if (!isBlob && response._meta.ok && appInfo.useNuxtFetchWrapper) {
            appInfo.serverRequests[url] = {
                ...response,
                header: Object.fromEntries(response.header.entries())
            };
        }
    }

    if (!response._meta.ok && appInfo.parseError) {
        if (typeof appInfo.parseError === "function") {
            response.body._errorBody = appInfo.parseError(response.body._errorBody, response);
        }
        else {
            response.body._errorBody = getAutoErrorMessage(response);
        }
    }

    return response;
};

function getAutoErrorMessage(response) {
    if (response.header.get('Content-Type') === "application/json") {
        const responseAsJson = JSON.parse(response.body._errorBody);

        if (typeof responseAsJson !== "object") {
            return responseAsJson;
        }

        if (responseAsJson.message) {
            return responseAsJson.message;
        }
        else if (responseAsJson.msg) {
            return responseAsJson.msg;
        }
        else if (responseAsJson.text) {
            return responseAsJson.text;
        }
        else if (responseAsJson.stack) {
            return typeof responseAsJson.stack === "object"
                ? Object.values(responseAsJson.stack).join("\n")
                : responseAsJson.stack;
        }
        else {
            for (const key of Object.keys(responseAsJson)) {
                if (typeof responseAsJson[key] !== "object") {
                    return responseAsJson[key];
                }
            }
        }
    }

    return response._meta.text;
}

async function doTrackRequest(...args) {
    let trace = args.pop();

    let requestTimeStart = performance.now();
    const uidOnStartRequest = appInfo.uid;

    if (appInfo.runOnServer) {
        appInfo.requestStats.total = (appInfo.requestStats.total ?? 0) + 1;
        appInfo.requestStats.leaks[args[0]] = true;
    }

    const response = await doRequest(...args);

    if (appInfo.runOnServer) {
        if (uidOnStartRequest === appInfo.uid) {
            if (response._meta.ok) {
                appInfo.requestStats.success = (appInfo.requestStats.success ?? 0) + 1;
            }
            else {
                printLogOnServer(`${sc.red('✖')} [${response._meta.code}] ${sc.green(`"${args[0]}"`)} ${response.body._errorBody}`);
            }
        }

        if (uidOnStartRequest !== appInfo.uid) {
            printLogOnServer([
                `${sc.yellow('⚠')} [${sc.yellow('LEAK REQUEST')}] ${sc.green(`"${args[0]}"`)}`,
                ...(appInfo.isDev ? [
                    ...trace.map((v) => `  •  ${sc.yellow(v.trim().replace("\n", ""))}`)
                ] : [])
            ].join("\n"));
        }
    }

    const busyAt = (performance.now() - requestTimeStart) * (1 / 1000);

    if (appInfo.runOnServer && busyAt > 0.367) {
        appInfo.requestStats.slow[args[0]] = busyAt * 1000;
    }

    delete appInfo.requestStats.leaks[args[0]];

    return response;
};

function normTime(data) {
    if (data > 1000) {
        return `${(data / 1000).toFixed(2)} s`;
    }
    return `${data.toFixed(2)} ms`;
}

export default defineNuxtPlugin({
    name: "nuxoblivius-nuxt-plugin",
    setup: (nuxtApp) => {
        if (appInfo.runOnServer) {
            appInfo.appStartTime = performance.now();
        }

        appInfo.uid = nuxtApp.payload.nuxoblivius?.uid ?? generateUID();
        appInfo.isDev = import.meta.dev;

        const pluginConfig = useAppConfig().nuxoblivius;

        appInfo.isLogClientEnabled = !!pluginConfig.clientLogs;
        appInfo.isLogServerEnabled = !!pluginConfig.logs;
        appInfo.isAnyLogEnabled = appInfo.isLogClientEnabled || appInfo.isLogServerEnabled;

        appInfo.parseError = pluginConfig.parseError;
        appInfo.serverRewriteRules = pluginConfig.rules ?? [];

        if (!appInfo.runOnServer) {
            appInfo.serverRequests = nuxtApp.payload.nuxoblivius?.serverRequests ?? [];
        }

        if (appInfo.isDev) {
            printLogOnServer([
                `${sc.blue('⟡')} ·• Start Request: ${appInfo.uid}`
            ].join("\n"));

            settings.traceRequest();
        }


        settings.httpClient(async (url, options, isBlob, abort, tracing) => {
            appInfo.useNuxtFetchWrapper = !isBlob && (nuxtApp.isHydrating || appInfo.runOnServer);

            if (isBlob) {
                printLogOnServer(`[WARN] Blob request in Server part`);
            }

            const response = appInfo.isAnyLogEnabled
                ? await doTrackRequest(url, options, isBlob, abort, tracing)
                : await doRequest(url, options, isBlob, abort);

            return response;
        });
    },
    hooks: {
        'app:rendered'() {
            const nuxtApp = useNuxtApp();

            if (appInfo.runOnServer) {
                nuxtApp.payload.nuxoblivius = {
                    uid: appInfo.uid,
                    serverRequests: appInfo.serverRequests,
                };

                const { success, total } = appInfo.requestStats;
                const successValue = success == total
                    ? sc.green(`${success} / ${total}`)
                    : (total > 0 && !success
                        ? sc.red(`${success} / ${total}`)
                        : sc.yellow(`${success} / ${total}`));

                const timeEnd = performance.now() - appInfo.appStartTime;

                const timeEndString = timeEnd > 1700
                    ? `${sc.red(normTime(timeEnd))}`
                    : (timeEnd > 600
                        ? `${sc.yellow(normTime(timeEnd))}`
                        : `${sc.green(normTime(timeEnd))}`);

                const countLeaks = Object.keys(appInfo.requestStats.leaks).length;
                const leaks = countLeaks
                    ? "(" + sc.red(countLeaks) + " still in process)"
                    : "";

                printLogOnServer([
                    `${sc.blue('⟡')} •· [${timeEndString}] End Request: ${appInfo.uid}`,
                    `  -  Success requests: ${successValue} ${leaks}`,
                    ...(Object.keys(appInfo.requestStats.slow).length
                        ? [
                            '  -  Slow requests: ',
                            ...Object.entries(appInfo.requestStats.slow)
                                .map(([url, time]) => {
                                    if (time > 1000) {
                                        return `     • ${sc.green(`"${url}"`)}: ${sc.yellow(normTime(time))}`;
                                    }
                                    return `     • ${sc.green(`"${url}"`)}: ${sc.yellow(normTime(time))}`;
                                })
                        ]
                        : []),
                    ...(countLeaks
                        ? [
                            '  -  ' + sc.yellow("⚠ Leaks requests") + ':',
                            ...Object.entries(appInfo.requestStats.leaks)
                                .map(([url]) => {
                                    return `     • ${sc.green(`"${url}"`)}`;
                                })
                        ]
                        : []),
                ].join("\n"));

                console.log("");
            }

            appInfo.uid = "";
            appInfo.serverRequests = {};
            appInfo.requestStats = {};
            appInfo.requestStats.slow = {};
            appInfo.requestStats.leaks = {};

            forgetAllStores();
        },
    },
});
