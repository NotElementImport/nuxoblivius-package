import { ref } from "vue";
export const settings = {
    fetch: async (...args) => { },
    router: () => { },
    cookie: (...args) => { }
};
export let headers = null;
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
    headers = value;
};
export const detectRobots = () => {
    return config.isRobot;
};
let useServerFetch = true;
export const checkForRobots = () => {
    if (headers != null) {
        console.log(/bot|googlebot|crawler|spider|robot|crawling/i.exec(headers['user-agent']));
        config.isRobot = /bot|googlebot|crawler|spider|robot|crawling/i.test(headers['user-agent']);
    }
    else {
        config.isRobot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
    }
    return config.isRobot;
};
export const EmulationRobots = () => {
    if (headers != null) {
        headers['user-agent'] = headers['user-agent'] + '; spider';
    }
};
export const setIsServer = (value) => {
    useServerFetch = value;
};
export const config = {
    get: (object_) => object_.value,
    set: (object_, value) => { object_.value = value; },
    init: (value) => ref(value),
    request: async (url, params) => {
        if (useServerFetch) {
            const fetchData = await settings.fetch(url, { credentials: 'include', responseType: 'text', cache: 'no-cache', server: true, ...params });
            return fetchData.data.value;
        }
        else {
            const fetchData = await fetch(url, params);
            return await fetchData.text();
        }
    },
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
    isRobot: true
};
