import { isReactive, reactive, ref, shallowRef, watch } from "vue"
import type { Nullable, PathParams, RawHeader, RequestMethod, SearchParams, WithMutatble, TemplateInit, QueryConfig, ObjectConfig } from "../types.js"
import { objectMergeRecursive, toRaw } from './utils.js'
import { useFetch } from "./config.js"

const EResponseFormat = {
    json: 'json',
    text: 'text',
    blob: 'blob',
    buffer: 'arrayBuffer'
}

class ObliviusRequest<T> {
    private _accept: (value: T) => void
    private _reject: (reason: any) => void
    private _promise: Promise<T>

    private _afterRequest: Function[] = []
    private _endRequest?: Function

    public get promise() {
        return this._promise
    }

    constructor() {
        this._promise = new Promise((res, rej) => {
            this._accept = res
            this._reject = res
        })

        this._promise

        const request = this

        Object.defineProperty(this._promise, 'resolve', { get() {
            return (value: T) => request.resolve(value) 
        }})
    }

    public after(handle: (value: any) => any) {
        this._afterRequest.push(handle)
    }

    public onEnd(handle: (ok: boolean, value: any) => void) {
        this._endRequest = handle
    }

    protected resolve(value: T, silent: boolean = false) {
        if(silent)
            return (this._accept(value), value)

        try {
            this._afterRequest.forEach(callback => {
                value = callback(value)
            })
        }
        catch(e) {
            if(this._endRequest) this._endRequest(false, e)
            return this._reject(e)
        }

        if(this._endRequest) this._endRequest(true, value)

        return (this._accept(value), value)
    }

    protected reject(reason: any) {
        if(this._endRequest) this._endRequest(false, reason)
        return this._reject(reason)
    }
}

type OnlyConfig = { empty?: boolean, idle?: boolean }

class ObliviusRecord {
    private _requestInfo = {
        path:                '',
        searchParams:        {} as SearchParams<any>,
        defaultSearchParams: {} as SearchParams<any>,
        pathParams:          {} as PathParams,
        headers:             {} as RawHeader,
        body:                null as any,
        format:              EResponseFormat.json,
        only:                {} as OnlyConfig
    }
    private _listiners = {
        headers:             [] as Function[],
        searchParams:        [] as Function[],
        defaultSearchParams: [] as Function[],
    }
    
    private _defaultResponse: any = null
    private _rawResponse: any = null
    private _response = ref<any>(null)

    private _requestRules: Function[] = []

    private _responseInfo = reactive({
        loading:    false,
        pending:    false,
        headers:    {},
        protocol:   {},
    })

    private _pagination = {
        currentPage: shallowRef(1),
        enabled: false,
        step: 1,
        startFrom: 1,
        pageCount: shallowRef(1),
        lastPage: shallowRef(true)
    }

    private _flags = {
        idle: true
    }

    private _query: any   = {}
    private _raw: any     = {}
    private _headers: any = {}
    private _as: any      = {}
    private _rules: any = {}

    private _currentRequest?: ObliviusRequest<any>
    private _lastStep: Function = () => {}

    public get response() { return this._response.value }
    public get protocol() { return this._responseInfo.protocol }

    constructor(url: string, initValue: any = null) {
        const record = this

        const isShortURL = url[0] == '/'
        const urlReader = new URL(url, isShortURL ? 'http://localhost' : undefined)

        record._requestInfo.path = decodeURIComponent(
            isShortURL 
                ? urlReader.pathname
                : `${urlReader.origin}${urlReader.pathname}`
        )

        this.commit(() => {
            this._defaultResponse = initValue
            this._rawResponse = this._defaultResponse
            return this._defaultResponse
        })

        const toRefference = (rawValue: Record<string, any>) => {
            const reference: any = {}
            for (const key of Object.keys(rawValue)) {
                if(typeof rawValue[key] == 'function')
                    reference[key] = rawValue[key]
                else    
                    reference[key] = () => rawValue[key]
            }
            return reference
        }

        record._query = {
            set(value: Record<string, any>, { baked = false, as = 'clone', listen = false, entries = false }: QueryConfig = {}) {
                if(value instanceof URLSearchParams) {
                    value = value.entries()
                    entries = true
                }

                const placing = baked ? 'defaultSearchParams' : 'searchParams'
                value = entries ? Object.fromEntries(value as any) : value

                switch(as) {
                    case 'clone': {
                        record._requestInfo[placing] = value 
                    } break
                    case 'reference': {
                        record._requestInfo[placing] = toRefference(value)
                    } break
                }

                if(isReactive(value))
                    record._listiners[placing].push(watch(value, () => {
                        if(as == 'reference') {
                            for (const key of Object.keys(value)) {
                                if(typeof value[key] == 'function')
                                    record._requestInfo[placing][key] = value[key]
                                else    
                                    record._requestInfo[placing][key] = () => value[key]
                            }
                        }

                        if(listen) {
                            record._lastStep()
                        }
                    }, { flush: 'sync' }))

                return record
            },
            add(value: Record<string, any>, { baked = false, as = 'clone', listen = false, entries = false }: QueryConfig = {}) {
                if(value instanceof URLSearchParams) {
                    value = value.entries()
                    entries = true
                }

                const placing = baked ? 'defaultSearchParams' : 'searchParams'
                value = entries ? Object.fromEntries(value as any) : value
                let adds = value

                if(as == 'reference')
                    adds = toRefference(value)

                record._requestInfo[placing] = objectMergeRecursive(record._requestInfo[placing], adds)
                
                if(isReactive(value))
                    record._listiners[placing].push(watch(value, () => {
                        if(as == 'reference') {
                            for (const key of Object.keys(value)) {
                                if(typeof value[key] == 'function')
                                    record._requestInfo[placing][key] = value[key]
                                else    
                                    record._requestInfo[placing][key] = () => value[key]
                            }
                        }

                        if(listen) {
                            record._lastStep()
                        }
                    }, { flush: 'sync' }))

                return record
            },
            clear(type?: 'dynamic'|'static') {
                if(!type) {
                    record._query.clear('dynamic')
                    return record._query.clear('static')
                }
                const placing = type == 'dynamic' ? 'searchParams' : 'defaultSearchParams'

                record._requestInfo[placing] = {}
                record._listiners[placing].forEach(callback => callback())
                record._listiners[placing] = []

                return record
            },
            entries() {
                return Object.entries(record._query.toObject())
            },
            toObject() {
                const query: globalThis.Record<string, any> = {}
                const toFlatQuery = (item: object, prefix: string = '', suffix: string = '') => {
                    Object.entries(item).forEach(([ key, value ]) => {
                        value = toRaw(value, null)
                        if(value == null) return
                        typeof value == 'object'
                            ? toFlatQuery(value, `${prefix+key+suffix}[`, ']')
                            : query[`${prefix}${key}${suffix}`] = value
                    })
                }
                toFlatQuery({ ...record._requestInfo.defaultSearchParams, ...record._requestInfo.searchParams })
                return query
            }
        }
        Object.defineProperty(record, 'query', { get() { return record._query } })

        record._headers = {
            get response() { return record._responseInfo.headers },
            set(value: Record<string, any>, { as = 'clone', listen = false, entries = false }: ObjectConfig = {}) {
                if(value instanceof Headers) {
                    value = value.entries()
                    entries = true
                }

                value = entries ? Object.fromEntries(value as any) : value

                switch(as) {
                    case 'clone': {
                        record._requestInfo.headers = value 
                    } break
                    case 'reference': {
                        record._requestInfo.headers = toRefference(value)
                    } break
                }

                if(isReactive(value))
                    record._listiners.headers.push(watch(value, () => {
                        if(as == 'reference') {
                            for (const key of Object.keys(value)) {
                                if(typeof value[key] == 'function')
                                    record._requestInfo.headers[key] = value[key]
                                else    
                                    record._requestInfo.headers[key] = () => value[key]
                            }
                        }

                        if(listen) {
                            record._lastStep()
                        }
                    }, { flush: 'sync' }))

                return record
            },
            add(value: Record<string, any>, { baked = false, as = 'clone', listen = false, entries = false }: QueryConfig = {}) {
                if(value instanceof Headers) {
                    value = value.entries()
                    entries = true
                }

                value = entries ? Object.fromEntries(value as any) : value
                let adds = as == 'reference' 
                    ? toRefference(value) 
                    : value

                record._requestInfo.headers = objectMergeRecursive(record._requestInfo.headers, adds)
                
                if(isReactive(value))
                    record._listiners.headers.push(watch(value, () => {
                        if(as == 'reference') {
                            for (const key of Object.keys(value)) {
                                if(typeof value[key] == 'function')
                                    record._requestInfo.headers[key] = value[key]
                                else    
                                record._requestInfo.headers[key] = () => value[key]
                            }
                        }

                        if(listen) {
                            record._lastStep()
                        }
                    }, { flush: 'sync' }))

                return record
            },
            clear() {
                record._requestInfo.headers = {}
                record._listiners.headers.forEach(callback => callback())
                record._listiners.headers = []

                return record
            },
            entries(type: 'request'|'response' = 'request') {
                return Object.entries(
                    type == 'request'
                        ? record._headers.toObject()
                        : record._responseInfo.headers
                )
            },
            toObject() {
                const headers: globalThis.Record<string, any> = {}
                Object.entries(record._requestInfo.headers)
                    .forEach(([ key, value ]) => {
                        headers[key] = toRaw(value, null)
                    })
                return headers
            }
        }
        Object.defineProperty(record, 'headers', { get() { return record._headers } })

        record._as = {
            get text() {
                record._requestInfo.format = EResponseFormat.text 
                return record
            },
            get json() {
                record._requestInfo.format = EResponseFormat.json
                return record
            },
            get buffer() {
                record._requestInfo.format = EResponseFormat.buffer
                return record
            },
            get blob() {
                record._requestInfo.format = EResponseFormat.blob
                return record
            }
        }
        Object.defineProperty(record, 'as', { get() { return record._as } })

        record._rules = {
            only(config: OnlyConfig) {
                record._requestInfo.only = config
                return record
            },
            define(handle: Function) {
                record._requestRules.push(handle)
                return record
            }
        }
        Object.defineProperty(record, 'rules', { get() { return record._rules } })
        
        record._raw = {
            get response() { return record._response }
        }
        Object.defineProperty(record, 'raw', { get() { return record._raw } })

        record._query.set(urlReader.searchParams)
    }

    public toURL() {
        const query = this._query.toObject()
        let path = Object.entries(this._requestInfo.pathParams)
            .reduce((p, [key, value]) => p.replace(`{${key}}`, toRaw(value, '') as string), this._requestInfo.path)

        return Object.keys(query).length != 0
            ? `${path}?${(new URLSearchParams(query)).toString()}`
            : path
    }

    private commit(value: any): void {
        if(typeof value == 'function') {
            return (this._response.value = value(this._rawResponse), void 0)
        }
        this._response.value = value
    }

    public get() {
        const request = this._createRequest()
        
        if(!request)
            return this._currentRequest.promise
        else
            this._currentRequest = request

        this._procces(request, 'get')

        return request.promise
    }

    private _isResponseEmpty() {
        const response = this._response.value

        return (response ?? null) == null ||
            (typeof response == 'object' && Object.keys(response).length == 0)
    }

    private _createRequest() {
        if(this._requestInfo.only.idle && !this._flags.idle)
            return
        this._flags.idle = false
        return new ObliviusRequest()
    }

    private async _procces(request: ObliviusRequest<any>, method: RequestMethod) {
        if(this._requestInfo.only.empty && this._isResponseEmpty()) {
            return this.commit(() => {
                // @ts-ignore
                this._rawResponse = request.resolve(this._rawResponse, true)
                return this._rawResponse
            })
        }

        const url = this.toURL()

        const result = await useFetch(url, {
            type: this._requestInfo.format,
            headers: this._headers.toObject(),
            method: method.toLocaleUpperCase()
        } as any)

        this._rawResponse = result.response

        this.commit(() => {
            // @ts-ignore
            this._rawResponse = request.resolve(
                this._rawResponse
            )
            return this._rawResponse
        })
    }
}

export default <T>(url: string, $default?: T) => {
    return new ObliviusRecord(url, $default)
}