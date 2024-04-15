interface IStoreRef<K> {
    name: string,
    value: K,
    isEmpty: boolean,
    isImportant: boolean
    watch(callback: Function): void
}

type StoreMeta<T> = T & { ref: Record<keyof T, IStoreRef<T[keyof T]>> }
type FormMeta<T> = T & StoreMeta<T> & {}

export declare function defineStore<T>(store: typeof T): T & StoreMeta<T>
export declare function subStore<T>(store: typeof T): T & StoreMeta<T>
export declare function defineForm<T>(store: typeof T): T & FormMeta<T>
export declare abstract class IStore<T> { 
    public get ref(): StoreMeta<T> 
    protected onMounted(): void 
    protected onUnmounted(): void 
}
export declare function later(callback: () => any): Promise<any>

export declare class Record<T> {
    public static new<T>(url: string): Record<T>

    public static Bearer(token: string): string
    public static Basic(login: string, password: string): string

    public pathParam(name: string, value: string|number|boolean): Record<T>
    public query(query: object, locked?:boolean): Record<T>
    public header(name: string, value: string): Record<T>
    public body(body: FormData|{[key: string]: any}|null): Record<T>
    public auth(data: string): Record<T>
    public reloadBy(object: object): Record<T>
    public isBlob(value?: boolean): Record<T>
    public clearDynamicQuery(): Record<T>

    public async get(id?: number): object
    public async post(body?: any = null): object
    public async put(body?: any = null): object
    public async delete(id?: number = null): object

    public get response(): T
}

export declare class Storage {
    public static client<T>(name: string, value: T): T
    public static server<T>(name: string, value: T): T
}