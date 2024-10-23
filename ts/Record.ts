import { appendMerge, isRef, queryToUrl, refOrVar, resolveOrLater, storeToQuery, urlPathParams } from "./Utils.js"
import { defaultHeaders, storeFetch, defaultFetchFailure, routerInterpolation } from "./config.js"
import { isReactive, reactive, watch } from "vue"

type DynamicResponse = {[key: string]: any}

export interface IRecordSetupObject {
    [MarkSetup]:  true
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

type DefinitionTags = {[key: string]: ETagPlace }
type ParamsTags = {[key: string]: string|number|null|'*' }
type ParamsTagsType = {[key: string]: EParamsTagsType }

type Dict<T extends keyof any, K> = { [P in T]: K }

type RequestObject<T> = Promise<T>

enum ETagPlace {
    PATH  = 0,
    QUERY = 1
}

enum EParamsTagsType {
    SIMPLE = 0,
    FULL   = 1
}

enum ESwapMethod {
    HOT        = 0,
    LAZY       = 1,
    GREEDY     = 2,
    PAGINATION = 3
}
/**
 * Checking for disabling some stuff on server
 */
const isClient = typeof document !== 'undefined'

/**
 * Mark Object as setup object
 */
export const MarkSetup = Symbol('Record Setup')
const isSetup   = (value: any) => (value && typeof value === 'object' && value[MarkSetup])

const createRequest = () => {
    let   [ resolve, reject ] = [ (data: any) => {}, () => {} ]
    const request: RequestObject<any> = new Promise((res, rej) => { resolve = res as any; reject = rej as any; } )
    return { request, resolve, reject }    
};

export default class Record {

    // Details

    /** Redirect to current request if on action */
    private _oneRequestAtTime: boolean = false
    /** Object of current Request (Promise object when return a response) */
    private _currentRequest: RequestObject<any>|null = null

    private _defaultValue: any = null

    // Fetch settings

    /** Pathname for fetching  */
    private _url: string = ''
    /** @deprecated Other Stores as Query object */
    private _queryStore: object = null
    /** Query for fetching */
    private _query: {[key: string]: any} = {}
    /** Interpolated Query for fetching */
    private _interQuery: {[key: string]: any} = {}
    /** Baked Query for fetching [cannot be removed] */
    private _staticQuery: {[key: string]: any} = {}
    /** Path params for query */
    private _pathParams: {[key: string]: any} = {}
    /** Interpolated path params for query */
    private _interPathParams: {[key: string]: any} = {}
    /** Headers for query */
    private _headers: {[key: string]: any} = {}
    /** Body request for query */
    private _body: {[key: string]: any}|FormData = null
    /** Authorization for query */
    private _auth: string|null = null
    /** Always use body */
    private _forceBody: boolean = false
    /** Response type is blob */
    private _isBlob: boolean = false
    /** Current `pattern response reader` */
    private _template: string|Function = ''

    // Cachin / Tags

    private _tags: DefinitionTags       = { 'id': ETagPlace.PATH }
    private _tagsType: ParamsTagsType   = { 'id': EParamsTagsType.SIMPLE }
    private _lastRequestTags:ParamsTags = {}

    // Pre Fetch config

    /** Receive data only when the response is empty */
    private _onNullCheck: boolean = false
    /** [For nerds] When to delete data in response  */
    private _swapMethod: ESwapMethod = ESwapMethod.HOT

    // Post Fetch config
    
    /** Data from `pattern response reader` */
    private _protocol: any = {}
    /** Rebuild the object at the specified rule */
    private _recordRuleBehaviour: Function[] = []
    /** Default settings if no rule is suitable  */
    private _defaultRule: Function = () => null as any

    // Event Handlers:

    /** Error Handler */
    private _onError:   Function|null = null;
    /** Finish Response Handler */
    private _onEnd:     Function|null = null;

    // Links

    /** For re-launching fetch */
    private _lastStep: Function = () => (new Promise((resolve) => resolve(null)))

    /** Proxy object for getting multiple data, uses in param.query */
    private _proxies: any = {}

    /** Registered borrows logic */
    private _borrow: Map<ParamsTags, [ParamsTags, (response: any) => any]> = new Map()
    private _borrowAnother: Map<ParamsTags, (response: any) => any> = new Map()
    private _enabledBorrow = true
    
    /** Old Response / Cached Data */
    private _allCachedResponse: Map<ParamsTags, any> = new Map()


    private _paginationEnabled: boolean = false
    private _pagination = {
        change: false,
        where: 'path',
        param: 'page'
    }
    
    /** Vue Reactive Variables */
    private _variables = reactive({
        currentPage: 1,              // Pagination.current
        maxPages: 1,                 // Pagination.lastPage
        autoReloadPagination: false, // Reload data after change page
        expandResponse: false,       // Appends response to end
        isLastPage: false,           // Is last page

        response: null,              // Reactive Response Object
        headers: {},                 // Response headers
        error: '',                   // status text

        frozenKey: 0,                /** @deprecated [Nerd] :key variable, for manual watch effect */

        isError: false,             
        isLoading: false
    })

    /** @deprecated [Nerd] Frozen Response for manual trigger WatchEffect */
    private _frozenResponse: any = null;

    // Property 

    /** @deprecated useless */
    public get frozenResponse() {
        return this._frozenResponse;
    }

    /** @deprecated useless */
    public get frozenKey() {
        return this._variables.frozenKey;
    }

    /**
     * Get response
     */
    public get response() {
        return this._variables.response
    }

    /**
     * Set response
     */
    public set response(value: any) {
        this._variables.response = value
    }

    /**
     * Get response Headers
     */
    public get headers() {
        return this._variables.headers
    }

    /**
     * [Module] Pagination
     * 
     */
    public get pagination() {
        // Extract context
        const pThis = this
        return {
            setup(how: string, enabledByDefault = true) {
                this.enabled = enabledByDefault

                if(how.startsWith('query:')) {
                    pThis._pagination.where = 'query'
                    pThis._pagination.param = how.slice(6)
                }
                else if(how.startsWith('path:')) {
                    pThis._pagination.where = 'path'
                    pThis._pagination.param = how.slice(5)
                }

                pThis._swapMethod = ESwapMethod.PAGINATION

                return pThis
            },
            autoReload(value = true) { // Enable auto reload on current page
                pThis._variables.autoReloadPagination = value
                return pThis
            },
            set enabled(v: boolean) { // Enable pagination
                pThis._paginationEnabled = v
            },
            toFirst() { // Go to first page, if on isnt
                if(pThis._variables.currentPage == 1)
                    return pThis

                pThis._variables.currentPage = 1
                pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage
                if(pThis._variables.autoReloadPagination)
                    pThis._lastStep()
                return pThis
            },
            toLast() { // Go to last page, if on isnt
                if(pThis._variables.currentPage == pThis._variables.maxPages)
                    return pThis

                pThis._variables.currentPage = pThis._variables.maxPages;
                pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage
                pThis._pagination.change = true
                if(pThis._variables.autoReloadPagination)
                    pThis._lastStep()
                return pThis
            },
            next() { // Move to next page, while is not last page
                if(pThis._variables.maxPages > pThis._variables.currentPage) {
                    pThis._variables.currentPage += 1
                    pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage
                    pThis._pagination.change = true
                    if(pThis._variables.autoReloadPagination)
                        pThis._lastStep()
                }

                return pThis
            },
            prev() { // Move to prev page, while is not first page
                if(pThis._variables.currentPage > 1) {
                    pThis._variables.currentPage -= 1
                    pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage
                    pThis._pagination.change = true
                    if(pThis._variables.autoReloadPagination)
                        pThis._lastStep()
                }

                return pThis
            },
            get isLastPage() {
                return pThis._variables.isLastPage
            },
            set current(v: number) { // Set current page
                pThis._variables.currentPage = v
                pThis._pagination.change = true
                if(pThis._variables.autoReloadPagination)
                    pThis._lastStep()
            },
            get current() {
                return pThis._variables.currentPage
            },
            get lastPage() {
                return pThis._variables.maxPages
            }
        }
    }
    
    /**
     * Get Path Param and Query, values
     */
    public get params() {
        const pthis = this
        return {
            get path() {
                return pthis._proxies.pathParam
            },
            get query() {
                return pthis._proxies.query
            }
        }
    }

    /**
     * other data from `pattern response reader`, define with `defineProtocol`
     */
    public get protocol() {
        return this._protocol
    }

    /**
     * Is fetching data
     */
    public get loading() {
        return this._variables.isLoading
    }

    /**
     * If catch error
     */
    public get error() {
        return this._variables.isError
    }

    /**
     * If catch error set errorText
     */
    public get errorText() {
        return this._variables.error
    }

    // Creating

    public static new(url: string, defaultValue?: any) {
        const instance = new Record();
        
        const isShortURL = url[0] == '/'
        const urlReader = new URL(url, isShortURL ? 'http://localhost:3000' : undefined);

        instance._url = decodeURIComponent(isShortURL ? urlReader.pathname : urlReader.origin+urlReader.pathname);
        
        // Path Interpolation
        const pathInterpolation = instance._url.split('[').splice(1);
        if(pathInterpolation.length != 0) {
            for (let data of pathInterpolation) {
                data = data.split(']').shift().trim();
                const [ name, value ] = routerInterpolation(data, 'path') as [string, Function]
                instance._interPathParams[name as string] = value
                instance._url = instance._url.replaceAll(`[${data}]`, `{${name}}`)
                instance.pathParam(name as string, value)
            }
        }

        for (let [key, value] of urlReader.searchParams.entries()) {
            value = decodeURIComponent(value);
            key   = decodeURIComponent(key);

            if(value[0] == '[') {
                const [ _, queryValue ] = routerInterpolation(value.slice(1, -1), 'query')
                instance._interQuery[key] = queryValue;
                continue;
            }

            instance._query[key] = value;
        }

        // instance._url = url
        instance._variables.response = defaultValue ?? null;
        instance._defaultValue = defaultValue ?? null;

        instance._proxies.query = new Proxy({}, {
            get(t, p, r) {
                if(p in instance._query)
                    return refOrVar(instance._query[p as any])
                else if(p in instance._staticQuery)
                    return refOrVar(instance._staticQuery[p as any])
                else if(p in instance._interQuery)
                    return refOrVar(instance._interQuery[p as any])
                return undefined
            }
        })

        instance._proxies.pathParam = new Proxy({}, {
            get(t, p, r) {
                if(p in instance._pathParams)
                    return refOrVar(instance._pathParams[p as any])
                else if(p in instance._interPathParams)
                    return refOrVar(instance._interPathParams[p as any])
                return undefined
            }
        })

        return instance
    }

    public static ff(code: string = '', defaultValue?: any) {
        const instruction = code.split(';')
        const record = Record.new(instruction.pop().trim(), defaultValue)

        for (let tag of instruction) {
            tag = tag.trim()

            switch(tag) {
                case 'swap-lazy': record.swapMethod('lazy'); continue;
                case 'swap-greedy': record.swapMethod('greedy'); continue;
                case 'swap-hot': record.swapMethod('hot'); continue;
                case 'on-empty': record.onlyOnEmpty(); continue;
                case 'one-at-time': record.oneRequestAtTime(); continue;
            }

            if(tag.startsWith("template ")) {
                record.template(tag.replace('template ', ''))
            }
            else if(tag.startsWith("page ")) {
                record.pagination.setup(tag.replace('page ', '').trim())
                record.pagination.autoReload()
            }
        }

        return record
    }

    // Sugar

    /**
     * [Sugar] Change d.ts type from array to item
     */
    public get one() {
        return this._variables.response
    }

    /**
     * [Sugar] Change d.ts type from item to array
     */
    public get many() {
        return this._variables.response
    }

    /**
    * [Sugar] Creating Bearer auth string  
    */
    public static Bearer(token: string) {
        return `Bearer ${token}`
    }

    /**
    * [Sugar] Creating Basic auth string  
    */
    public static Basic(login: string, password: string) {
        return `Basic ${ btoa(login+":"+password) }`
    }

    /**
     * [Sugar] body json
     */
    public static json(item: any): IRecordSetupObject {
        return {
            [MarkSetup]: true,
            headers: { 'Content-Type': 'application/json' },
            body: () => JSON.stringify(refOrVar(item)),
        }
    }

    /**
     * [Sugar] body urlEncoded
     */
    public static urlEncoded(item: any): IRecordSetupObject {
        return {
            [MarkSetup]: true,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: () => {
                const raw = refOrVar(item)
                return queryToUrl(raw)
            },
        }
    }

    // Configuration

    // Custom presets
    public preset(object: IRecordSetupObject|((item: Record) => void)) {
        if(typeof object === 'function') {
            object(this)
            return this
        }

        if('body' in object) this.body(object.body);
        if('appendsResponse' in object) this.appendsResponse(object.appendsResponse);
        if('onlyOnEmpty' in object) this.onlyOnEmpty(object.onlyOnEmpty);
        if('oneRequestAtTime' in object) this.oneRequestAtTime(object.oneRequestAtTime);
        
        if(object.headers) {
            for(const [name, value] of Object.entries(object.headers))
                this.header(name, value);
        }

        if(object.rule) {
            for(const  [condition, apply] of object.rule)
                this.rule(condition, apply);
        }

        if(object.borrow) {
            for(const [condition, from, research] of object.borrow)
                this.borrowFrom(condition, from, research)
        }

        if(object.defaultRule) this.defaultRule(object.defaultRule)
        if(object.query) this.query(object.query)
        if(object.swapMethod) this.swapMethod(object.swapMethod)
        if(object.pagination) {
            const [name, enabled, autoReload] = object.pagination
            this.pagination.setup(name, enabled)
            this.pagination.autoReload(autoReload)
        }

        if(object.pathParams) {
            for(const [name, value] of Object.entries(object.pathParams))
                this.pathParam(name, value);
        }

        return this;
    }

    /**
    * [Configuration]
    * [Nerds] Creating Tag for processing: `borrow`, `caching`, `rules`
    * 
    * simple - check has value or not
    * full   - can access to value
    */
    public createTag(field: string, access: 'simple'|'full' = 'simple') {
        const acecssValue = access == 'simple' 
            ? EParamsTagsType.SIMPLE 
            : EParamsTagsType.FULL

        if(field.startsWith('query:')) { // Query Tag
            const name = field.slice(6) // remove 'query:'
            this._tags[name] = ETagPlace.QUERY
            this._tagsType[name] = acecssValue
        }
        else if(field.startsWith("path:")) { // Path Param Tag
            const name = field.slice(5) // remove 'path:'
            this._tags[name] = ETagPlace.PATH
            this._tagsType[name] = acecssValue
        }
        return this
    }

    /**
     * [Configuration]
     * Redirect request to current Request if launched
     */
    public oneRequestAtTime(value: boolean = true) {
        this._oneRequestAtTime = value
        return this
    }

    /**
     * [Configuration]
     * Appends new response to current response like\
     * `response.push(...new_response)`
     * 
     * ! If enable disabled swapMethod [Nerd thing]
     */
    public appendsResponse(value: boolean = true) {
        if(isClient)
            this._variables.expandResponse = value
        return this
    }

    /**
     * [Configuration]
     * Only do Fetch if response == null
     */
    public onlyOnEmpty(enabled = true) {
        if(isClient)
            this._onNullCheck = enabled
        return this
    }

    /**
     * [Configuration]
     * Create rule on specific behaviour
     * 
     * Example:\
     * `Our url: /api/my-stuff?page=1`
     * 
     * Create rule for `page` has some value
     * 
     * ```ts
     * .createTag('query:page', 'simple') // Creating tag to checking behaviour, and get simple access
     * .rule(
     *    { 'page': '*' }, // Search by tag: Query param `page` has any value
     *    record => record 
     *      .template('my-template-pagination') // We use template for Pagination type response
     * )
     * .defaultRule(
     *    record => record 
     *      .template('') // Else disable template
     * )
     * ```
     */
    public rule(rule: ParamsTags|Function, behaviour: (setup: any) => void) {
        const check = (recordTag: any) => { // Checking condition a rule valid to record tag
            return typeof rule == 'function'
                ? rule(this.params)
                : Record.compareTags(rule, recordTag, this._lastRequestTags)
        }
        
        // Adding rule to checking stack
        this._recordRuleBehaviour.push((recordTag: ParamsTags) => {
            if(!check(recordTag))
                return false // Not valid skip
            behaviour(this) // Valid process
            return true
        })

        return this
    }

    /**
     * [Configuration]
     * Deafult rule if other rules not valid
     * 
     * Check `rule` method for example
     */
    public defaultRule(behaviour: (setup: any) => void) {
        this._defaultRule = () => behaviour(this)
        return this
    }
    
    /**
     * [Configuration]
     * Rewrite url, using in `rule` and `defaultRule` section 
     */
    private url(path: string) {
        this._url = path
        return this
    }

    /**
     * [Configuration]
     * Enable / Disable logic for `borrowAtAnother` and `borrowAtSelf` 
     */
    public enableBorrow(value: boolean) {
        this._enabledBorrow = value
        return this
    }

    /**
     * [Configuration]
     * Rollback to cached data, using in `rule` and `defaultRule` section
     * Condition example:
     *  { id: '*' } // get old response data where: id sets
     *  { id: null } // get old response data where: id not sets 
     */
    private prepare(condition: ParamsTags, behaviour: () => boolean = () => true) {
        let data = this.cached(condition)

        // Custom checking to valid, isnt -> break logic
        if(!behaviour())
            return this

        if(data != null) {
            this.setResponse(data);
            this._variables.currentPage = 1
            this._variables.isLastPage = this._variables.currentPage == this._variables.maxPages
        }
        else {
            console.warn('prepare is empty')
        }

        return this
    }

    /**
     * [Configuration]
     * [Nerds] When to delete data in response
     * 
     * `hot`    - Seamless loading
     * `lazy`   - After checking borrow algorithm, delete current data
     * `greedy` - Immediately delete current data from start fetching
     */
    public swapMethod(method: string) {
        if(method == 'hot')
            this._swapMethod = ESwapMethod.HOT
        else if(method == 'greedy')
            this._swapMethod = ESwapMethod.GREEDY
        else if(method == 'lazy')
            this._swapMethod = ESwapMethod.LAZY
        else if(method == 'pagination')
            this._swapMethod = ESwapMethod.PAGINATION
        return this
    }

    /**
     * [Configuration]
     * [Nerds] Get data from another object, instead of fetching. Otherwise do fetching
     * 
     * @param condition Check whether the conditions are suitable for the execution of the "borrow". (By tags or Functioin)
     * @param another   The object we're going to take from
     * @param as        Logic for finding what you need in an object
     */
    public borrowFrom(condition: ParamsTags | Function, another: object|Function, as: (value: DynamicResponse) => DynamicResponse) {
        if(!isClient)
            return this

        this._borrowAnother.set(condition as ParamsTags, (_: any) => {
            const object = refOrVar(another) // Get raw data

            if(!Array.isArray(object)) { // If not array skip
                console.warn('borrow, from value is not array')
                return null;
            }

            for (const part of object) { // Search, what you need
                const result = as(part)

                if(typeof result != 'undefined' && result != null) {
                    return result
                }
            }

            return null;
        })
        return this
    }

    /**
     * [Configuration]
     * [Nerds] Get data from self, by caching value, instead of fetching. Otherwise do fetching
     * 
     * @param condition Check whether the conditions are suitable for the execution of the "borrow". (By tags or Functioin)
     * @param from      Get caching data by tags. Otherwise skip "borrow"
     * @param as        Logic for finding what you need in an object
     */
    public borrowAtSelf(where: ParamsTags | Function, from: ParamsTags, as: (value: DynamicResponse) => DynamicResponse) {
        if(!isClient)
            return this
        
        this._borrow.set(where as ParamsTags, [from, (response: any) => {
            if(!Array.isArray(response)) { // If not array skip
                console.warn('{value} is not array')
                return null;
            }

            for (const part of response) {
                const result = as(part)

                if(typeof result != 'undefined' && result != null) {
                    return result
                }
            }

            return null;
        }])

        return this
    }

    /**
     * [Configuration]
     * `pattern response reader` using for customize raw response
     * Like:
     * { "items": [ ...someStuff ] }
     * we taking "items" from response, and final result fetch is
     * [ ...someStuff ]
     * 
     * More in: https://notelementimport.github.io/nuxoblivius-docs/release/template.html
     */
    public template(template: string|Function) {
        this._template = template
        return this
    }

    /**
     * [Configuration]
     * Set path-param value in Pathname `this._url` 
     */
    public pathParam(name: string, value: any) {
        // If we put promise object
        resolveOrLater(value, (result: any) => {
            if(result == null && this._interPathParams[name])
                this._pathParams[name] = this._interPathParams[name]
            else
                this._pathParams[name] = result
        })

        return this
    }

    /**
     * [Configuration]
     * Set query, for request
     * Has baked mode, a.k.a by default. This values cannot be delete by `clearDynamicQuery()`
     */
    public query(query: object, baked = false) {
        // Store as Query, not to use
        if(isRef(query)) {
            this._queryStore = query
            return this
        }

        if(baked) {
            this._staticQuery = query
        }
        else {
            if(isReactive(query)) // Reactive rewrite old (not baked) query
                this._query = query
            else
                this._query = appendMerge(this._query, query)
        }
        return this
    }

    /**
     * [Configuration]
     * `pattern response reader` protocol - other data from raw response
     * Craete default value if not setting
    */
    public defineProtocol(key: string, defaultValue: any = null) {
        this._protocol[key] = defaultValue;
        return this
    }

    /**
     * [Configuration]
     * Header of request
    */
    public header(name: string, value: any) {
        // If we put promise object
        resolveOrLater(value, (result: any) => {
            this._headers[name] = result
        })

        return this
    }

    /**
     * [Configuration]
     * Body of request
     * And enabling force mode for body
    */
    public body(body: FormData|{[key: string]: any}|null) {
        if(isSetup(body)) {
            this.preset(body as IRecordSetupObject)
            return this
        }

        // If we put promise object
        resolveOrLater(body as any, (result: any) => {
            this._body = result
            this._forceBody = result != null
        })

        return this
    }

    /**
     * [Configuration]
     * Watch Refs and call reload data after changing Refs
     */
    public reloadBy(object: any) {
        // Disable feature in Server (leak fix)
        if(!isClient)
            return this

        // Extract context
        const pThis = this
        // If we put promise object
        resolveOrLater(object, (result: any) => {
            // Vue Ref
            if(isReactive(result) || isRef(result) || result?.__v_isRef) {
                watch(result, () => {
                    const oldValueOnNullCheck = pThis._onNullCheck;
                    const oldValueExpandCheck = pThis._variables.expandResponse;
                    pThis._onNullCheck = false;
                    pThis._variables.expandResponse = false;
                    pThis.pagination.toFirst();
                    pThis._lastStep()
                        .then(() => {pThis._onNullCheck = oldValueOnNullCheck; pThis._variables.expandResponse = oldValueExpandCheck })
                })
                return
            }
            else {
                // State Manager Ref
                if(!('_module_' in result))
                    throw `reloadBy: only ref support`

                result.watch(() => {
                    const oldValueOnNullCheck = pThis._onNullCheck;
                    const oldValueExpandCheck = pThis._variables.expandResponse;
                    pThis._onNullCheck = false;
                    pThis._variables.expandResponse = false;
                    pThis.pagination.toFirst();
                    pThis._lastStep()
                        .then(() => {pThis._onNullCheck = oldValueOnNullCheck; pThis._variables.expandResponse = oldValueExpandCheck })
                })
            }
        })
        return this
    }

    /**
     * [Configuration]
     * Authorization for request
     */
    public auth(data: any) {
        // If we put promise object
        resolveOrLater(data, (result: any) => {
            this._auth = result
        })
        return this
    }

    /**
     * [Configuration]
     * Change Response type to Blob
     */
    public isBlob(value = true) {
        this._isBlob = value
        return this
    }

    /**
     * [Configuration]
     * Clearing queries, baked not touched
     */
    public clearDynamicQuery() {
        this._query = {}
        return this
    }

    /**
     * [Configuration]
     * On failure handle, can restart fetch
     */
    public onFailure(method: Function) {
        this._onError = method
        return this
    }

    /**
     * [Configuration]
     * Simple handle tracking of end fetch new data
     */
    public onFinish(method: Function) {
        this._onEnd = method
        return this
    }

    // Utils
    
    /**
     * Extends link of Method
     */
    public then(handle: Function) {
        handle()
        return this;
    }

    /**
     * Clearing Response
     */
    public clearResponse(defaultValue: boolean = true) {
        this._variables.response = defaultValue ? this._defaultValue : null
        return this
    }

    /**
     * Reset specific data
     */
    public reset(config = { pagination: true, response: true, query: true }) {
        if(config.pagination) {
            this._variables.currentPage = 1
        }

        if(config.response) {
            if(typeof config.response === "boolean")
                this._variables.response = this._defaultValue
            else if(typeof config.response === 'object')
                this._variables.response = config.response
        }

        if(config.query) {
            this.clearDynamicQuery()
        }
    }

    /**
     * Get old response by tag
     * 
     * Example
     * ```ts
     * .createTag('path:id', 'full')
     * .cached({ 'id': 2 }) // Getting response where path param id is 2
     * ```
     */
    public cached(rule: ParamsTags, defaultIsnt: any = null) {
        for(const [descriptor, value] of this._allCachedResponse.entries()) {
            if(Record.compareTags(rule, descriptor)) {
                return value
            }
        }
        return defaultIsnt;
    }

    /**
     * Delete cache by tag 
     * 
     * @deprecated not needed, while
     */
    private deleteCached(condition: ParamsTags) {
        // Not working while
        // this._allCachedResponse.clear()
    }
    
    /**
     * Not using
     * @deprecated
     */
    public frozenTick() {
        this._variables.frozenKey += 1;
        return this;
    }

    // Request

    /**
     * Start request with GET method
     * @param id setting path-param id
     */
    public async get(id: number = null) {
        this.swapGreedy()

        if(!this._forceBody)
            this._body = null

        this.pathParam('id', id)

        this._lastStep = () => this.get(id)

        return this.doFetch('get')
    }

    /**
     * Start request with POST method
     * @param body setting body (can be ignored)
     */
    public async post(body: any = null) {
        if(this._onNullCheck && this._variables.response != null) {
            return this._variables.response
        }

        this.swapGreedy()

        if(!this._forceBody)
            this._body = body

        this._lastStep = () => this.post(body)

        return this.doFetch('post')
    }

    /**
     * Start request with PUT method
     * @param body setting body (can be ignored)
     */
    public async put(body: any = null) {
        this.swapGreedy()

        if(!this._forceBody)
            this._body = body

        this._lastStep = () => this.put(body)

        return this.doFetch('put')
    }

    /**
     * Start request with DELETE method
     * @param id setting path-param id
     */
    public async delete(id: number = null) {
        this.swapGreedy()

        if(!this._forceBody)
            this._body = null

        this.pathParam('id', id)
        
        this._lastStep = () => this.delete(id)

        return this.doFetch('delete')
    }

    /**
     * Start request with PATCH method
     * @param id setting path-param id
     */
    public async patch(id: number = null) {
        this.swapGreedy()

        if(!this._forceBody)
            this._body = null

        this.pathParam('id', id)
        
        this._lastStep = () => this.patch(id)

        return this.doFetch('patch')
    }

    // Private Methods :
    
    /**
     * Getting from other object_data if suitable
     */
    private borrowingFromAnother(condition: ParamsTags): any {
        if(!this._enabledBorrow)
            return null

        /**
         * Checking condition, checking can be as Compare Tags or Function with boolean return 
        */
        const checkCondition = (condition: ParamsTags, other: Function|ParamsTags) => {
            return typeof other === 'function'
                ? other(this.params) 
                : Record.compareTags(other, condition, this._lastRequestTags)
        }

        /**
         * Borrow From (From other object) 
        */
        if(this._borrowAnother.size > 0) {
            for(const [rule, searching] of this._borrowAnother.entries()) {
                if(!checkCondition(condition, rule) || !this._enabledBorrow)
                    continue

                const result = searching(null) // Try find suitable object
                if(result)
                    return result
            }
        }

        /**
         * Borrow At Self (From cache)
        */
        if(this._borrow.size > 0) {
            for(const [rule, options] of this._borrow.entries()) {
                if(!checkCondition(condition, rule) || !this._enabledBorrow)
                    continue

                const [ cacheCondition, searching ] = options

                let cached = this.cached(cacheCondition) // Getting cached by condition

                if(!cached)
                    break; // Not found cache

                const result = searching(cached) // Try find suitable object from cache
        
                if(result)
                    return result
            }
        }

        return null
    }

    /**
     * Collect all queries into one
     */
    private compileQuery() {
        const queryObject = 
            this._queryStore != null 
                    ? storeToQuery(this._queryStore)
                    : {}

        return appendMerge(
            queryObject, 
            this._interQuery, 
            this._staticQuery, 
            this._query,
            this.compilePagination()
        )
    }

    /**
     * Creating pagination, or setup path-param
     */
    private compilePagination() {
        if(!this._paginationEnabled)
            return {}

        // Pagination in Path Param
        if(this._pagination.where == 'path') {
            this.pathParam(
                this._pagination.param,
                this._variables.currentPage
            )
            return {}
        }
        // Pagination in Query
        else if(this._pagination.where == "query") {
            return {
                [this._pagination.param]: this._variables.currentPage
            }
        }
    }

    /**
     * Try resolve condition to custom setup or use default setup
     */
    private proccesRules(condition: {[key: string]: any}) {
        if(this._recordRuleBehaviour.length == 0)
            return

        for (const rule of this._recordRuleBehaviour) {
            if(rule(condition)) // If rule loaded
                return // End method
        }

        this._defaultRule()
    }

    /**
     * Generate tag object from Path param, and Queries
     * 
     * Look `createTag()` for understand code
     */
    private recordDataTag(compiledQuery: Dict<string, unknown>) {
        const tag = {} as ParamsTags;

        // Get all registered Tags
        for(const [paramName, type] of Object.entries(this._tags)) {
            const access = this._tagsType[paramName] // Access of Tag
            const value  = 
                type == ETagPlace.PATH
                    ? refOrVar(this._pathParams[paramName]) // Getting value from Path param
                    : refOrVar(compiledQuery[paramName])    // Getting value from Query

            // Write data like { "param": null } or { "param": 1 }
            if(access == EParamsTagsType.FULL)
                tag[paramName] = value ?? null
            else
                tag[paramName] = value ? '*' : null
        }

        return tag
    }

    /**
     * Call request
     */
    private async doFetch(method: string = 'get') {
        if(this._oneRequestAtTime && this._currentRequest != null) {
            return this._currentRequest
        }
        const { request, resolve } = createRequest()
        this._currentRequest = request
        const endRequest = (value: any) => {
            this._currentRequest = null
            resolve(value)
        }

        this._variables.isLoading = true

        const pageChange = this._pagination.change
        this._pagination.change = false

        // Generate Record Tag for condition
        let recordTag = this.recordDataTag(this.compileQuery())

        // Setup request
        this.proccesRules(recordTag)

        recordTag = this.recordDataTag(this.compileQuery())
        this._lastRequestTags = recordTag;

        // Refersh query after Setup
        let queries = this.compileQuery()

        /**
         * Check behaviour `.onlyOnEmpty()` if enable 
         * If is enable to continue, Response must be empty
         * Else return old response
        */
        if(this._onNullCheck) {
            const response = this._variables.response;
            const isEmpty  = (response == null)
                || (typeof response == 'object' && Object.keys(response ?? []).length == 0)
                || (this._swapMethod == ESwapMethod.PAGINATION && pageChange)

            if(!isEmpty) {
                this._variables.isLoading = false
                endRequest(response)
                return response
            }
        }

        /**
         * If enable borrow data:
         * Borrow data from another object whenever possible
         */
        if(method == 'get' || method == "post") {
            const result = this.borrowingFromAnother(recordTag)
            if(result != null) { // If found return this data
                this.setResponse(result);
                this._variables.error = ''
                this._variables.isError = false
                this._variables.isLoading = false
                endRequest(result)
                
                // Call finsih handler
                if(this._onEnd)
                    this._onEnd(result)

                return result
            }
        }

        /**
         * [Nerd] Erase data if necessary
         */
        this.swapLazy()

        // Compile final URL
        const url = 
            urlPathParams(this._url, this._pathParams) // Base path + path params
            + queryToUrl(queries) // Search param

        // Add Default Headers and Record Headers
        const headers = {} as Dict<string, string>;
        for (const [key, value] of Object.entries(defaultHeaders)) // Default Headers
            headers[key] = refOrVar(value);
        for (const [key, value] of Object.entries(this._headers)) // Record Headers
            headers[key] = refOrVar(value);

        // Generate Options for `fetch()`
        const options:RequestInit = {
            // Append headers + auth
            headers: appendMerge(headers, {'Authorization': refOrVar(this._auth)}),
            method: method.toUpperCase(),
        }

        // If use body connect to options
        if(this._body != null) {
            // Getting body
            options.body = refOrVar(this._body);
            
            // Form Data:
            if (options.body instanceof FormData)
                delete headers['Content-Type']
            // Json:
            // Convert object to string
            else if (typeof options.body == 'object')
                options.body = JSON.stringify(this._body);
        }

        // Request data from http > config
        let fetchResult = await storeFetch(
                url, 
                options,
                this._isBlob,
                this._template as any
            )

        /**
         * If request had error, call onError handler
        */
        if(fetchResult.error) {
            const answer = await (this._onError || defaultFetchFailure)({text: fetchResult.errorText, code: fetchResult.code}, () => this.doFetch(method));

            // If answer had object data replace
            if(typeof answer == 'object') {
                fetchResult.data = answer
                fetchResult.error = false
            }
        }

        // Write response to Record Object
        this.setResponse(fetchResult.data);

        // Set Meta
        this._variables.error = fetchResult.errorText
        this._variables.maxPages = fetchResult.pageCount
        this._variables.isError = fetchResult.error
        this._variables.isLoading = false
        this._variables.headers = fetchResult.header

        if(fetchResult.protocol != null) {
            this._protocol = fetchResult.protocol
        }

        // Cache data
        this.keep(fetchResult.data as any, recordTag)

        // Call finsih handler
        if(this._onEnd)
            this._onEnd(fetchResult.data)

        endRequest(fetchResult.data)
        return fetchResult.data
    }

    /** Erase response after call doFetch */
    private swapGreedy() {
        // Disable on appendResponse
        if(this._swapMethod == ESwapMethod.GREEDY && !this._variables.expandResponse) {
            this._variables.response = this._defaultValue
        }
    }

    /** Erase response after borrow function */
    private swapLazy() {
        // Disable on appendResponse
        if(this._swapMethod == ESwapMethod.LAZY && !this._variables.expandResponse) {
            this._variables.response = this._defaultValue
        }
    }
    
    /**
     * Compare tags see `createTag`
     */
    private static compareTags(tags: ParamsTags, other: ParamsTags, otherLast?: ParamsTags) {
        for (const [name] of Object.entries(tags)) {
            const value = refOrVar(tags[name])

            if(!(name in other)) 
                return false // Not includes in other. Not valid
            
            if(otherLast && name in otherLast) {
                if(value == '<>' && otherLast[name] != other[name])
                    continue;
            }

            const otherValue = other[name] ?? null

            if(value == otherValue) // If equal each others
                continue

            // If one use `any` and other not use `null`
            // Like: { tag: '*' } + { tag: null } = false
            // Like: { tag: '*' } + { tag: 1 }    = true
            if((value == '*' && otherValue != null) || (otherValue == '*' && value != null))
                continue

            // Else not valid
            return false
        }
        return true
    }

    // Write response to Record
    private setResponse(v: any) {
        // Appends Mode
        if(this._variables.expandResponse) {
            if(!this._variables.response) // Not Exist create
                this._variables.response = [];

            this._variables.response.push(...v);
        }
        // Rewrite Mode
        else {
            this._variables.response = v;
        }

        return this._variables.response;
    }

    // Cache response by Tags
    private async keep(response: DynamicResponse, recordTag: ParamsTags) {
        for (const [key] of this._allCachedResponse.entries()) {
            if(Record.compareTags(key, recordTag)) {
                this._allCachedResponse.set(key, response)
                return
            }
        }

        this._allCachedResponse.set(
            recordTag, // Generate tag
            response
        )
    }
}