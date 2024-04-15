import { onConfigured } from "./index.js"

export const options = {
    http: async (url: string, options: any, isblob: boolean) => {
        const response = await fetch(url, options)
        if(isblob)
            return response.blob()
        return response.json() 
    },
    cookie: { get: (name: string) => '', set: (name: string, value: any) => null as any} as any as { get(name: string): any, set(name: string, value: any): void },
    router: {} as any as { currentRoute: '', params: {}, query: {} },
    isServer: false,
    apiRoot: ''
}

export const settings = {
    httpClient(client: any) {
        options.http = client
        return this
    },
    cookieWorker(logic: any) {
        options.cookie = logic
        return this
    },
    router(logic: any) {
        options.router = logic
        return this
    },
    isServer(value = false) {
        options.isServer = value
        return this
    },
    apiRoot(root: string) {
        options.apiRoot = root
        return this
    },
    feedbackCallbacks() {
        onConfigured()
    }
}