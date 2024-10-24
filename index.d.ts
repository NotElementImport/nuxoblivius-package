import { ref, Ref } from 'vue'
import { IHeaderAttribute } from './headers.js'

// Basics Interfaces:
interface StoreRef<T> {
    name: string
    value: T
    isEmpty: boolean
    watch(handle: Function): void
}

type ExtractFrom<T, K extends PropertyKey> = T[K] 

type Parametr<T extends any> = (() => T) | T
type BodyParametr<T extends any> = Parametr<T> & FormData

type UnpackParametr<T extends any> = T extends Ref<any> ? T['value'] : (T extends StoreRef<T> ? T['value'] : T)

// Store Interfaces:
type CompiledStoreRefs<T extends any> = { ref: { [P in keyof T]: StoreRef<T[P]> } }
type CompiledStore<T> = T & CompiledStoreRefs<T>

// Template Interfaces:
interface TemplateStruct<T> {
    data?: T
    pageCount?: number
    protocol?: Dict<string, any>
}

type TemplateHandler<T extends any, R extends any> = (raw: T) => TemplateStruct<R>

// Tags Interfaces:
type RuleCallback<P, Q> = (method: { path: Dict<P, any>, query: Q }) => boolean

type TagsCondition<Tags, Value extends any> = Dict<keyof Tags, '*'|'<>'|null|Value>

/** JS Class Definition Store */
export declare function defineStore<T>(store: { new(): T }): CompiledStore<T>
/** 
 * JS Object 
 * @deprecated 
*/
export declare function defineStore<T>(store: () => T): CompiledStore<T>

/** JS Class Definition Store */
export declare function subStore<T>(store: { new(): T }): CompiledStore<T>
/** 
 * JS Object 
 * @deprecated 
*/
export declare function subStore<T>(store: () => T): CompiledStore<T>

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

export interface ISetupConfig {
    headers?:     {[name: string]: any}
    body?:        any
    pathParams?:  {[name: string]: any}
    query?:       any
    borrow?:      [ParamsTags, () => any, (iter: any) => any][]
    rule?:        [ParamsTags, (record: Record) => void][]
    defaultRule?: (record: Record) => void
    swapMethod?:  'hot'|'lazy'|'greedy'
    pagination?:       [string, boolean, boolean]
    oneRequestAtTime?: boolean
    onlyOnEmpty?:      boolean
    appendsResponse?:  boolean
}

type SetupObject = ISetupConfig|((item: Record<{}, {}, {}, {}, {}, {}>) => void)

/**
 * `⚡ Fetch Client`
 * 
 * Nuxoblivius Fetch Client
 */
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
     * `⚙️ Creating new Record object`
     * 
     * With string config
     * 
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#define See more about Defintion in docs}
     * @param conf Path to api and config
     * @param defaultValue Init response value
     */
    public static ff<T>(url: string, defaultValue?: T): Record<T, 'id', {}, {'id': 'path'}, {}, ''>

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
     * Create string for Basic Authorization
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
    public pathParam<E extends PropertyKey>(name: E|PathParams, value: Parametr<any>): Record<ReturnType, PathParams | E, QueryParams, KeepByInfo, Extends, Protocol>
    
    /**
     * `⚙️ Configuration`
     * 
     * ### 🔧 Search params of Request
     * ```ts
     * query({ 'my-param': 'test' }) 
     * // /link?my-param=test
     * ```
     * 
     * With dynamic params:
     * ```ts
     * query({ 'dynamic': () => 'Im could be dynamic' }) 
     * // /link?dynamic=Im could be dynamic
     * ```
     * 
     * #### 🛡️ Default value (Baked):
     * Baked value cannot be erased, by `clearDynamicQuery()`,
     * but can be rewrite
     * ```ts
     * query({ 'page': 1 }, true) // Baked
     * 
     * query({ 'page': 2 }) // /link?page=2
     * clearDynamicQuery()  // /link?page=1
     * ```
     * 
     * #### 📁 Groups:
     * ```ts
     * query({
     *    filter: {
     *       createdAt: '2020-01-01',
     *       title: 'test'
     *    }
     * })
     * // /link?filter[createdAt]=2020-01-01&filter[title]=test&sort=-id
     * ```
     * #### 📤 Getting values:
     * ```ts
     * query({ 'my-param': 'test', dynamic: () => 'my value' })
     * 
     * request.params.query['my-param'] // 'test'
     * request.params.query.dynamic // 'my value'
     * ```
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#query See more about Query in docs}
     */
    public query<E extends Dict<PropertyKey, any>|QueryParams>(query: Parametr<E>, baked?:boolean): Record<ReturnType, PathParams, QueryParams & UnpackParametr<E>, KeepByInfo, Extends, Protocol>
    
    /**
     * `⚙️ Configuration`
     * 
     * Header of Request
     * 
     * Example:
     * ```ts
     * header('Content-Type', 'application/json')
     * // or dynamic value
     * header('Content-Type', () => myValue)
     * ```
     * 
     * Also can globaly
     * ```ts
     * SetDefaultHeader('Content-Type', 'application/json')
     * // or dynamic value
     * SetDefaultHeader('Content-Type', () => myValue)
     * ```
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#headers See more about Headers in docs}
     */
    public header<K extends PropertyKey>(name: keyof IHeaderAttribute|K, value: Parametr<any>): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

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
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#body See more about Body in docs}
     */
    public body(body: BodyParametr<any>): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`
     * 
     * Add individual authorization to request
     * 
     * Or use globaly:
     * ```ts
     * SetDefaultAuth(() => YourValue )
     * ```
     * Also nuxoblivius support `jwt` auth. See `useJWT` in `nuxoblivius/advanced`
     * 
     * {@link https://notelementimport.github.io/nuxoblivius-docs/release/records.html#authorization See more about Authorization in docs}
     */
    public auth(data: string|FakeReactiveFunc): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`\
     * `⚠️ Work only in Client`
     * 
     * Reloading request if object change
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
     * And fast tag condition in `borrowFrom`, `rule`, `cached`, `prepare`
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
     * Remove all cached data from memory
     */ 
    public deleteAllCache(): Record<ReturnType, PathParams, QueryParams, KeepByInfo & Dict<K, Q>, Extends, Protocol>

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
     * `🪛 For fine-tuning`\
     * `⚠️ Work only in Client`
     * 
     * Optimization Of Site Speed
     * 
     * Principle if there is loaded data, why make an unnecessary query?
     * 
     * We can just get data from other object.
     * 
     * Example:
     * ```ts
     * const allItems = [...];
     * 
     * const request = Record.new('/get/one/item/{id}')
     *    .borrowFrom(
     *        { 'id': '*' }, // Operating condition: If path param id is sets
     *        () => allItems, // Where do we get it from
     *        (item) => { Looking for the right element
     *            if(item.id == request.params.path.id) // If suitable
     *                return item // Taking and disabling the request
     *        }
     *    ) 
     * ```
     */
    public borrowFrom<T extends Dict<string, any>>(
            logic: Dict<keyof KeepByInfo, PipelineValues>|RuleCallback<PathParam, QueryParam>, 
            another: (() => T),
            as: (value: T[number]) => ReturnType
        ): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    // /**
    //  * `⚙️ Configuration`\
    //  * `⚡ SPA frendly`\
    //  * `🪛 For fine-tuning`\
    //  * `Working but better use rule + cached`
    //  * 
    //  * W.I.P - Need to rework
    //  * 
    //  * @deprecated
    //  */
    // public borrowAtSelf(
    //         logic: Dict<keyof KeepByInfo, PipelineValues>|RuleCallback<PathParam, QueryParam>,
    //         from: Dict<keyof KeepByInfo, PipelineValues>, 
    //         as: (value: ReturnType[number]) => ReturnType[number]
    //     ): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`\
     * `🪛 For fine-tuning`
     * 
     * Rules required to separate requests settings
     * 
     * For example, if url differents for loading by one and all we can change url in runtime
     * ```
     * .createTag('path:id') // add value to Pipeline
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
    public rule<Value>(
        rule: TagsCondition<KeepByInfo, Value>|RuleCallback<PathParam, QueryParam>,
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
     * .createTag('path:id') // add value to Pipeline
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
    public clearResponse(useDefault: boolean): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `🧰 Utils`
     *
     * Reset some settings `without affect`
     */
    public reset(config: { pagination: boolean, response: boolean|object, query: boolean }): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

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
     * `⚙️ Configuration`\
     * `🪛 For fine-tuning`
     * 
     * Can be only one Request at time
     */
    public oneRequestAtTime(value?: boolean): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

    /**
     * `⚙️ Configuration`\
     * `🧩 Load custom preset`
     * 
     * Create and use config presets to Record
     */
    public preset(setupObject: SetupObject): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

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
         * `⚙️ Configuration`
         * 
         * Init pagination in query
         * @param how setting in query or in path. Example path: 'path:id', and paste in pathParam `id` paginate value
         */
        setup<P extends PropertyKey, Q extends 'path'>(how: `${Q}:${PathParams|P}`, enabledByDefault?: boolean): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>
        setup<P extends PropertyKey, Q extends 'query'>(how: `${Q}:${keyof QueryParams|P}`, enabledByDefault?: boolean): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>
        setup(how: `path:`|`query:`, enabledByDefault?: boolean): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>
        
        /**
         * `🔧 Property`
         * 
         * Enable/Disable pagination
         */
        set enabled(v: boolean): void

        /**
         * `⚡ Reactive`\
         * `🔧 Property`
         * 
         * Is current page, reach last page
         */
        get isLastPage(): boolean

        /**
         * `⚙️ Configuration`
         * 
         * Reload after move pagination
         */
        autoReload(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

        /**
         * `↩️ Move to first page`
         * 
         * Move pagintaion to start
         */
        toFirst(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

        /**
         * `↪️ Move to last page`
         * 
         * Move pagintaion to end
         */
        toLast(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>

        /**
         * `➡️ Move to next page`
         * 
         * Move pagintaion next
         */
        next(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>
        
        /**
         * `⬅️ Move to prev page`
         * 
         * Move pagintaion prev
         */
        prev(): Record<ReturnType, PathParams, QueryParams, KeepByInfo, Extends, Protocol>
        
        /**
         * `⚡ Reactive`
         * 
         * Current page
         */
        current: number

        /**
         * `⚡ Reactive`
         * 
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

/**
 * `⚙️ Configuration`\
 * `🌐 Globaly`\
 * `pattern response reader`
 * 
 * Register new pattern for Template
 * 
 * Example:
 * ```ts
 * RegisterTemplate('my-template', raw => {
 *    if(raw.items) {
 *        return { data: raw.items } // Unpack data
 *    }
 * })
 * 
 * Record.new('/test')
 *     .template('my-template')
 */
export declare function RegisterTemplate<T, E>(name: string, template: TemplateHandler<T, E>)
/**
 * `⚙️ Configuration`\
 * `🌐 Globaly`\
 * `pattern response reader`
 * 
 * Call registered pattern and format data, need for extends other patterns
 * 
 * Example:
 * ```ts
 * RegisterTemplate('unpack-items', raw => ({ data: raw.items }))
 * 
 * const rawData = { items: [...] }
 * 
 * const data = CallPattern('unpack-items', rawData) // { items: [...data] } => { data: [...data], pageCount: undefined, protocol: undefined }
 * ```
 */
export declare function CallPattern<I, E>(name: string, data: I): TemplateStruct<E>
// export declare function ExtendsPattern<I, E>(parent: TemplateStruct<I>, child: TemplateStruct<E>): TemplateStruct<I & E>

/**
 * `⚙️ Configuration`\
 * `🌐 Globaly affect`
 * 
 * Set header for all Requests
 */
export declare function SetDefaultHeader(name: keyof IHeaderAttribute, value: (() => any)|string|Ref<any>): void
/**
 * `⚙️ Configuration`\
 * `🌐 Globaly affect`
 * 
 * Set default auth for all Requests
 */
export declare function SetDefaultAuth(string: (() => any)|string|Ref<any>): void
/**
 * `⚙️ Configuration`\
 * `🌐 Globaly affect`
 * 
 * Default onFailure settings for all Requests
 */
export declare function SetRequestFailure(handle: (reason: {text: string, code: number}, retry: () => Promise<any>|undefined) => void): void

/** 
 * `🧩 Vue Helper`\
 * Get Raw value and create link to `ref()` object
*/
export declare function toRefRaw<T>(object: Ref<T>): T & { raw(): Ref<T> }

type ISpreadObject = {[name: string]: Function}
type ISpreadObjectOut<T extends ISpread> = {[K in keyof T]: ReturnType<T[K]> extends Promise<any> ? Awaited<ReturnType<T[K]>> : ReturnType<T[K]>} 

/** 
 * `🧩 Record Helper`\
 * Using for spread some async logic, and await all routes
*/
export declare function useSpread<T extends ISpreadObject>(object: T): Promise<ISpreadObjectOut<T>>
export declare function useSpread<T extends any>(object: [...T]): Promise<ISpreadObjectOut<T>>

/** 
 * `🧩 Record Helper`\
 * `⚠️ Await not working in Client`
 * 
 * Using for spread some async logic, and await all routes `lazy`
*/
export declare function useLazySpread<T extends ISpreadObject>(object: T): Promise<ISpreadObjectOut<T>>
export declare function useLazySpread<T extends any>(object: [...T]): Promise<ISpreadObjectOut<T>>