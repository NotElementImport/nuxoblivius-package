import { onConfigured } from "./index.js";
export const options = {
    http: async (url, options, isblob) => {
        const response = await fetch(url, options);
        if (!response.ok) {
            return {
                _errorCode: response.status,
                _errorText: response.statusText,
                _errorBody: await response.text()
            };
        }
        if (isblob)
            return response.blob();
        return response.json();
    },
    cookie: { get: (name) => '', set: (name, value) => null },
    router: {},
    _templates: {},
    get templates() { return this._templates; },
    _isServer: false,
    get isServer() { return this._isServer; },
    _apiRoot: '',
    get apiRoot() { return this._apiRoot; }
};
export function callPattern(name, data) {
    if (typeof name == 'string' && name in options.templates) {
        return options.templates[name](data);
    }
    else if (typeof name == "function") {
        return name(data);
    }
    return { data };
}
export function extendsPattern(parent, child) {
    if ('data' in child) {
        parent.data = child.data;
    }
    else if ('pageCount' in child) {
        parent.pageCount = child.pageCount;
    }
    return parent;
}
function isValidPattern(pattern) {
    if (typeof pattern === "string" && pattern.length > 0)
        return true;
    else if (typeof pattern === "function")
        return true;
    else
        return false;
}
export async function storeFetch(url, requestInit, isblob, pattern) {
    const response = await options.http(url, requestInit, isblob);
    if (response instanceof Blob) {
        return {
            data: response,
            error: false,
            code: 200,
            errorText: '',
            pageCount: 0
        };
    }
    if ('_errorCode' in response) {
        return {
            data: null,
            error: true,
            code: response._errorCode,
            errorText: response._errorText,
            pageCount: 0
        };
    }
    let data = response;
    let pageCount = 0;
    if (isValidPattern(pattern)) {
        const result = callPattern(pattern, response) || {};
        if (result.data) {
            data = result.data;
        }
        if (result.countPages) {
            pageCount = result.countPages;
        }
    }
    return {
        data,
        code: 200,
        error: false,
        pageCount,
        errorText: '',
    };
}
export const settings = {
    template(name, logic) {
        options.templates[name] = logic;
        return this;
    },
    httpClient(client) {
        options.http = client;
        return this;
    },
    cookieWorker(logic) {
        options.cookie = logic;
        return this;
    },
    router(logic) {
        options.router = logic;
        return this;
    },
    isServer(value = false) {
        options._isServer = value;
        return this;
    },
    apiRoot(root) {
        options._apiRoot = root;
        return this;
    },
    feedbackCallbacks() {
        onConfigured();
    }
};
