import { ref } from "vue";
export const settings = {
    fetch: null,
    router: () => { },
    cookie: (...args) => { },
    useServerFetch: false
};
const customsTemplates = new Map();
export let _defaults = {
    template: ''
};
globalThis.headers = null;
export const configDefaults = (conf) => {
    _defaults = conf;
};
export const createCustomTemplate = (name, fetchLogic, paginationLogic) => {
    customsTemplates.set(name, {
        fetch: fetchLogic,
        url: paginationLogic
    });
};
export const useCustomTemplate = (name) => {
    if (customsTemplates.has(name)) {
        return customsTemplates.get(name);
    }
    return null;
};
export const setCustomFetch = (value) => {
    settings.fetch = value;
};
export const setCustomRouter = (value) => {
    settings.router = value;
};
export const setCustomCookie = (value) => {
    settings.cookie = value;
};
export const setHeaders = (value) => {
    globalThis.headers = value;
};
export const detectRobots = () => {
    return config.isRobot;
};
export const checkForRobots = () => {
    if (globalThis.headers != null) {
        config.isRobot = /bot|googlebot|crawler|spider|robot|crawling/i.test(globalThis.headers['user-agent']);
    }
    return config.isRobot;
};
export const EmulationRobots = () => {
    if (globalThis.headers != null) {
        globalThis.headers['user-agent'] = globalThis.headers['user-agent'] + '; spider';
    }
};
export const setIsServer = (value) => {
    settings.useServerFetch = value;
};
export const config = {
    get: (object_) => object_.value,
    set: (object_, value) => { object_.value = value; },
    init: (value) => ref(value),
    request: async (url, params) => { },
    saveCookie: (name, value, expr) => {
        let data = settings.cookie(name, {
            maxAge: expr
        });
        data.value = value;
    },
    getCookie: (name) => {
        return settings.cookie(name).value;
    },
    router: () => {
        return settings.router();
    },
    isRobot: false
};
config.request = async (url, params) => {
    if (settings.fetch) {
        const fetchData = await settings.fetch(url, { credentials: 'include', responseType: 'text', cache: 'no-cache', ...params });
        return fetchData.data.value;
    }
    else {
        const fetchData = await fetch(url, params);
        return await fetchData.text();
    }
};
