import { IFilter } from "../filter"
import IValidate from "./validate"

export declare class IStateManager<K> {
    protected static globalName: string
    constructor(name: string)
    protected _isServer: boolean
    public getParams(name: keyof K): {[name: string] : any}
    protected manage(): void
    protected name(): void
    public watch(name: keyof K, func: () => void): void
    public static globalWatch(name: string, func: () => void): void
    public static globalCatchOnce(name: string, func: () => void): void
    public catchOnce(name: string, func: () => void): void
    public static set(variable: keyof K, value: any): void
    public static ref(variable: keyof K): string
    public static get(variable: keyof K): string
    public static manager<T extends IStateManager>(name: string): T
}

interface IFormField {
    text(title: string, options: {multiline?: boolean, placeholder?: string, maxLength?: number, validate?: IValidate}): object
    email(title: string, options: {placeholder?: string}): object
    tel(title: string, prefix?: string): object
    number(title: string, options: {max?: number, min?: number, validate?: IValidate}): object
    checkbox(title: string, validate?: IValidate): object
    select(title: string, content: {name?: string, value?: any, title?: string}[], validate?:IValidate): object
    api(title: string, modelItem: string, fields: string[], notEmpty?: boolean): object
}

export type PatternsApi = "yii2-data-provider" | ""
export type PlaceKeep = "cookie" | "localStorage" | "cache"
export type AuthType = "bearer-token" | "login-password" | "api-key"
type JoinMethod = 'only-filter'| 'only-sort' | 'only-process'
type Hooks = 'on instance' | 'on awake' | 'before process' | 'after process' | 'on end'

export type StateValue<T> = T
export type StateQuery = {[name: string]: string|number|boolean|StateQuery}

interface ICache {
    [path: string]: {
        duration: 30
        onlyOnSession?: false
        
    }
}

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
    caching(config: {}):  IStateApi<T>
    flat(): IStateApi<T>
    map(func: (value: T) => any): IStateApi<T>
    map<K extends any>(func: (value: K) => any): IStateApi<T>
    sort(func: (a: T, b: T) => number): IStateApi<T>
    sort<K extends any>(func: (a: K, b: K) => number): IStateApi<T>
    has(func: (a: T) => boolean): IStateApi<T>
    has<K extends any>(func: (a: K) => boolean): IStateApi<T>
    hook(type: Hooks, func: (...args: any[]) => void): IStateApi<T>
    pagination(size: number, append?: boolean): IStateApiPagi<T>
    /**
     * Auth to Backend or API
     * @param type 
     * @param login 
     * @param password 
     */
    auth(type: AuthType, login: string, password: string): IStateApi<T>
    join(object: IState<T>|IStateFin<T>|string|StateValue<T>,  type?: JoinMethod): IStateApi<T>
    join(object: IStateApiMany<T>|IStateApiPagiMany<T>|IStateApiOne<T>, fieldLink: string): IStateApi<T>
    joinToQuery(name: string, object: IState<T>|IStateFin<T>|string): IStateApi<T>
    filter(object: string, local?: boolean): IStateApi<T>
    filter(object: string, cmd?: "emit-always"|"emit-localy"): IStateApi<T>
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
    user(): IStateApiOne<T>
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
    method(type: "GET"|"POST"|"PUT"|"DELETE"): IStateApiOne<T>
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
    filter(): IStateApiMany<T>
    user(): IStateApiMany<T>
    setQuery(query: StateQuery): IStateApiMany<T>
    value: StateValue<T>[]
    isLoading: boolean
}

export interface IStateApiPagi<T> {
    template(type:PatternsApi): IStateApiPagi<T>
    caching(duration: number):  IStateApiPagi<T>
    flat(): IStateApiPagi<T>
    hook(type: Hooks, func: (...args: any[]) => void): IStateApiPagi<T>
    map(func: (value: T) => any): IStateApiPagi<T>
    map<K extends any>(func: (value: K) => any): IStateApiPagi<T>
    sort(func: (a: T, b: T) => number): IStateApiPagi<T>
    sort<K extends any>(func: (a: K, b: K) => number): IStateApiPagi<T>
    has(func: (a: T) => boolean): IStateApiPagi<T>
    has<K extends any>(func: (a: K) => boolean): IStateApiPagi<T>
    auth(type: AuthType, login: string, password: string): IStateApiPagi<T>
    filter(object: string, local?: boolean): IStateApiPagi<T>
    filter(object: string, cmd?: "emit-always"|"emit-localy"): IStateApiPagi<T>
    join(object: IState<T>|IStateFin<T>|string|StateValue<T>, type?: JoinMethod): IStateApiPagi<T>
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
    filter(): IStateApiPagiMany<T>
    user(): IStateApiPagiMany<T>
    size(newSize: number): IStateApiPagiMany<T>
    page(number: number): StateValue<T>[]
    pageBy(name: string): StateValue<T>[]
    reset(): IStateApiPagiMany<T>
    setQuery(query: StateQuery): IStateApiPagiMany<T>
    isLoading: boolean
    isFinished: boolean
    max: number
    current: number
}

export type IStateAny = IState<any> | IStateFin<any> | IStateApi<any> | IStateApiPagi<any> | StateValue<any> | IStateApiPagiMany<any> | IStateApiOne<any> | IStateApiMany<any>
export type IApiState = IStateApiOne<any> | IStateApiPagiMany<any> | IStateApiMany<any>

declare class IFormModel<T extends any> extends IStateManager<IFormModel> {
    public get isValidate(): boolean
    protected createForm(description: {[key: string]: any}): void
    public get json(): {[name: keyof T]: any}
    public get formData(): FormData
    public get form(): {[name: keyof T]: {[key: string]: any}}
    public setValues(data: {[name: string]: any}|IStateApiOne<any>): void
    public setValues(data: {[name: string]: any}|IStateApiOne<any>): void
    public validate(): boolean
    public localValidate(name: keyof T): void
    protected get field(): IFormField
}

interface IMoleculaTransform<T> {
    map<K>(func: (value: T, index?: number|string) => K): K[]
    map<K,E>(func: (value: E, index?: number|string) => K): K[]
    has<K>(func: (value: T, index?: number|string) => K): K[]
    has<K,E>(func: (value: E, index?: number|string) => K): K[]
    sort<K>(func: (a: K, b:K) => boolean): K[]
    flat<K>(array: K[]): K[]
    concat<K,E>(a:K[], b:E[]): (K & E)[]
    assign<K,E>(a:K, b:E): (K & E)
}

interface IMolecula<T> {
    transform<K>(build: (value:IMoleculaTransform<T>) => K): IMolecula<K>
}

declare export const state: <T>(value: []|{}|T) => IState<T>
declare export const molecula: <T>(value: string|IStateApi<any>) => IMolecula<T>
declare export default m as typeof IStateManager
declare export const FormModel: typeof IFormModel

declare export const setCustomCookie: (func: Function) => void
declare export const setCustomRouter: (func: Function) => void
declare export const setCustomFetch: (func: Function) => void
declare export const setHeaders: (data: any) => void
declare export const EmulateRobots: () => void
declare export const setDefaultsConfig: (conf: {
    template?: PatternsApi,
    keep?: {
        cachePlace?: PlaceKeep|PlaceKeep[]
    },
}) => void