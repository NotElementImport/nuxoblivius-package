import { defineNuxtPlugin, useAppConfig, useNuxtApp, useAsyncData } from "#app";
import { forgetAllStores } from "nuxoblivius/dist";
import { RegisterTemplate } from "nuxoblivius";
import { settings, options as configOptions } from "nuxoblivius/dist/config.js";

const sc = {
  red: (t) => (appInfo.isDev ? `\x1b[31m${t}\x1b[0m` : t),
  green: (t) => (appInfo.isDev ? `\x1b[32m${t}\x1b[0m` : t),
  yellow: (t) => (appInfo.isDev ? `\x1b[33m${t}\x1b[0m` : t),
  blue: (t) => (appInfo.isDev ? `\x1b[34m${t}\x1b[0m` : t),
};

const originalConfigNuxoblivius = {
  ...configOptions,
};

const appInfo = {
  isAnyLogEnabled: false,
  isLogClientEnabled: false,
  isLogServerEnabled: false,
  useNuxtFetchWrapper: true,
  parseError: false,
  appStartTime: 0,
  runOnServer: typeof document === "undefined",
  isDev: false,
  nuxtRequests: {},
  serverRewriteRules: [],
};

function generateUID() {
  if (crypto && "randomUUID" in crypto) {
    return `${crypto.randomUUID()}`;
  }

  let result = "";
  const hashTable = "qwertyuiopasdfghjklzxcvbnm123456789#@";
  for (let i = 0; i < 16; i++)
    result += hashTable[~~(Math.random() * (hashTable.length - 1))];
  return result;
}

function printLogOnServer(...data) {
  if (appInfo.runOnServer && appInfo.isLogServerEnabled) {
    if (appInfo.isDev) {
      console.log(new Date().toISOString(), ...data);
    } else {
      console.log(...data);
    }
  }
}

function printLogOnClient(...data) {
  if (!appInfo.runOnServer && appInfo.isLogClientEnabled && appInfo.isDev) {
    console.log(...data);
  }
}

function printLogOnAny(...data) {
  if (appInfo.runOnServer) {
    printLogOnServer(...data);
  } else {
    printLogOnClient(...data);
  }
}

function getFetchUrl(url) {
  let finalUrl = url;
  let rule = "";

  if (appInfo.runOnServer) {
    for (const [rulePattern, prefixUrl] of Object.entries(
      appInfo.serverRewriteRules,
    )) {
      if (url.startsWith(rulePattern)) {
        rule = rulePattern;
        finalUrl = prefixUrl + url.slice(rulePattern.length);
      }
    }
  }

  return { url, finalUrl, rule };
}

async function doRequest(uid, url, options, isBlob, abort) {
  const requestData = appInfo.nuxtRequests[uid];
  let { finalUrl } = getFetchUrl(url);

  // If client and hydration return from cache:
  if (appInfo.useNuxtFetchWrapper && !appInfo.runOnServer) {
    if (url in requestData.serverRequests) {
      const response = requestData.serverRequests[url];

      return {
        ...response,
        header: new Headers(response.header),
      };
    }
  }
  // Else do request:
  const response = await originalConfigNuxoblivius.http(
    finalUrl,
    options,
    isBlob,
    abort,
  );

  // Save on server, send to client
  if (appInfo.runOnServer) {
    if (!isBlob && response._meta.ok && appInfo.useNuxtFetchWrapper) {
      requestData.serverRequests[url] = {
        ...response,
        header: Object.fromEntries(response.header.entries()),
      };
    }
  }

  if (!response._meta.ok && appInfo.parseError) {
    if (typeof appInfo.parseError === "function") {
      response.body._errorBody = appInfo.parseError(
        response.body._errorBody,
        response,
      );
    } else {
      response.body._errorBody = getAutoErrorMessage(response);
    }
  }

  return response;
}

function getAutoErrorMessage(response) {
  if (response.header.get("Content-Type") === "application/json") {
    const responseAsJson = JSON.parse(response.body._errorBody);

    if (typeof responseAsJson !== "object") {
      return responseAsJson;
    }

    if (responseAsJson.message) {
      return responseAsJson.message;
    } else if (responseAsJson.msg) {
      return responseAsJson.msg;
    } else if (responseAsJson.text) {
      return responseAsJson.text;
    } else if (responseAsJson.stack) {
      return typeof responseAsJson.stack === "object"
        ? Object.values(responseAsJson.stack).join("\n")
        : responseAsJson.stack;
    } else {
      for (const key of Object.keys(responseAsJson)) {
        if (typeof responseAsJson[key] !== "object") {
          return responseAsJson[key];
        }
      }
    }
  }

  return response._meta.text;
}

async function doTrackRequest(uid, ...args) {
  const requestData = appInfo.nuxtRequests[uid];
  let trace = args.pop();

  let requestTimeStart = performance.now();
  const uidOnStartRequest = uid;

  if (appInfo.runOnServer) {
    requestData.requestStats.total = (requestData.requestStats.total ?? 0) + 1;
    requestData.requestStats.leaks[args[0]] = true;
  }

  const response = await doRequest(uid, ...args);

  if (appInfo.runOnServer) {
    if (uidOnStartRequest === requestData.uid) {
      if (response._meta.ok) {
        requestData.requestStats.success =
          (requestData.requestStats.success ?? 0) + 1;
      } else {
        printLogOnServer(
          `${sc.red("✖")} [${response._meta.code}] ${sc.green(`"${args[0]}"`)} ${response.body._errorBody}`,
        );
      }
    }

    if (uidOnStartRequest !== requestData.uid) {
      printLogOnServer(
        [
          `${sc.yellow("⚠")} [${sc.yellow("LEAK REQUEST")}] ${sc.green(`"${args[0]}"`)}`,
          ...(appInfo.isDev
            ? [
                ...trace.map(
                  (v) => `  •  ${sc.yellow(v.trim().replace("\n", ""))}`,
                ),
              ]
            : []),
        ].join("\n"),
      );
    }
  }

  const busyAt = (performance.now() - requestTimeStart) * (1 / 1000);

  if (appInfo.runOnServer && busyAt > 0.367) {
    requestData.requestStats.slow[args[0]] = busyAt * 1000;
  }

  delete requestData.requestStats.leaks[args[0]];

  return response;
}

function normTime(data) {
  if (data > 1000) {
    return `${(data / 1000).toFixed(2)} s`;
  }
  return `${data.toFixed(2)} ms`;
}

export default defineNuxtPlugin({
  name: "nuxoblivius-nuxt-plugin",
  setup: async (nuxtApp) => {
    if (appInfo.runOnServer) {
      appInfo.appStartTime = performance.now();
    }

    let uid = nuxtApp.payload.nuxoblivius?.uid ?? generateUID();
    appInfo.isDev = true; // import.meta.dev;

    const pluginConfig = useAppConfig().nuxoblivius;

    appInfo.isLogClientEnabled = !!pluginConfig.clientLogs;
    appInfo.isLogServerEnabled = !!pluginConfig.logs;
    appInfo.isAnyLogEnabled =
      appInfo.isLogClientEnabled || appInfo.isLogServerEnabled;

    appInfo.parseError = pluginConfig.parseError;
    appInfo.serverRewriteRules = pluginConfig.rules ?? [];

    appInfo.nuxtRequests[uid] = {
      uid: uid,
      serverRequests: {},
      appStartTime: appInfo.appStartTime,
      requestStats: {
        total: 0,
        success: 0,
        slow: {},
        leaks: {},
      },
    };

    if (!appInfo.runOnServer) {
      appInfo.nuxtRequests[uid].serverRequests =
        nuxtApp.payload.nuxoblivius?.serverRequests ?? [];
    }

    if (appInfo.isDev) {
      printLogOnServer([`${sc.blue("⟡")} ·• Start Request: ${uid}`].join("\n"));
      settings.traceRequest();
    }

    nuxtApp.payload.nuxoblivius = {
      uid,
    };
  },
  hooks: {
    "app:created"() {
      settings.httpClient(async (url, options, isBlob, abort, tracing) => {
        const nuxtApp = useNuxtApp();
        const uid = nuxtApp.payload.nuxoblivius.uid;

        RegisterTemplate("nuxt-uid-test", (raw) => ({
          data: raw,
          protocol: {
            uid,
          },
        }));

        appInfo.useNuxtFetchWrapper =
          !isBlob && (nuxtApp.isHydrating || appInfo.runOnServer);

        if (isBlob) {
          printLogOnServer(`[WARN] Blob request in Server part`);
        }

        const response = appInfo.isAnyLogEnabled
          ? await doTrackRequest(uid, url, options, isBlob, abort, tracing)
          : await doRequest(uid, url, options, isBlob, abort);

        response.body = { uid, ...response.body };

        return response;
      });
    },
    "app:rendered"() {
      const nuxtApp = useNuxtApp();
      const uid = nuxtApp.payload.nuxoblivius.uid;

      if (appInfo.runOnServer) {
        const requestData = appInfo.nuxtRequests[uid];

        nuxtApp.payload.nuxoblivius = {
          uid,
          serverRequests: requestData.serverRequests,
        };

        const { success, total } = requestData.requestStats;
        const successValue =
          success == total
            ? sc.green(`${success} / ${total}`)
            : total > 0 && !success
              ? sc.red(`${success} / ${total}`)
              : sc.yellow(`${success} / ${total}`);

        const timeEnd = performance.now() - requestData.appStartTime;

        const timeEndString =
          timeEnd > 1700
            ? `${sc.red(normTime(timeEnd))}`
            : timeEnd > 600
              ? `${sc.yellow(normTime(timeEnd))}`
              : `${sc.green(normTime(timeEnd))}`;

        const countLeaks = Object.keys(requestData.requestStats.leaks).length;
        const leaks = countLeaks
          ? "(" + sc.red(countLeaks) + " still in process)"
          : "";

        printLogOnServer(
          [
            `${sc.blue("⟡")} •· [${timeEndString}] End Request: ${requestData.uid}`,
            `  -  Success requests: ${successValue} ${leaks}`,
            ...(Object.keys(requestData.requestStats.slow).length
              ? [
                  "  -  Slow requests: ",
                  ...Object.entries(requestData.requestStats.slow).map(
                    ([url, time]) => {
                      if (time > 1000) {
                        return `     • ${sc.green(`"${url}"`)}: ${sc.yellow(normTime(time))}`;
                      }
                      return `     • ${sc.green(`"${url}"`)}: ${sc.yellow(normTime(time))}`;
                    },
                  ),
                ]
              : []),
            ...(countLeaks
              ? [
                  "  -  " + sc.yellow("⚠ Leaks requests") + ":",
                  ...Object.entries(requestData.requestStats.leaks).map(
                    ([url]) => {
                      return `     • ${sc.green(`"${url}"`)}`;
                    },
                  ),
                ]
              : []),
          ].join("\n"),
        );

        console.log("");
      }

      delete appInfo.nuxtRequests[uid];

      forgetAllStores();
    },
  },
});
