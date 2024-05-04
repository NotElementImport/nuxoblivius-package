import { onConfigured } from "./index.js"

type TemplateFunction = (raw: any) => {data?: any, countPages?: number}
type TemplateLogic = {[key: string]: TemplateFunction}
type FetchResult = {data: object|Blob|null, error: boolean, errorText: string, code: number, pageCount: number}

export const options = {
    http: async (url: string, options: any, isblob: boolean) => {
        const response = await fetch(url, options)

        if(!response.ok) {
            return {
                _errorCode: response.status,
                _errorText: response.statusText,
                _errorBody: await response.text()
            }
        }

        if(isblob)
            return response.blob()
        return response.json() 
    },
    cookie: { get: (name: string) => '', set: (name: string, value: any) => null as any} as any as { get(name: string): any, set(name: string, value: any): void },
    router: {} as any as { currentRoute: '', params: {}, query: {} },
    _templates: {} as TemplateLogic,
    get templates() { return this._templates },
    _isServer: false,
    get isServer() { return this._isServer },
    _apiRoot: '',
    get apiRoot() { return this._apiRoot }
}

export function callPattern(name: string|Function, data: object) {
    if(typeof name == 'string' && name in options.templates) {
        return options.templates[name](data)
    }
    else if(typeof name == "function") {
        return name(data)
    }
    
    return { data }
}

export function extendsPattern(parent: any, child: any) {
    if('data' in child) {
        parent.data = child.data    
    }
    else if('pageCount' in child) {
        parent.pageCount = child.pageCount
    }

    return parent
}

function isValidPattern(pattern: string|Function) {
    if(typeof pattern === "string" && pattern.length > 0)
        return true
    else if(typeof pattern === "function")
        return true
    else 
        return false
}

export async function storeFetch(url: string, requestInit: any, isblob: boolean, pattern: string|TemplateFunction): Promise<FetchResult> {
    const response = await options.http(url, requestInit, isblob)

    if(response instanceof Blob) {
        return {
            data: response,
            error: false,
            code: 200,
            errorText: '',
            pageCount: 0
        }
    }

    if('_errorCode' in response) {
        return {
            data: null,
            error: true,
            code: response._errorCode,
            errorText: response._errorText,
            pageCount: 0
        }
    }

    let data = response
    let pageCount = 0

    if(isValidPattern(pattern)) {
        const result = callPattern(pattern, response) || {}

        if(result.data) {
            data = result.data
        }

        if(result.countPages) {
            pageCount = result.countPages
        }
    }

    return {
        data,
        code: 200,
        error: false,
        pageCount,
        errorText: '',
    }
}

export const settings = {
    template(name: string, logic: () => {data: any, countPages?: number}) {
        options.templates[name] = logic
        return this
    },
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
        options._isServer = value
        return this
    },
    apiRoot(root: string) {
        options._apiRoot = root
        return this
    },
    feedbackCallbacks() {
        onConfigured()
    }
}