import { IFilter } from "../../filter"

export type PatternsApi = "yii2-data-provider" | ""
export type PlaceKeep = "cookie" | "localStorage" | "cache"
export type AuthType = "bearer-token" | "login-password" | "api-key"

export type StateValue<T> = T
export type StateQuery = {[name: string]: string|number|boolean|StateQuery}

export interface IState<T> {
    /**
     * Fetch data from API
     * @param url Url to Fetch from API
     */
    api(url:string|{path:string,query:{[name:string]: any}}): IStateApi<T>
    /**
     * Keep data on Client gadget
     * ```ts
     * state('my-data')
     *  .keep('my-name', Infinity)
     *  .place(['cookie', 'localStorage'])
     *  .one()
     * ```
     * @param url Url to Fetch from API
     */
    keep(name: string, duration:number): IStateFin<T>
    /**
     * Basic reactive one item
     */
    one(): StateValue<T>
    /**
     * Reactive of array item
     */
    many(): StateValue<T>[]
}

export interface IStateFin<T> {
    /**
     * Storage or Storages to keep data
     * @param place Where keep
     */
    place(place: PlaceKeep|PlaceKeep[]): IStateFin<T>
    /**
     * If in `place` contains `cache` whats type be
     * @param type type
     */
    cacheType(type: "blob"|"json"|"string"|"number"|"arrayBuffer"): IStateFin<T>
    /**
     * Keeper reactive item
     */
    one(): StateValue<T>
}

export interface IStateApi<T> {
    /**
     * Automatic reload data all times
     */
    reload(): IStateApi<T>
    /**
     * How to parse data from API
     * @param type Type
     */
    template(type:PatternsApi): IStateApi<T>
    map(func: (value: T) => any): IStateApi<T>
    sort(func: (a: T, b: T) => -1|0|1): IStateApi<T>
    has(func: (a: T) => boolean): IStateApi<T>
    pagination(size: number, append?: boolean): IStateApiPagi<T>
    /**
     * Auth to Backend or API
     * @param type 
     * @param login 
     * @param password 
     */
    auth(type: AuthType, login: string, password: string): IStateApi<T>
    join(object: IState<T>|IStateFin<T>|string): IStateApi<T>
    join(object: IStateApiMany<T>|IStateApiPagiMany<T>|IStateApiOne<T>, fieldLink: string): IStateApi<T>
    joinToQuery(name: string, object: IState<T>|IStateFin<T>|string): IStateApi<T>
    filter(object: string): IStateApi<T>
    one(): IStateApiOne<T>
    many(): IStateApiMany<T>
}

export interface IStateApiOne<T> {
    get(value: string|number|{[param:string]:any}): StateValue<T>
    getBy(param: string|{[queryName:string]:string}): StateValue<T>
    setQuery(query: StateQuery): IStateApiOne<T>
    /**
     * Force mode
     */
    user(): IStateApiMany<T>
    /**
     * Just send post data with body
     * @param body 
     */
    send(body: {[name: string]: any}|string): StateValue<T>
    /**
     * Trackable queries
     */
    sync(): ISyncApiOne<T>
    /**
     * Send multipart daata
     * @param form Form Data
     */
    multipart(form: FormData): StateValue<T>
    method(type: "GET"|"POST"|"PUT"|"DELETE"): StateValue<T>
    value: StateValue<T>
    isLoading: boolean
}

export interface ISyncApiOne<T> {
    get(value: string|number|{[param:string]:any}): Promise<StateValue<T>>
    /**
     * Just send post data with body
     * @param body 
     */
    send(body: {[name: string]: any}|string): Promise<StateValue<T>>
    /**
     * Send multipart daata
     * @param form Form Data
     */
    multipart(form: FormData): Promise<StateValue<T>>
}

export interface IStateApiMany<T> {
    all(): StateValue<T>[]
    /**
     * Force mode
     */
    user(): IStateApiMany<T>
    setQuery(query: StateQuery): IStateApiMany<T>
    value: StateValue<T>[]
    isLoading: boolean
}

export interface IStateApiPagi<T> {
    template(type:PatternsApi): IStateApiPagi<T>
    map(func: (value: T) => any): IStateApi<T>
    sort(func: (a: T, b: T) => -1|0|1): IStateApi<T>
    has(func: (a: T) => boolean): IStateApi<T>
    auth(type: AuthType, login: string, password: string): IStateApiPagi<T>
    filter(object: string): IStateApiPagi<T>
    join(object: IState<T>|IStateFin<T>|string): IStateApiPagi<T>
    join(object: IStateApiMany<T>|IStateApiPagiMany<T>|IStateApiOne<T>, fieldLink: string): IStateApiPagi<T>
    joinToQuery(name: string, object: IState<T>|IStateFin<T>|string): IStateApiPagi<T>
    many(): IStateApiPagiMany<T>
}

export interface IStateApiPagiMany<T> {
    value: StateValue<T>[]
    next(): StateValue<T>[]
    prev(): StateValue<T>[]
    /**
     * Force mode
     */
    user(): IStateApiPagiMany<T>
    size(newSize: number): IStateApiPagiMany<T>
    page(number: number): StateValue<T>[]
    pageBy(name: string): StateValue<T>[]
    reset(): IStateApiPagiMany<T>
    setQuery(query: StateQuery): IStateApiPagiMany<T>
    isLoading: boolean
}

export type IStateAny = IState<any> | IStateFin<any> | IStateApi<any> | IStateApiPagi<any> | StateValue<any> | IStateApiPagiMany<any> | IStateApiOne<any> | IStateApiMany<any>