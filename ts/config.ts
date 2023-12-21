import { ref } from "vue";

export const settings = {
    fetch: async (...args: any[]) => {},
    router: () => {},
    cookie: (...args: any[]) => {},
    headers: null,
    useServerFetch: false
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
    settings.headers = value
}
export const detectRobots = () => {
    return config.isRobot
}
export const checkForRobots = () => {
    if(settings.headers != null) {
        config.isRobot = /bot|googlebot|crawler|spider|robot|crawling/i.test(settings.headers['user-agent'])
    }
    return config.isRobot
}
export const EmulationRobots = () => {
    if(settings.headers != null) {
        settings.headers['user-agent'] = settings.headers['user-agent'] + '; spider' as never
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
        const fetchData = await settings.fetch(url, { credentials: 'include', responseType: 'text', cache: 'no-cache', server: true, ...params }) as any
        return fetchData.data.value
    }
    else {
        const fetchData = await fetch(url, params)
        return await fetchData.text()
    }
}