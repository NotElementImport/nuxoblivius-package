import { ref } from "vue";
export const settings = {
    fetch: async (...args) => { },
    router: () => { },
    cookie: (...args) => { },
    headers: null,
    useServerFetch: false
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
    settings.headers = value;
};
export const detectRobots = () => {
    return config.isRobot;
};
export const checkForRobots = () => {
    if (settings.headers != null) {
        config.isRobot = /bot|googlebot|crawler|spider|robot|crawling/i.test(settings.headers['user-agent']);
    }
    return config.isRobot;
};
export const EmulationRobots = () => {
    if (settings.headers != null) {
        settings.headers['user-agent'] = settings.headers['user-agent'] + '; spider';
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
    if (settings.useServerFetch || config.isRobot) {
        const fetchData = await settings.fetch(url, { credentials: 'include', responseType: 'text', cache: 'no-cache', server: true, ...params });
        return fetchData.data.value;
    }
    else {
        const fetchData = await fetch(url, params);
        return await fetchData.text();
    }
};
