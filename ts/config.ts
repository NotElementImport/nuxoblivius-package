export const config = {
    get: (object_: any) => object_,
    set: (object_: any, value: any) => object_ = value,
    init: (value: any) => value,

    request: async (url: string, params: any) => (await fetch(url, params)).text(),

    saveCookie: (name: string, value: any, expr: number) => {},
    getCookie: (name: string) => {},

    router: () => null as any
}