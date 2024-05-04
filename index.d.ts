import {IHeaderAttribute} from './headers.js'

interface IStoreRef<K> {
    name: string,
    value: K,
    isEmpty: boolean,
    isImportant: boolean
    watch(callback: Function): void
}

type StoreMeta<T> = T & { ref: Record<keyof T, IStoreRef<T[keyof T]>> }
type FormMeta<T> = T & StoreMeta<T> & {}
type TemplateFunction = (raw: any) => {data?: any, countPages?: number}

export declare function defineStore<T>(store: typeof T): T & StoreMeta<T>
export declare function subStore<T>(store: typeof T): T & StoreMeta<T>
export declare function defineForm<T>(store: typeof T): T & FormMeta<T>
export declare abstract class IStore<T> { 
    public get ref(): StoreMeta<T> 
    protected onMounted(): void 
    protected onUnmounted(): void 
}
export declare function later(callback: () => any): Promise<any>

// T - Response Object, K - Path Params
export declare class Record<T> {
    public static new<T>(url: string): Record<T>

    public static Bearer(token: string): string
    public static Basic(login: string, password: string): string

    public pathParam<E extends string>(name: E, value: string|number|boolean): Record<T>
    public query(query: object, locked?:boolean): Record<T>
    public header(name: string, value: string): Record<T>
    public body(body: FormData|{[key: string]: any}|null): Record<T>
    public auth(data: string): Record<T>
    public reloadBy(object: object): Record<T>
    public isBlob(value?: boolean): Record<T>
    public clearDynamicQuery(): Record<T>
    public keepBy(...field: "path:"|"query:"): Record<T>
    public keepBy(...field: string): Record<T>
    public swapMethod(method: "lazy"|"greedy"|"hot"): Record<T>
    public template(template: string|TemplateFunction): Record<T>

    public clearResponse(): Record<T>
    public async get(id?: number): object
    public async post(body?: any = null): object
    public async put(body?: any = null): object
    public async delete(id?: number = null): object

    public get pagination(): {
        setup(how: string, enabledByDefault?: boolean): Record<T>
        setup(how: "path:"|"query:", enabledByDefault?: boolean): Record<T>
        set enabled(v: boolean): void
        get isLastPage(): boolean
        next(): Record<T>
        prev(): Record<T>
        current: number
    }

    public get response(): T
    public get errorText(): string
    public get error(): boolean
    public get loading(): boolean
}

export declare class Storage {
    public static client<T>(name: string, value: T): T
    public static server<T>(name: string, value: T): T
}

export declare function RegisterTemplate<T extends any>(name: string, template: (raw: T) => {data?: string, pageCount?: number})
export declare function CallPattern<T extends any>(name: string, data: object): {data?: T, countPages?: number}
export declare function ExtendsPattern<T extends any>(parent: object, child: T): {data?: T, countPages?: number}

type StoreParams<T, K> = `path:${T}`|`query:${K}` 

// export declare class TRecord<T, PP, QQ> {
//     public static new<T, TE extends 'id', QE extends {}>(url: string): TRecord<T, TE, QE>

//     public pathParam<E extends PropertyKey>(name: E, value: string|number|boolean): TRecord<T, PP|E, QQ>
//     public query<E extends {[key: string]: any}>(query: () => E, locked?:boolean): TRecord<T, PP, QQ&E>
//     public query<E extends {[key: string]: any}>(query: E, locked?:boolean): TRecord<T, PP, QQ&E>

//     public keepBy(...field: StoreParams<PP, keyof QQ>[]): TRecord<T, PP, QQ>
//     public keepBy(...field: string[]): TRecord<T, PP, QQ>
    
//     public get pagination(): {
//         setup(how: string, enabledByDefault?: boolean): TRecord<T, PP, QQ>
//         setup(how: StoreParams<PP, keyof QQ>, enabledByDefault?: boolean): TRecord<T, PP, QQ>
//         setup(how: StoreParams<string, string>, enabledByDefault?: boolean): TRecord<T, PP, QQ>
//     }
    
//     public header<K extends keyof IHeaderAttribute>(name: K, value: IHeaderAttribute[K]): TRecord<T, PP, QQ>
// }

// TRecord.new('/test')
//     .pathParam("id", null)
//     .pathParam("demo", null)
//     .query({
//         filter: []
//     })
//     .header('Accept', '')
//     .keepBy('')