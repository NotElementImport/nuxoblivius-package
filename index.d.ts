import { Ref } from 'vue'
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
     * `⚙️ Creating new Record object`
     * 
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#define See more about Defintion in docs}
     * @param url Path to api
     * @param defaultValue Init response value
     */
    public static new<T>(url: string, defaultValue?: T): Record<T, 'id', {}, {'id': 'path'}, {}, ''>

    /**
     * `🧰 Utils`\
     * `🧩 Sugar`
     * 
     * Create string for Bearer Authorization
     */
    public static Bearer<T extends PropertyKey>(token: T): `Bearer ${T}`

    /**
     * `🧰 Utils`\
     * `🧩 Sugar`
     * 
     * Create string for Bearer Authorization
     */
    public static Basic(login: string, password: string): string

    /**
     * `⚙️ Configuration`
     * 
     * Path Param is meta param, of query.\
     * Also can using in `URL` like:
     * ```
     * `/api/my-path/{id}` // `id` is Name of param
     * ```
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#path-params See more about Path Params in docs}
     */
    public pathParam<E extends PropertyKey>(name: E|PathParams, value: string|number|boolean|FakeReactiveFunc): Record<ReturnType, PathParams | E, QueryParams, KeepByInfo, Extends, Protocol>
    
    /**
     * `⚙️ Configuration`
     * 
     * ### Search params of Request
     * 
     * Simple:
     * ```ts
     * query({ 'my-param': 'test' }) 
     * // /link?my-param=test
     * ```
     * 
     * With dynamic params:
     * ```ts
     * query({ 'dynamic': () => 'Im could be dynamic' }) 
     * // /link?dynamic=Im%20could%20be%20dynamic
     * ```
     * 
     * Default values:
     * ```ts
     * query({ 'page': 1 }, true) // Baked
     * 
     * query({ 'page': 2 }) // /link?page=2
     * clearDynamicQuery()  // /link?page=1
     * ```
     * 
     * Groups:
     * ```ts
     * enum ESortDirection {
     *  ASC=0,
     *  DESC=1
     * }
     * 
     * let sortDirection = ESortDirection.DESC
     * query({
     *    filter: {
     *       createdAt: '2020-01-01',
     *       title: 'test'
     *    },
     *    sort: () => `${ sortDirection == ESortDirection.ASC ? '' : '-' }id`
     * })
     * // /link?filter[createdAt]=2020-01-01&filter[title]=test&sort=-id
     * ```
     * Check values:
     * ```
     * query({ 'my-param': 'test', dynamic: () => 'my value' })
     * 
     * console.log(request.params.query['my-param']) // 'test'
     * console.log(request.params.query.dynamic) // 'my value'
     * ```
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#query See more about Query in docs}
     */
    public query<E extends Dict<PropertyKey, any>|QueryParams>(query: () => E, locked?:boolean): Record<ReturnType, PathParams, QueryParams & E, KeepByInfo, Extends, Protocol>
    public query<E extends Dict<PropertyKey, any>|QueryParams>(query: E, locked?:boolean): Record<ReturnType, PathParams, QueryParams & E, KeepByInfo, Extends, Protocol>
    
    /**
     * `⚙️ Configuration`
     * 
     * Header of Request
     * 
     * Example:
     * ```ts
     * header('Content-Type', 'application/json')
     * // or
     * header('Content-Type', () => myValue)
     * ```
     * 
     * Also can globaly
     * ```ts
     * SetDefaultHeader('Content-Type', 'application/json')
     * // or
     * SetDefaultHeader('Content-Type', () => myValue)
     * ```
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#headers See more about Headers in docs}
     */
    public header(name: string, value: string|FakeReactiveFunc): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`
     * 
     * Body of Request
     * 
     * Example:
     * ```ts
     * body({ 'my': 'content' }).header('Content-Type', 'application/json')
     * // or
     * body(new FormData())
     * ```
     * 
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#body See more about Body in docs}
     */
    public body(body: FormData|{[key: string]: any}|FakeReactiveFunc|null): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`
     * 
     * Add individual authorization to request
     * 
     * To use globaly
     * ```ts
     * SetDefaultHeader('Authorization', () => YourValue )
     * ```
     * 
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#authorization See more about Authorization in docs}
     */
    public auth(data: string|FakeReactiveFunc): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`\
     * `⚠️ Work only in Client`
     * 
     * Reloading query if object change
     */
    public reloadBy(object: FakeReactiveFunc|object): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`
     * 
     * Change response type to `Blob`
     */
    public isBlob(value: boolean): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends>

    /**
     * `🧰 Utils`
     * 
     * Clearing none `baked` queries
     */
    public clearDynamicQuery(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`\
     * `🪛 For fine-tuning`
     * 
     * ### Create tag to Request
     * 
     * Using in caching Response\
     * And fast tag condition in `borrowFrom`, `borrowAtSelf`, `rule`, `cached`, `prepare`
     * 
     * #### Example for `cached`:
     * ```ts
     * // Save Response by Path-Param id
     * .createTag('path:id', 'full')
     * ...
     * // Gets Response where Path-Param id equals 1, if empty: null
     * .cached({ id: 1 })
     * ```
     * #### Example for `rule`:
     * ```ts
     * // Saved all Response where has page in search param, with value
     * .createTag('query:page', 'full')
     * // If request.search param not null
     * .rule({ page: '*' }, request => {
     *     // Disable Fetch if cached result not empty
     *     request.onlyOnEmpty() 
     *     // Get early Response if exist
     *     request.response = request.cached({ page: request.param.query.page })
     * })
     * ```
     */
    public createTag<K extends PropertyKey, Q extends 'path'>(field: `${Q}:${PathParams|K}`, method?: 'simply'|'full'): Record<ReturnType, PathParams, QueryParams, KeepByInfo & Dict<K, Q>, Extends, Protocol>
    public createTag<K extends PropertyKey, Q extends 'query'>(field: `${Q}:${keyof QueryParams|K}`, method?: 'simply'|'full'): Record<ReturnType, PathParams, QueryParams, KeepByInfo & Dict<K, Q>, Extends, Protocol>
    public createTag(field: `path:`|`query:`, method?: 'simply'|'full'): Record<ReturnType, PathParams, QueryParams, KeepByInfo & Dict<K, Q>, Extends, Protocol>
    
    /**
     * `🧰 Utils`
     * 
     * Get saved Response by Tag. See `createTag()`
     * 
     * Example:
     * ```ts
     * createTag('query:page', 'full') // Creating tag for Saving Response by search param: page, with value
     * ...
     * // Get Saved Response by search param tag: page
     * cached({ page: 1 }) // where page equals 1
     * cached({ page: '*' }) // where page equals any value
     * cached({ page: null }) // where page is not sets
     * ```
     * Also it could be more difficult:
     * ```ts
     * createTag('query:page', 'full') // Creating tag for Saving Response by search param: page, with value
     * createTag('query:perpage', 'simple') // Creating tag for Saving Response by search param: page, without value
     * ...
     * // Get Saved Response by search param tag: page, perpage
     * cached({ page: 1, perpage: null }) // where page equals 1, and perpage not sets
     * cached({ page: 1, perpage: '*' }) // where page equals 1, and perpage is sets
     * ```
     */
    public cached<T extends ReturnType>(conditionTags: Dict<keyof KeepByInfo, PipelineValues>, byDefault?: T): T

    /**
     * `🧰 Utils`
     * 
     * Launch custom logic. Uses for extend methods link
     * 
     * Example:
     * ```ts
     * const commitPage = () => ...
     * 
     * request
     *    .pagination
     *    .next()
     *    .then(commitPage)
     * ```
     * Or
     * ```ts
     * const beforeStartRequest = () => ...
     * const afterStartRequest = () => ...
     * 
     * request
     *    .then(beforeStartRequest)
     *    .get()
     *    .then(afterStartRequest)
     * ```
     */
    public then(handle: () => void): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>
    
    /**
     * `⚙️ Configuration`\
     * `⚡ SPA frendly`\
     * `🪛 For fine-tuning`
     * 
     */
    public borrowFrom<T extends Dict<string, any>>(
            logic: Dict<keyof KeepByInfo, PipelineValues>|RuleCallback<PathParam, QueryParam>, 
            another: (() => T),
            as: (value: T[number]) => ReturnType
        ): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`\
     * `⚡ SPA frendly`\
     * `🪛 For fine-tuning`
     * 
     */
    public borrowAtSelf(
            logic: Dict<keyof KeepByInfo, PipelineValues>|RuleCallback<PathParam, QueryParam>,
            from: Dict<keyof KeepByInfo, PipelineValues>, 
            as: (value: ReturnType[number]) => ReturnType[number]
        ): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`\
     * `🪛 For fine-tuning`
     * 
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
     * `⚙️ Configuration`\
     * `🪛 For fine-tuning`
     * 
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
     * `⚙️ Configuration`\
     * `⚡ SPA frendly`\
     * `⚠️ Work only in Client`
     * 
     * Prevent Request if `response` not empty
     * 
     * ### Prevent when:
     * * Result is not null
     * * Result is not empty object, checking by `Object.keys(response).length !== 0`
     * 
     * ### Which will disable this feature 
     * * Swap method `greedy`, cause `greedy` erase data on Request calls
     * * Pagination, correctly on change page, any changes pages, get access to reload Request. Also can prevent by `swapMethod('hot')`
     * 
     * @param enabled `default: true` — Enable checking, or disable
     */
    public onlyOnEmpty(enabled?:boolean): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`\
     * `🪛 For fine-tuning`
     * 
     * Swap Method controls when Actual Response, must be erase
     * 
     * ### Options
     * * `greedy` - Clear at call Request
     * * `lazy`     - Clear if borrow not Return data
     * * `hot`       - Swap only at end
     */
    public swapMethod(options: "lazy"|"greedy"|"hot"): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`\
     * `🪛 For fine-tuning`
     * 
     * `pattern response reader` - Process raw data from Response
     * 
     * Can using libary:
     * ```ts
     * RegisterTemplate('my-lib', raw => {
     *    if(!raw.data && !raw.items)
     *       return
     *    return { data: raw.data ?? raw.items } // return content into data or items
     * })
     * 
     * request.template('my-lib')
     * ```
     * Or inline version:
     * ```ts
     * request.template(raw => {
     *    if(!raw.data && !raw.items)
     *       return
     *    return { data: raw.data ?? raw.items }
     * })
     * ```
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/template.html See more about Record Template in docs}
     */
    public template(template: string|TemplateFunction): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `🧰 Utils`
     * @deprecated 
     */
    public frozenTick(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`\
     * `🪛 For fine-tuning`\
     * `Part of` : `template`
     * 
     * Define Protocol, data from template
     */
    public defineProtocol<T extends PropertyKey>(key: T, defaultValue?: any): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol | T>

    /**
     * `🧰 Utils`
     * 
     * Sets response as `null`
     */
    public clearResponse(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`
     * 
     * Hook on fail
     */
    public onFailure(method: (reason: {text: string, code: number}, retry: () => Promise<any>) => any): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`
     * 
     * Hook on Finish
     */
    public onFinish(method: (result: T) => void): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`\
     * `🪛 For fine-tuning`
     * 
     * Summed new Response to Actual Response like: `currentResponse.push(...newResponse)`
     */
    public appendsResponse(value?: boolean): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `📤 Call Request`\
     * `⬆️ Method: GET`
     * 
     * Fetching data, with method GET.
     * 
     * `⚠️ Request body can throw error`
     * 
     * @param id analog .pathParam('id', some_value)
     */
    public async get(id?: number): Promise<ReturnType>

    /**
     * `📤 Call Request`\
     * `⬆️ Method: POST`
     * 
     * Fetching data, with method POST.
     * 
     * @param body analog .body(some_value)
     */
    public async post(body?: FormData|{[key: string]: any}|FakeReactiveFunc|null): Promise<ReturnType>

    /**
     * `📤 Call Request`\
     * `⬆️ Method: PUT`
     * 
     * Fetching data, with method PUT.
     * 
     * @param body analog .body(some_value)
     */
    public async put(body?: FormData|{[key: string]: any}|FakeReactiveFunc|null): Promise<ReturnType>

    /**
     * `📤 Call Request`\
     * `⬆️ Method: DELETE`
     * 
     * Fetching data, with method DELETE.
     * 
     * @param id analog .pathParam('id', some_value)
     */
    public async delete(id?: number): Promise<ReturnType>

    /**
     * `📤 Call Request`\
     * `⬆️ Method: PATCH`
     * 
     * Fetching data, with method PATCH.
     * 
     * @param id analog .pathParam('id', some_value)
     */
    public async patch(id?: number): Promise<ReturnType>

    /**
     * `🧰 Utils`
     * 
     * All value params
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
     * `⚙️ Configuration`
     * 
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
         * Reload after move pagination
         */
        autoReload(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

        /**
         * Move pagintaion to start
         */
        toFirst(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

        /**
         * Move pagintaion to start
         */
        toLast(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

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
     * @deprecated
     * Key for update none reactive values using in components `:key`
     */
    public get frozenKey(): number

    /**
     * @deprecated
     * Static (none reactive) response object [for optimization in heavy cases]
     */
    public get frozenResponse(): ReturnType

    /**
     * `⚡ Reactive`
     * 
     * Reactive response object
     */
    public response: ReturnType

    /**
     * `🔧 Property`
     * 
     * Headers of response
     */
    public get headers(): Headers

    /**
     * `⚡ Reactive`\
     * `🧩 TS Sugar`
     * 
     * Reactive response object "one" for Typescript Types
     */
    public get one(): ReturnType[number]

    /**
     * `⚡ Reactive`\
     * `🧩 TS Sugar`
     * 
     * Reactive response object "array" for Typescript Types
     */
    public get many(): ReturnType[]

    /**
     * `⚡ Reactive`\
     * `🔧 Property`
     * 
     * Status Error Text 
     */
    public get errorText(): string

    /**
     * `⚡ Reactive`\
     * `🔧 Property`
     * 
     * Response is with Error
     */
    public get error(): boolean

    /**
     * `⚡ Reactive`\
     * `🔧 Property`
     * 
     * Is Fetching
     */
    public get loading(): boolean

    /**
     * `🔧 Property`
     * 
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
export declare function SetDefaultHeader(name: string, value: (() => any)|string|Ref<any>): void
export declare function OnRecordFetchFailed(handle: (code: number, retry: () => Promise<any>) => Promise<any>|undefined): void
export declare function toRefRaw<T>(object: Ref<T>): T