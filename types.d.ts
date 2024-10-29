import { Ref } from "vue"

export type WithMutatble<T> = () => T | T | Ref<T>

export type Nullable<T> = T | null
export type SearchParams<P> = {[KEY in keyof P]: P[KEY]}
export type RawHeader  = {[key: string]: any}
export type PathParams = {[key: string]: any}

export type Param<Name, Value> = globalThis.Record<Name, Value>
export type ParamProxy<A, B> = { path: A, query: B }

export type RequestMethod = 'get'|'post'|'put'|'patch'|'delete'

export interface ObliviusRecordOptions extends RequestInit {
    type: 'json'|'text'|'blob'|'arrayBuffer'
}

export type TemplateResponse<T> = ({response: T} & {[P in T]: T[P]})
export type TemplateHandle<T extends object|any[]> = (data: T) => TemplateResponse<T>
export type TemplateInit<T extends object|any[]> = string|TemplateHandle<T>

interface RecordPromise<T> extends Promise<T> {
    readonly lazy: Ref<T>
    useTemplate(template: string): RecordPromise<T>
    castTo(to: 'string'): RecordPromise<string>
    castTo(to: 'array'|'object'): RecordPromise<T>
}

Object.fromEntries()

export interface ObjectConfig { 
    as?: 'clone'|'reference'
    listen?: boolean
    entries?: boolean
}

export interface QueryConfig extends ObjectConfig { 
    baked?: boolean
}

type RuleException = { err: true, type: number }
export type RuleHandler<R extends Record<any, {}, {}>> = (
    $: R,
    helpers: { 
        readonly query: ReturnType<R['query']['toObject']>
        readonly headers: ReturnType<R['headers']['toObject']>
    }
) => void|boolean

export declare class Record<R, PathParam extends object, Query> {
    static new<R>(url: string, initValue?: R): Record<R, {}, {}>

    // pathParam<N extends PropertyKey, V extends any>(name: N, value: WithMutatble<V>): Record<R, PathParam & Param<N, V>>
    // pathParam<N extends keyof PathParam, V extends any>(name: N, value: WithMutatble<V>): Record<R, PathParam>

    readonly rules: {
        only(type: false|'on-empty'|'on-null'|'on-idle'): Record<R, PathParam, Query>
        define(handle: RuleHandler<Record<R, PathParam, Query>>): Record<R, PathParam, Query>
    }

    readonly query: {
        set<T extends SearchParams>(item: T|Query, config?: QueryConfig): Record<R, PathParam, T>
        add<T extends SearchParams>(item: T|Query, config?: QueryConfig): Record<R, PathParam, Query | T>
        clear(type?: 'dynamic'|'baked'): Record<R, PathParam, Query>
        entries(): [string, unknown][]
        toObject(): Query
    }

    readonly pagination: {
        use(where: string, config?: { start?: number, step?: number }): Record<R, PathParam, Query | T>
        use(where: 'query.', config?: { start?: number, step?: number }): Record<R, PathParam, Query | T>
        use(where: 'path.', config?: { start?: number, step?: number }): Record<R, PathParam, Query | T>
        firstPage(config?: { silent?: boolean }): Record<R, PathParam, Query | T>
        nextPage(config?: { force?:boolean, silent?: boolean }): Record<R, PathParam, Query | T>
        prevPage(config?: { force?:boolean, silent?: boolean }): Record<R, PathParam, Query | T>
        lastPage(config?: { silent?: boolean }): Record<R, PathParam, Query | T>
        goToPage(value: number, config?: { silent?: boolean }): Record<R, PathParam, Query | T>
        enable(value: boolean): Record<R, PathParam, Query | T>
        readonly currentPage: number
        readonly countPages: number
        readonly isEnd: boolean
    }

    readonly headers: {
        set(value: RawHeader|Headers, config?: ObjectConfig): Record<R, PathParam, Query>
        add(value: RawHeader|Headers, config?: ObjectConfig): Record<R, PathParam, Query>
        clear(): Record<R, PathParam, Query>
        entries(type?: 'request'|'response'): [string, unknown][]
        toObject(): RawHeader
        response: RawHeader
    }

    readonly as: {
        json: Record<R, PathParam, Query>
        text: Record<R, PathParam, Query>
        buffer: Record<R, PathParam, Query>
        blob: Record<R, PathParam, Query>
    }

    // header(key: string, value: any): Record<R, PathParam, Query>
    // template(...templates: TemplateInit<any>[]): Record<R, PathParam, Query>

    // reset(items: {
    //     query?: boolean|'dynamic'|'baked'
    //     response?: boolean|R|object
    //     headers?: boolean|string
    // }): Record<R, PathParam, Query>

    get param(): ParamProxy<PathParam, {}>

    readonly raw: { 
        response: Ref<R>
    }
    readonly response: R

    // toURL(): string

    get(): RecordPromise<R>
    post(): RecordPromise<R>
    put(): RecordPromise<R>
    patch(): RecordPromise<R>
    delete(): RecordPromise<R>
}

const record = Record.new('/test', [])
    .query.set({ test: 'value' }, { as: 'reference', listen: true })
    .headers.set({ 'Content-Type': 'application/json' })