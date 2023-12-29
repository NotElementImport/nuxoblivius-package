import { ref } from "vue";

export const settings = {
    fetch: async (...args: any[]) => {},
    router: () => {},
    cookie: (...args: any[]) => {},
    useServerFetch: false
}

export let _defaults = {
    template: ''
};
(globalThis as any).headers = null;
export const configDefaults = (conf: any) => {
    _defaults = conf
}

export const setCustomFetch = (value: Function) => {
    settings.fetch = value as any
}
export const setCustomRouter = (value: Function) => {
    settings.router = value as any
}
export const setCustomCookie = (value: Function) => {
    settings.cookie = value as any
}
export const setHeaders = (value: any) => {
    (globalThis as any).headers = value;
}
export const detectRobots = () => {
    return config.isRobot
}
export const checkForRobots = () => {
    if((globalThis as any).headers != null) {
        config.isRobot = /bot|googlebot|crawler|spider|robot|crawling/i.test((globalThis as any).headers['user-agent'])
    }
    return config.isRobot
}
export const EmulationRobots = () => {
    if((globalThis as any).headers != null) {
        (globalThis as any).headers['user-agent'] = (globalThis as any).headers['user-agent'] + '; spider' as never
    }
}
export const setIsServer = (value: boolean) => {
    settings.useServerFetch = value
}

export const config = {
    get: (object_: any) => object_.value,
    set: (object_: any, value: any) => { object_.value = value },
    init: (value: any) => ref(value),

    request: async (url: string, params: any) => {},

    saveCookie: (name: string, value: any, expr: number)  => {
        let data = settings.cookie(name, {
            maxAge: expr
        });
        (data as any).value = value
    },
    getCookie: (name: string) => {
        return (settings.cookie(name) as any).value
    },

    router: () => {
        return settings.router() as any
    },
    isRobot: false
}

config.request = async (url: string, params: any) => {
    if (settings.useServerFetch || config.isRobot) {
        const fetchData = await settings.fetch(url, { credentials: 'include', responseType: 'text', cache: 'no-cache', ...params }) as any
        return fetchData.data.value
    }
    else {
        const fetchData = await fetch(url, params)
        return await fetchData.text()
    }
}