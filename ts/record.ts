import { reactive, ref } from "vue"
import { objectMergeRecursive, toRaw } from './utils.js'
import type { Nullable, PathParams, RawHeader, RequestMethod, SearchParams, WithMutatble } from "../types.js"

interface RecordQuery {
    set(object: SearchParams<any>, baked?: boolean): void
    add(object: SearchParams<any>, baked?: boolean): void
    clear(only?: 'dynamic'|'baked'): void
}

export class Record<T> {
    private _rawResponse = ref<Nullable<T>>(null)
    private _props = reactive({
        responseHeaders: {} as RawHeader
    })

    private _path: string = ''
    private _pathParam: PathParams = {}
    private _searchParams: SearchParams<any> = {}
    private _defaultSearchParams: SearchParams<any> = {}
    private _header: RawHeader = {}

    private _oneAtTime: boolean = false
    private _currentRequest: Promise<T> = null
    private _initResponse: T = null

    public get rawResponse() { return this._rawResponse }
    public get response() { return this._rawResponse.value }
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
        record._rawResponse.value = record._initResponse as Nullable<any>

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
            if(typeof query == 'boolean')
                this.query.clear()
            else
                this.query.clear(query)
        }

        if(response) {
            if(typeof response == 'boolean')
                this._rawResponse.value = this._initResponse as Nullable<any>
            else
                this._rawResponse.value = response
        }

        if(headers) {
            if(typeof headers == 'boolean')
                this._header = {}
            else
                delete this._header[headers]
        }

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

    private _process(method: RequestMethod) {
        method = method.toUpperCase() as RequestMethod
    }
}

export default <T>(url: string, $default?: T) => {
    return Record.new(url, $default)
}