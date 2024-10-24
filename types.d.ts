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

export type TemplateResponse<T> = {response: T} & {[P in T]: T[P]}
export type TemplateHandle<T extends object|any[]> = (data: T) => TemplateResponse<T>
export type TemplateInit<T extends object|any[]> = string|TemplateHandle<T>

export declare class Record<R, PathParam extends object, Query> {
    static new<R>(url: string, initValue?: R): Record<R, {}>

    pathParam<N extends PropertyKey, V extends any>(name: N, value: WithMutatble<V>): Record<R, PathParam & Param<N, V>>
    pathParam<N extends keyof PathParam, V extends any>(name: N, value: WithMutatble<V>): Record<R, PathParam>

    readonly query: {
        set<T extends SearchParams>(item: () => (T|Query), baked?: boolean): Record<R, PathParam, T>
        set<T extends SearchParams>(item: Ref<T|Query>, baked?: boolean): Record<R, PathParam, T>
        set<T extends SearchParams>(item: T|Query, baked?: boolean): Record<R, PathParam, T>

        add<T extends SearchParams>(item: () => (T|Query)): Record<R, PathParam, Query | T>
        add<T extends SearchParams>(item: Ref<T|Query>): Record<R, PathParam, Query | T>
        add<T extends SearchParams>(item: T|Query): Record<R, PathParam, Query | T>

        clear(type?: 'dynamic'|'baked'): Record<R, PathParam, Query>
    }

    header(key: string, value: any): Record<R, PathParam, Query>

    reset(items: {
        query?: boolean|'dynamic'|'baked'
        response?: boolean|R|object
        headers?: boolean|string
    }): Record<R, PathParam, Query>

    get param(): ParamProxy<PathParam, {}>
    readonly rawResponse: Ref<R>
    readonly response: R
    readonly headers: RawHeader

    toURL(): string
}