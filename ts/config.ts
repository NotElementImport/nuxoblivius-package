type TemplateFunction = (raw: any) => {data?: any, countPages?: number}
type TemplateLogic = {[key: string]: TemplateFunction}
type FetchResult = {data: object|Blob|null, error: boolean, errorText: string, code: number, pageCount: number, protocol?: object, header: object}

export const defaultHeaders = {} as any
export let defaultFetchFailure: Function = () => undefined as object

export const options = {
    /**
     * HTTP request configuration
     */
    http: async (url: string, options: any, isblob: boolean) => {
        let response = await fetch(url, options) // standart fetch
        
        let _meta = { // object for meta data
            ok: response.ok,
            code: response.status,
            text: response.statusText,
        }

        if(!response.ok) {
            return {
                _meta,
                header: response.headers,
                body: {
                    _errorCode: response.status,
                    _errorText: response.statusText,
                    _errorBody: await response.text()
                }
            }
        }

        if(isblob) // for blob data
            return { header: response.headers, body: response.blob(), _meta }
        const raw = await response.text()
        
        if(raw.length > 0 && (raw[0] == '{' || raw[0] == '[')) {
            return { header: response.headers, body: JSON.parse(raw), _meta }
        }
        return {header: response.headers, body: raw, _meta} // this function returns RAW DATA (before template using)
    },
    cookie: { get: (name: string) => '', set: (name: string, value: any) => null as any} as any as { get(name: string): any, set(name: string, value: any): void },
    router: {} as any as { currentRoute: '', params: {}, query: {} },
    _templates: {} as TemplateLogic, // incapsulated templates
    get templates() { return this._templates }
}

export function setRequestFailure(handle: Function) {
    defaultFetchFailure = handle
}

/**
 * User can set default header for all records
 */
export function setDefaultHeader(name: string, value: any) {
    defaultHeaders[name] = value // defaultHeaders are collecting to the array
}

/**
 * User can set default auth value for all records
 */
export function setDefaultAuth(string: any) {
    defaultHeaders.Authorization = string
}

/**
 * Returns converted data by template
 */
export function callPattern(name: string|Function, data: object) {
    if(typeof name == 'string' && name in options.templates) { //find template by name
        return options.templates[name](data)
    }
    else if(typeof name == "function") { // try use template if function is correct
        return name(data)
    }
    
    return { data } // if there isn't correct template
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

/**
 * Check for pattern (template) for Record
 */
function isValidPattern(pattern: string|Function) {
    if(typeof pattern === "string" && pattern.length > 0)
        return true
    else if(typeof pattern === "function")
        return true
    else // if pattern were not set or incorrect
        return false
}

/**
 * Fetching data for store
 */
export async function storeFetch(url: string, requestInit: any, isblob: boolean, pattern: string|TemplateFunction): Promise<FetchResult> {
    const response = await options.http(url, requestInit, isblob) // raw response

    if (response instanceof Blob) { // return value for Blob data
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

    if (typeof response.body == 'object' && !Array.isArray(response.body) && '_errorCode' in response.body) { // case for error
        if(response.body._errorBody.length > 0 && response.body._errorBody[0] == '{') {
            response.body._errorBody = JSON.parse(response.body._errorBody) // forming errorBody
        }

        return { // and return value with info about error IN DATA (that's very helpful)
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

    if (isValidPattern(pattern)) { // check template
        const result = callPattern(pattern, response.body) || {} // use template for response.body if it's correct

        data      = result.data      ?? data
        pageCount = result.pageCount ?? pageCount // return data, pageCount variable and protocol data
        protocol  = result.protocol  ?? protocol
    }

    return { // return final correct value
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
    }
}