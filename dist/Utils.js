import { isRef as isVueRef, isReactive } from "vue";
const isClient = typeof document !== 'undefined';
const charTable = '0123456789qwertyuiopasdfghjklzxcvbnm#@$%&*';
export const uniqId = (len = 10) => {
    let result = '';
    for (let i = 0; i < len; i++)
        result += charTable.charAt(Math.floor(Math.random() * (charTable.length - 1)));
    return result;
};
export function spread(struct) {
    const isArray = Array.isArray(struct);
    const entries = Object.entries(struct);
    let completeLength = entries.length;
    let complete = 0;
    const result = {};
    return new Promise(resolve => {
        const tryResolve = () => {
            if (complete == completeLength)
                resolve(isArray ? Object.values(result) : result);
        };
        for (const [key, fun] of entries) {
            (async () => {
                result[key] = await fun();
                complete += 1;
                tryResolve();
            })();
        }
    });
}
export function lazySpread(struct) {
    if (!isClient)
        return spread(struct);
    spread(struct);
}
export function toRefRaw(object) {
    const raw = object.value ?? undefined;
    if (typeof raw === 'undefined')
        throw new Error('raw is empty');
    const proto = Object.getPrototypeOf(raw);
    proto.raw = () => object;
    return raw;
}
export async function resolveOrLater(data, callback) {
    if (data instanceof Promise)
        return data.then(value => callback(value));
    callback(data);
}
export function refOrVar(value) {
    if (typeof value == 'function') {
        value = value();
    }
    if (!value)
        return value;
    if (isRef(value) || isVueRef(value) || value?.__v_isRef) {
        return value.value;
    }
    return value;
}
export function isRef(value) {
    return typeof value == 'object' && '_module_' in value;
}
export function storeToQuery(object) {
    const unpacked = object.value;
    if (typeof unpacked != "object") {
        return {};
    }
    const result = {};
    for (const [name] of Object.entries(unpacked)) {
        if (name.length == 0)
            continue;
        if (name[0] != '_') {
            const value = unpacked[name];
            result[name] = value;
        }
    }
    for (const [name, _] of Object.entries(Object.getOwnPropertyDescriptors(unpacked))) {
        if (name.length == 0)
            continue;
        if (name[0] != '_') {
            const value = unpacked[name];
            if (typeof value != "undefined" && typeof value != "object" && typeof value != "function") {
                if (value != null) {
                    result[name] = value;
                }
            }
        }
    }
    return result;
}
export function urlPathParams(url, params) {
    Object.entries(params)
        .map(([param, value]) => {
        value = value ?? '';
        url = url.replaceAll(`{${param}}`, typeof value !== "number"
            ? (value ? refOrVar(value) : "")
            : value);
    });
    return url;
}
export function queryToUrl(query) {
    let flatObject = {};
    const flat = (objectToFlat, prefix = '', suffix = '') => Object.entries(objectToFlat)
        .map(([name, value]) => typeof value == 'object' && (!isRef(value) && !isVueRef(value))
        ? flat(value, `${prefix + name + suffix}[`, ']')
        : flatObject[`${prefix}${name}${suffix}`] = refOrVar(value));
    flat(query);
    if (Object.keys(flatObject).length == 0)
        return ``;
    return `?${(new URLSearchParams(flatObject)).toString()}`;
}
export function appendMerge(...objects) {
    const result = {};
    const recursive = (value, to) => {
        for (const [nameRec, valueRec] of Object.entries(value)) {
            if (valueRec == null)
                continue;
            if (typeof valueRec == 'object' && !isRef(valueRec) && !isVueRef(valueRec) && !isReactive(valueRec)) {
                if (!(nameRec in to))
                    to[nameRec] = {};
                recursive(to[nameRec], valueRec);
            }
            else {
                to[nameRec] = valueRec;
            }
        }
    };
    for (const local of objects) {
        recursive(local, result);
    }
    return result;
}
export const toURLMeta = (url) => {
    const meta = {
        origin: "",
        path: "",
        query: {},
        pathParams: {},
        defaultPathParams: {},
    };
    const processPathParams = (path) => {
        if (path.includes("{")) {
            for (const part of path.split("{$").slice(1)) {
                const [param] = part.split("}", 2);
                const [key, value = ""] = param.split(":");
                console.log(`"${key}"`, `"${value}"`);
                path = path.replaceAll(`{$${param}}`, process.env[key] ?? value);
            }
            for (const part of path.split("{").slice(1)) {
                const [param] = part.split("}", 2);
                const [key, value = ""] = param.split(":");
                meta.pathParams[key] = decodeURIComponent(value).trim();
                meta.defaultPathParams[key] = decodeURIComponent(value).trim();
                if (value != "") {
                    path = path.replace(`{${param}}`, `{${key}}`);
                }
            }
        }
        return path;
    };
    if (typeof url == "object" && "path" in url) {
        url.path = processPathParams(url.path);
        const globalThisUrl = new URL(url.path[0] == "/" ? `http://localhost${url.path}` : url.path);
        meta.origin = globalThisUrl.origin;
        meta.path = globalThisUrl.pathname.replaceAll("%7D", "}").replaceAll("%7B", "{");
        meta.query = url.query ?? {};
        meta.pathParams = { ...meta.pathParams, ...(url.pathParams ?? {}) };
    }
    else if (typeof url == "string" || url instanceof URL) {
        if (typeof url == "string") {
            url = processPathParams(url);
            url = new URL(url[0] == "/" ? `http://localhost${url}` : url);
        }
        meta.origin = url.origin;
        meta.path = url.pathname.replaceAll("%7D", "}").replaceAll("%7B", "{");
        meta.query = Object.fromEntries(url.searchParams.entries()) ?? {};
    }
    return meta;
};
