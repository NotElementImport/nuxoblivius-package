import { ref } from "vue";

export const settings = {
    fetch: async (...args: any[]) => {},
    router: () => {},
    cookie: (...args: any[]) => {}
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

export const config = {
    get: (object_: any) => object_.value,
    set: (object_: any, value: any) => { object_.value = value },
    init: (value: any) => ref(value),

    request: async (url: string, params: any) => {
        if (process.server) {
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
    }
}