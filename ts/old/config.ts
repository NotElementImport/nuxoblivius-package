import { ref } from "vue";

export const settings = {
    fetch: async (...args: any[]) => {},
    router: () => {},
    cookie: (...args: any[]) => {}
}

export let headers = null

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
    headers = value
}
export const detectRobots = () => {
    return config.isRobot
}
let useServerFetch = true
export const checkForRobots = () => {
    if(headers != null) {
        console.log(
            /bot|googlebot|crawler|spider|robot|crawling/i.exec(headers['user-agent'])
        )
        config.isRobot = /bot|googlebot|crawler|spider|robot|crawling/i.test(headers['user-agent'])
    }
    else {
        config.isRobot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent)
    }
    return config.isRobot
}
export const EmulationRobots = () => {
    if(headers != null) {
        headers['user-agent'] = headers['user-agent'] + '; spider' as never
    }
}
export const setIsServer = (value: boolean) => {
    useServerFetch = value
}

export const config = {
    get: (object_: any) => object_.value,
    set: (object_: any, value: any) => { object_.value = value },
    init: (value: any) => ref(value),

    request: async (url: string, params: any) => {
        if (useServerFetch) {
            const fetchData = await settings.fetch(url, { credentials: 'include', responseType: 'text', cache: 'no-cache', server: true, ...params }) as any
            return fetchData.data.value
        }
        else {
            const fetchData = await fetch(url, params)
            return await fetchData.text()
        }
    },

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
    isRobot: true
}