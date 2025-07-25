export const defaultHeaders = {};
export let defaultFetchFailure = () => undefined;
export const options = {
    http: async (url, options, isblob) => {
        let response = await fetch(url, options);
        let _meta = {
            ok: response.ok,
            code: response.status,
            text: response.statusText,
        };
        if (!response.ok) {
            return {
                _meta,
                header: response.headers,
                body: {
                    _errorCode: response.status,
                    _errorText: response.statusText,
                    _errorBody: await response.text()
                }
            };
        }
        if (isblob)
            return { header: response.headers, body: response.blob(), _meta };
        const raw = await response.text();
        if (raw.length > 0 && (raw[0] == '{' || raw[0] == '[')) {
            return { header: response.headers, body: JSON.parse(raw), _meta };
        }
        return { header: response.headers, body: raw, _meta };
    },
    cookie: { get: (name) => '', set: (name, value) => null },
    router: {},
    _templates: {},
    get templates() { return this._templates; }
};
export function setRequestFailure(handle) {
    defaultFetchFailure = handle;
}
export function setDefaultHeader(name, value) {
    defaultHeaders[name] = value;
}
export function setDefaultAuth(string) {
    defaultHeaders.Authorization = string;
}
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
    if ('pageCount' in child) {
        parent.pageCount = child.pageCount;
    }
    if ('protocol' in child) {
        parent.protocol = child.protocol;
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
export function routerInterpolation(data, where) {
    const fromPath = (name) => {
        let index = +(name);
        const isNumber = !Number.isNaN(index);
        if (isNumber) {
            return [name, () => {
                    const splitedPath = options.router.path.split('/');
                    if (index < 0)
                        return splitedPath[splitedPath.length - index] ?? null;
                    return splitedPath[index];
                }];
        }
        return [name, () => options.router.params[name] ?? null];
    };
    const fromQuery = (name) => {
        return [name, () => options.router.query[name] ?? null];
    };
    if (data.startsWith('path.')) {
        return fromPath(data.replace('path.', ''));
    }
    else if (data.startsWith('query.')) {
        return fromQuery(data.replace('query.', ''));
    }
    return where == 'path' ? fromPath(data) : fromQuery(data);
}
export async function storeFetch(url, requestInit, isblob, pattern) {
    const response = await options.http(url, requestInit, isblob);
    if (response instanceof Blob) {
        return {
            header: response.header,
            data: response.body,
            error: false,
            code: 200,
            errorText: '',
            pageCount: 0,
            protocol: null
        };
    }
    if (typeof response.body == 'object' && !Array.isArray(response.body) && '_errorCode' in response.body) {
        if (response.body._errorBody.length > 0 && response.body._errorBody[0] == '{') {
            response.body._errorBody = JSON.parse(response.body._errorBody);
        }
        return {
            header: response.header,
            data: response.body._errorBody || null,
            error: true,
            code: response.body._errorCode || 500,
            errorText: response.body._errorText || 'Unknow',
            pageCount: 0,
            protocol: null
        };
    }
    let data = response.body;
    let pageCount = 0;
    let protocol = null;
    if (isValidPattern(pattern)) {
        const result = callPattern(pattern, response.body) || {};
        data = result.data ?? data;
        pageCount = result.pageCount ?? pageCount;
        protocol = result.protocol ?? protocol;
    }
    return {
        header: response.header,
        data,
        code: 200,
        error: false,
        pageCount,
        errorText: '',
        protocol
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
    }
};
