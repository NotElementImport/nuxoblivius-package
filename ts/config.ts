import { onConfigured } from "./index.js"

type TemplateFunction = (raw: any) => {data?: any, countPages?: number}
type TemplateLogic = {[key: string]: TemplateFunction}
type FetchResult = {data: object|Blob|null, error: boolean, errorText: string, code: number, pageCount: number, protocol?: object, header: object}

export const defaultHeaders = {} as any

export const options = {
    http: async (url: string, options: any, isblob: boolean) => {
        const response = await fetch(url, options)

        if(!response.ok) {
            return {
                header: response.headers,
                body: {
                    _errorCode: response.status,
                    _errorText: response.statusText,
                    _errorBody: await response.text()
                }
            }
        }

        if(isblob)
            return { header: response.headers, body: response.blob() }
        const raw = await response.text()
        
        if(raw.length > 0 && (raw[0] == '{' || raw[0] == '[')) {
            return { header: response.headers, body: JSON.parse(raw) }
        }
        return {header: response.headers, body: raw}
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

export function setDefaultHeader(name: string, value: any) {
    defaultHeaders[name] = value
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
    if('pageCount' in child) {
        parent.pageCount = child.pageCount
    }
    if('protocol' in child) {
        parent.protocol = child.protocol
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
            header: response.header,
            data: response.body,
            error: false,
            code: 200,
            errorText: '',
            pageCount: 0,
            protocol: null as any
        }
    }

    if(typeof response.body == 'object' && !Array.isArray(response.body) && '_errorCode' in response.body) {
        if(response.body._errorBody.length > 0 && response.body._errorBody[0] == '{') {
            response.body._errorBody = JSON.parse(response.body._errorBody)
        }

        return {
            header: response.header,
            data: response.body._errorBody       || null,
            error: true,
            code: response.body._errorCode       || 500,
            errorText: response.body._errorText  || 'Unknow',
            pageCount: 0,
            protocol: null  as any
        }
    }

    let data = response.body
    let pageCount = 0
    let protocol = null

    if(isValidPattern(pattern)) {
        const result = callPattern(pattern, response.body) || {}

        if(result.data) {
            data = result.data
        }

        if(result.countPages) {
            pageCount = result.countPages
        }

        if(result.protocol) {
            protocol = result.protocol
        }
    }

    return {
        header: response.header,
        data,
        code: 200,
        error: false,
        pageCount,
        errorText: '',
        protocol
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