import { ref } from "vue";
export const settings = {
    fetch: async (...args) => { },
    router: () => { },
    cookie: (...args) => { }
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
export const config = {
    get: (object_) => object_.value,
    set: (object_, value) => { object_.value = value; },
    init: (value) => ref(value),
    request: async (url, params) => {
        if (process.server) {
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
    }
};
