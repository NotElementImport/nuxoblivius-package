import {IHeaderAttribute} from './headers.js'

interface IStoreRef<K> {
    name: string,
    value: K,
    isEmpty: boolean,
    isImportant: boolean
    watch(callback: Function): void
}

type StoreMeta<T> = T & { ref: Dict<keyof T, IStoreRef<T[keyof T]>> }
type FormMeta<T> = T & StoreMeta<T> & {}
type TemplateFunction = (raw: any) => {data?: any, countPages?: number}

type RuleCallback<P, Q> = (method: { path: Dict<P, any>, query: Q }) => boolean

export declare function defineStore<T>(store: typeof T): T & StoreMeta<T>
export declare function subStore<T>(store: typeof T): T & StoreMeta<T>
export declare function defineForm<T>(store: typeof T): T & FormMeta<T>
export declare abstract class IStore<T> { 
    public get ref(): StoreMeta<T> 
    protected onMounted(): void 
    protected onUnmounted(): void 
}
export declare function later(callback: () => any): Promise<any>

type PathParam<PParams> = `path:${PParams}`
type QueryParam<QParams> = `query:${QParams}`
type StoreParams<PathParams, QueryParams> = PathParam<PathParams>|QueryParam<QueryParams>
type FakeReactiveFunc<T extends any> = () => T
type Dict<T extends PropertyKey, V extends any> = { [P in T]?: V; }
type PipelineValues = (PropertyKey)|number|boolean|null|keyof {'*': string}

type ExpandedRecord<ReturnType, PathParams, QueryParams, KeepByInfo, Protocol>
    =   Record<ReturnType, PathParams, QueryParams, KeepByInfo, {}, Protocol>
        & {
            url(path: string): ExpandedRecord<ReturnType, PathParams, QueryParams, KeepByInfo, Protocol>
            enableBorrow(value: boolean): ExpandedRecord<ReturnType, PathParams, QueryParams, KeepByInfo, Protocol>
            prepare(rule: Dict<keyof KeepByInfo, '*'|null>, behaviour?: () => boolean): ExpandedRecord<ReturnType, PathParams, QueryParams, KeepByInfo, Protocol>
        }

export declare class Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends extends object, Protocol> {
    /**
     * Creating new Record\
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#define See more about Defintion in docs}
     * @param url Path to api
     */
    public static new<T>(url: string): Record<T, 'id', {}, {'id': 'path'}, {}, ''>

    public static Bearer<T extends PropertyKey>(token: T): `Bearer ${T}`
    public static Basic(login: string, password: string): string

    /**
     * Path Param is meta param, of query.\
     * Also can using in `URL` like:
     * ```
     * `/api/my-path/{id}` // `id` is Name of param
     * ```
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#path-params See more about Path Params in docs}
     */
    public pathParam<E extends PropertyKey>(name: E|PathParams, value: string|number|boolean|FakeReactiveFunc): Record<ReturnType, PathParams | E, QueryParams, KeepByInfo, Extends, Protocol>
    
    /**
     * Query is params of fetching like
     * ```
     * `/api/my-path?page=1` // After `?` is Query params
     * ```
     * Queries set as object and can be like group
     * ```
     * {
     *    test: 'my-value' // ?test=my-value
     *    group: {
     *        item: 'test' // ?group[item]=test
     *    }
     * }
     * ```
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#query See more about Query in docs}
     */
    public query<E extends Dict<PropertyKey, any>|QueryParams>(query: () => E, locked?:boolean): Record<ReturnType, PathParams, QueryParams & E, KeepByInfo, Extends, Protocol>
    public query<E extends Dict<PropertyKey, any>|QueryParams>(query: E, locked?:boolean): Record<ReturnType, PathParams, QueryParams & E, KeepByInfo, Extends, Protocol>
    
    /**
     * Setting headers of Fetch
     * ```
     * // Example
     * header('Content-Type', 'application/json')
     * ```
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#headers See more about Headers in docs}
     */
    public header(name: string, value: string|FakeReactiveFunc): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * Body of Request
     * ```
     * // Example
     * body(new FormData())
     * // or
     * body({ 'test': 'value' })
     * ```
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#body See more about Body in docs}
     */
    public body(body: FormData|{[key: string]: any}|FakeReactiveFunc|null): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * Authorization Request
     * ```
     * // Example
     * auth(Record.Bearer('test-token'))
     * // or
     * body(AnotherStore.ref.token)
     * ```
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#authorization See more about Authorization in docs}
     */
    public auth(data: string|FakeReactiveFunc): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * Reloading query if object change
     * ```
     * //if using ssr
     * reloadBy(later(() => this.ref.myVariable))
     * //without
     * reloadBy(() => this.ref.myVariable)
     * // Or basic reactive Vue Value
     * const reactiveValue = ref('val')
     * reloadBy(reactiveValue)
     * ```
     */
    public reloadBy(object: FakeReactiveFunc|object): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    // public isBlob(value: boolean): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends>

    /**
     * Clearing none `locked` queries
     */
    public clearDynamicQuery(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * Add value to Pipeline
     * 
     * Where Pipelines using
     * * How cache `response` of Requests
     * * Getting cached `response`
     * * Checking rules
     * 
     * ```
     * // Example
     * .query({
     *     complete: false
     * })
     * .keepBy('query:complete', 'full') // full - keeping param value 
     * .keepBy('query:complete', 'simply') // simply - keeping only if sets '*' or empty `null`
     * ```
     */
    public keepBy<K extends PropertyKey, Q extends 'path'>(field: `${Q}:${PathParams|K}`, method?: 'simply'|'full'): Record<ReturnType, PathParams, QueryParams, KeepByInfo & Dict<K, Q>, Extends, Protocol>
    public keepBy<K extends PropertyKey, Q extends 'query'>(field: `${Q}:${keyof QueryParams|K}`, method?: 'simply'|'full'): Record<ReturnType, PathParams, QueryParams, KeepByInfo & Dict<K, Q>, Extends, Protocol>
    public keepBy(field: `path:`|`query:`, method?: 'simply'|'full'): Record<ReturnType, PathParams, QueryParams, KeepByInfo & Dict<K, Q>, Extends, Protocol>
    
    /**
     * Get cached `response`, by Pipeline, required setting `keepBy` to working
     */
    public cached<T extends ReturnType>(rule: Dict<keyof KeepByInfo, PipelineValues>, defaultIsnt?: any): T
    
    /**
     * Borrow is logic for: Borrowing data from response.
     * 
     * Example: In Request getAll we had already loaded data for local usage (as by One)\
     * then if we want without fetching get data, we using borrow, we can data from another object\
     * or later responses using Pipelines.\
     * Example
     * ```
     * // Getting all
     * const all = Record.new('/api/item/all')
     * // Getting by one
     * const one = Record.new('/api/item/{id}')
     *      .pathParam('id', null) 
     *      .keepBy('path:id') // add value to Pipeline
     * 
     * // If we early loading data by `all` we can borrow from another
     * one.borrowAtAnother(
     *  {id: '*'}, // if we set pathParam id any value
     *  () => all.response,
     *  (other) => {
     *     // Other, auto mapping array objects by one
     *     if(other.id == one.params.path.id) // if this data exist in borrow object, getting
     *         return other
     *  }
     * )
     * ```
     */
    public borrowAtAnother<T extends Dict<string, any>>(
            logic: Dict<keyof KeepByInfo, PipelineValues>|RuleCallback<PathParam, QueryParam>, 
            another: (() => T),
            as: (value: T[number]) => ReturnType
        ): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * Borrow is logic for: Borrowing data from response.
     * 
     * Example: In Request getAll we had already loaded data for local usage (as by One)\
     * then if we want without fetching get data, we using borrow, we can data from another object\
     * or later responses using Pipelines.\
     * Example
     * ```
     * // Example from at self
     * const all = Record.new('/api/item')
     *      .pathParam('id', null) 
     *      .keepBy('path:id') // add value to Pipeline
     *      .rule( // Getting by one
     *          {id: '*'}, // if we set path param `id` any value, using this rule
     *          (setup) => 
     *              setup
     *                  .url('/api/item/{id}')
     *      )
     *      // If the other rules don't fit
     *      .defaultRule( // Getting all
     *          (setup) => 
     *              setup
     *                  .url('/api/item/all')
     *      )
     *      // if we set path param `id` any value (getting by `one`), and gets `all` early, we can borrow data from `all`
     *      .borrowAtSelf(
     *          {id: '*'}, // if we set path param `id` any value, using this rule,
     *          {id: null}, // Getting cached data with this Pipeline (path param `id` not sets)
     *          (other) => {
     *              // Other, auto mapping array objects by one
     *              if(other.id == one.params.path.id) // if this data exist in borrow object, getting
     *                  return other
     *          }
     *      )
     * ```
     */
    public borrowAtSelf(
            logic: Dict<keyof KeepByInfo, PipelineValues>|RuleCallback<PathParam, QueryParam>,
            from: Dict<keyof KeepByInfo, PipelineValues>, 
            as: (value: ReturnType[number]) => ReturnType[number]
        ): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * Rules required to separate requests by settings
     * 
     * For example, if url differents for loading by one and all we can change url in runtime
     * ```
     * .keepBy('path:id') // add value to Pipeline
     * .rule(
     *     {id: '*'}, // if path param `id` sets, using rule
     *     (setup) =>
     *         setup.url('/api/item/{id}')
     * )
     * // In other cases, using defaultRule
     * .defaultRule(
     *     (setup) =>
     *         setup.url('/api/item/all')
     * )
     * ```
     */
    public rule(
        rule: Dict<keyof KeepByInfo, PipelineValues>|RuleCallback<PathParam, QueryParam>,
        behaviour: (record: 
            ExpandedRecord<ReturnType, PathParams, QueryParams, KeepByInfo, Protocol>
        ) => void
    ): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * Rules required to separate requests by settings
     * 
     * For example, if url differents for loading by one and all we can change url in runtime
     * ```
     * .keepBy('path:id') // add value to Pipeline
     * .rule(
     *     {id: '*'}, // if path param `id` sets, using rule
     *     (setup) =>
     *         setup.url('/api/item/{id}')
     * )
     * // In other cases, using defaultRule
     * .defaultRule(
     *     (setup) =>
     *         setup.url('/api/item/all')
     * )
     * ```
     */
    public defaultRule(
        behaviour: (record: 
            ExpandedRecord<ReturnType, PathParams, QueryParams, KeepByInfo, Protocol>
        ) => void
    ): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * Prevent Request if `response` not empty
     */
    public onlyOnEmpty(enabled?:boolean): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * Swap Method, cleaning Response for changing to actual Response.\
     * `greedy` - Clear permanently, at start of Fetch\
     * `lazy` - Clear after Borrow\
     * `hot` - Hot swaping response, means after getting actual Response
     */
    public swapMethod(method: "lazy"|"greedy"|"hot"): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * Template is Pre proccesing data from Server, using for creating Template `RegisterTemplate()` from `import { RegisterTemplate } from 'nuxoblivius'`
     */
    public template(template: string|TemplateFunction): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * Update all frozen Stuff (none reactive).
     * Also update value `frozenKey`
     */
    public frozenTick(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * Define Protocol, data from template
     */
    public defineProtocol<T extends PropertyKey>(key: T, defaultValue?: any): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol | T>

    /**
     * Cleaning Response
     */
    public clearResponse(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * Hook on fail
     */
    public onFailure(method: (reason: {text: string, code: number}, retry: () => Promise<any>) => any): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * Hook on Finish
     */
    public onFinish(method: (result: T) => void): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>


    /**
     * Fetching data, with method GET.
     * 
     * @param id analog .pathParam('id', some_value)
     */
    public async get(id?: number): Promise<ReturnType>

    /**
     * Fetching data, with method POST.
     * 
     * @param body analog .body(some_value)
     */
    public async post(body?: FormData|{[key: string]: any}|FakeReactiveFunc|null): Promise<ReturnType>

    /**
     * Fetching data, with method PUT.
     * 
     * @param body analog .body(some_value)
     */
    public async put(body?: FormData|{[key: string]: any}|FakeReactiveFunc|null): Promise<ReturnType>

    /**
     * Fetching data, with method DELETE.
     * 
     * @param id analog .pathParam('id', some_value)
     */
    public async delete(id?: number): Promise<ReturnType>

    /**
     * All setting params earlier `pathParam`, `query`
     */
    public get params(): {
        /**
         * Path params values
         */
        path: Dict<PathParams, any>
        /**
         * Queries values
         */
        query: QueryParams
    }

    /**
     * Auto pagination
     */
    public get pagination(): {
        /**
         * Init pagination in query
         * @param how setting in query or in path. Example path: 'path:id', and paste in pathParam `id` paginate value
         */
        setup<P extends PropertyKey, Q extends 'path'>(how: `${Q}:${PathParams|P}`, enabledByDefault?: boolean): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>
        setup<P extends PropertyKey, Q extends 'query'>(how: `${Q}:${keyof QueryParams|P}`, enabledByDefault?: boolean): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>
        setup(how: `path:`|`query:`, enabledByDefault?: boolean): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>
        set enabled(v: boolean): void
        get isLastPage(): boolean

        /**
         * Move pagintaion next
         */
        next(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>
        
        /**
         * Move pagintaion prev
         */
        prev(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>
        
        /**
         * Pagination value
         */
        current: number

        /**
         * Last page
         */
        lastPage: number
    }


    /**
     * Key for update none reactive values using in components `:key`
     */
    public get frozenKey(): number

    /**
     * Static (none reactive) response object [for optimization in heavy cases]
     */
    public get frozenResponse(): ReturnType

    /**
     * Reactive response object
     */
    public get response(): ReturnType

    /**
     * Reactive response object (unpacked from array)
     */
    public get one(): ReturnType[number]

    /**
     * Reactive response object (as array)
     */
    public get many(): ReturnType

    /**
     * Error while Fetching
     */
    public get errorText(): string

    /**
     * Had errros
     */
    public get error(): boolean

    /**
     * Is Fetching
     */
    public get loading(): boolean

    /**
     * Values from template
     */
    public get protocol(): Dict<Protocol, any>
}

export declare class Storage {
    public static client<T>(name: string, value: T): T
    public static server<T>(name: string, value: T): T
}

interface IReturnTemplate<T> {
    data: T
    pageCount?: number
    protocol?: Dict<string, any>
}

export declare function RegisterTemplate<T, E>(name: string, template: (raw: T) => IReturnTemplate<E>)
export declare function CallPattern<I, E>(name: string, data: IReturnTemplate<T>): IReturnTemplate<E>
export declare function ExtendsPattern<I, E>(parent: IReturnTemplate<I>, child: IReturnTemplate<E>): IReturnTemplate<I & E>