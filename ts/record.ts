import { reactive, ref } from "vue"
import { objectMergeRecursive, toRaw } from './utils.js'
import type { Nullable, PathParams, RawHeader, RequestMethod, SearchParams, WithMutatble } from "../types.js"
import { useTemplate } from "../index.js"
import { useFetch } from "./config.js"

interface RecordQuery {
    set(object: SearchParams<any>, baked?: boolean): void
    add(object: SearchParams<any>, baked?: boolean): void
    clear(only?: 'dynamic'|'baked'): void
}

interface RecordRequest<T> extends Promise<T> {
    resolve(): void
}

export class Record<T> {
    private _rawResponse: Nullable<T> = null
    private _rawResponseRef = ref<Nullable<T>>(null)
    private _props = reactive({
        responseHeaders: {} as RawHeader
    })

    private _type: string = 'json'
    private _path: string = ''
    private _pathParam: PathParams = {}
    private _searchParams: SearchParams<any> = {}
    private _defaultSearchParams: SearchParams<any> = {}
    private _header: RawHeader = {}

    private _oneAtTime: boolean = false
    private _currentRequest: RecordRequest<T> = null
    private _initResponse: T = null
    private _afterResponse: Function[] = []

    public get rawResponse() { return this._rawResponseRef }
    public get response() { return this._rawResponseRef.value }
    public get headers() { return this._props.responseHeaders }

    private _queryProperty: RecordQuery
    public get query() { return this._queryProperty }

    public static new<T>(url: string, $default?: T) {
        const record = new Record<T>()
        
        const isShortURL = url[0] == '/'
        const urlReader = new URL(url, isShortURL ? 'http://localhost' : undefined)

        record._path = decodeURIComponent(
            isShortURL 
                ? urlReader.pathname
                : `${urlReader.origin}${urlReader.pathname}`
        )

        record._initResponse = $default ?? null as Nullable<any>
        record._rawResponse = record._initResponse as Nullable<any>
        record._commitChanges()

        record._queryProperty = {
            add(item, baked = false) {
                return( record[baked ? '_defaultSearchParams' : '_searchParams'] = objectMergeRecursive(
                    record[baked ? '_defaultSearchParams' : '_searchParams'],
                    item
                ), record)
            },
            set(item, baked = false) {
                return (record[baked ? '_defaultSearchParams' : '_searchParams'] = item, record)
            },
            clear(form) {
                if(!form)
                    return (
                        record._searchParams = {},
                        record._defaultSearchParams = {},
                        record
                    )
                
                if(form == 'baked')
                    record._defaultSearchParams = {}
                else if(form == 'dynamic')
                    record._searchParams = {}
                return record
            },
        }

        return record
    }

    public pathParam(name: string, value: WithMutatble<any>) {
        this._pathParam[name] = value
    }

    public header(name: string, value: WithMutatble<any>) {
        this._header[name] = value
        return this
    }

    public reset({ query, response, headers }: { query?: any, response?: any, headers?: any }) {
        if(query) {
            this.query.clear(
                (typeof query == 'boolean')
                    ? undefined
                    : query
            )
        }

        if(response) {
            this._rawResponseRef.value = (typeof response == 'boolean')
                ? this._initResponse as Nullable<any>
                : response
        }

        if(headers) {
            if(typeof headers == 'boolean')
                this._header = {}
            else
                delete this._header[headers]
        }

        return this
    }

    public asText() {
        this._type = 'text'
        return this
    }

    public asJson() {
        this._type = 'json'
        return this
    }

    public asBlob() {
        this._type = 'blob'
        return this
    }

    public asArrayBuffer() {
        this._type = 'arrayBuffer'
        return this
    }

    public toURL() {
        let path = Object.entries(this._pathParam)
            .reduce((p, [key, value]) => p.replace(`{${key}}`, toRaw(value, '') as string), this._path)

        const query: SearchParams<any> = {}

        const toFlatQuery = (item: object, prefix: string = '', suffix: string = '') => {
            Object.entries(item).forEach(([ key, value ]) => {
                value = toRaw(value, '')
                typeof value == 'object'
                    ? toFlatQuery(value, `${prefix+key+suffix}[`, ']')
                    : query[`${prefix}${key}${suffix}`] = value
            })
        }

        toFlatQuery({ ...this._defaultSearchParams, ...this._searchParams })

        return Object.keys(query).length != 0
            ? `${path}?${(new URLSearchParams(query)).toString()}`
            : path
    }

    public get() {
        if(!this._registerRequest())
            return this._currentRequest

        this._process('get')

        return this._currentRequest
    }

    public post() {
        if(!this._registerRequest())
            return this._currentRequest

        this._process('post')
        
        return this._currentRequest
    }

    public put() {
        if(!this._registerRequest())
            return this._currentRequest

        this._process('put')

        return this._currentRequest
    }

    public delete() {
        if(!this._registerRequest())
            return this._currentRequest

        this._process('delete')
        
        return this._currentRequest
    }

    public patch() {
        if(!this._registerRequest())
            return this._currentRequest

        this._process('patch')

        return this._currentRequest
    }

    private _commitChanges() {
        this._rawResponseRef.value = this._rawResponse as any
    }

    private _registerRequest(): boolean {
        if(this._currentRequest && this._oneAtTime)
            return false

        let $resolve: (value: T | PromiseLike<T>) => void
        this._currentRequest = new Promise((resolve) => { $resolve = resolve }) as RecordRequest<any>
        const context = this

        Object.defineProperty(this._currentRequest, 'resolve', { get() {
            return () => {
                for (const afterHandle of context._afterResponse)
                    afterHandle()

                context._commitChanges()
                $resolve(context._rawResponseRef.value as any)
                context._currentRequest = null
            }
        }})

        Object.defineProperty(this._currentRequest, 'castTo', { get() {
            return (type: string) => {
                context._afterResponse.push(() => {
                    const raw = context._rawResponse
                    switch(type) {
                        case 'object': {
                            if(Array.isArray(raw))
                                context._rawResponse = Object.fromEntries(Object.entries(raw)) as T
                            else if(typeof raw == 'string')
                                context._rawResponse = JSON.parse(raw)
                            else if(typeof raw != 'object' || raw == null)
                                context._rawResponse = { response: raw } as T
                        }break
                        case 'array': {
                            if(typeof raw == 'object' && !Array.isArray(raw))
                                context._rawResponse = Array.from(Object.entries(raw)) as T
                            else if(typeof raw != 'object' || raw == null)
                                context._rawResponse = [ raw ] as T
                        }break
                        case 'string': {
                            if(typeof raw == 'object')
                                context._rawResponse = JSON.stringify(raw) as T
                            else if(typeof raw != 'object')
                                context._rawResponse = `${raw}` as T
                        }break
                    }
                })
                return context._currentRequest
            }
        }})

        Object.defineProperty(this._currentRequest, 'useTemplate', { get() {
            return (template: string) => {
                context._afterResponse.push(() => {
                    const check = useTemplate(template, context._rawResponse)
                    context._rawResponse = check.response
                })
                return context._currentRequest
            }
        }})
        
        Object.defineProperty(this._currentRequest, 'lazy', { get() {
            if(typeof document !== 'undefined')
                $resolve(context.rawResponse as any)
            return context.rawResponse
        }})

        return true
    }

    private async _process(method: RequestMethod) {
        const url = this.toURL()

        const result = await useFetch(url, {
            type: this._type,
            headers: Object.fromEntries(Object.entries(this.headers).map(([key, value]) => ([ key, toRaw(value) ]))),
            method: method.toLocaleUpperCase()
        })

        this._rawResponse = result.response

        this._currentRequest.resolve()
    }
}

export default <T>(url: string, $default?: T) => {
    return Record.new(url, $default)
}