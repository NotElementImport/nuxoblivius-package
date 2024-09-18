import { appendMerge, isRef, queryToUrl, refOrVar, resolveOrLater, storeToQuery, urlPathParams } from "./Utils.js"
import { options as ConfigOptions, defaultHeaders, storeFetch } from "./config.js"
import { isReactive, reactive, watch } from "vue"

type DynamicResponse = {[key: string]: any}
type FunctionParseData = (value: DynamicResponse) => null|DynamicResponse

type ParamsTags = {[key: string]: string|number|null|'*' }
type ParamsTagsType = {[key: string]: EParamsTagsType }

enum EParamsTagsType {
    SIMPLE = 0,
    FULL   = 1
}

interface IRuleMethod {
    as: FunctionParseData
    where: 'before'|'after'
}

interface IRule {
    [key: string]: IRuleMethod
}

/**
 * Checking for disabling some stuff on server
 */
const isClient = typeof document !== 'undefined'

export default class Record {

    // Fetch settings

    /** Pathname for fetching  */
    private _url: string = ''
    /** @deprecated Other Stores as Query object */
    private _queryStore: object = null
    /** Query for fetching */
    private _query: {[key: string]: any} = {}
    /** Baked Query for fetching [cannot be removed] */
    private _staticQuery: {[key: string]: any} = {}
    /** Path params for query */
    private _pathParams: {[key: string]: any} = {}
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

    private _tags: ParamsTags         = {'id': 'path'}
    private _tagsType: ParamsTagsType = {'id': EParamsTagsType.SIMPLE }

    // Pre Fetch config

    /** Receive data only when the response is empty */
    private _onNullCheck: boolean = false
    /** [For nerds] When to delete data in response  */
    private _swapMethod: number = 0

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
    private _lastStep: Function = () => {}

    private _proxies: any = {}

    private _borrow: Map<Description, [Description, (response: any) => any]> = new Map()
    private _borrowAnother: Map<Description, (response: any) => any> = new Map()
    
    private _keepingContainer: Map<Description, any> = new Map()
    private _enabledBorrow = true

    private _paginationEnabled: boolean = false
    private _pagination = {
        where: 'path',
        param: 'page'
    }
    private _variables = reactive({
        currentPage: 1,
        maxPages: 1,
        autoReloadPagination: false,
        expandResponse: false,
        isLastPage: false,
        
        response: null,
        headers: {},
        error: '',

        frozenKey: 0,

        isError: false,
        isLoading: false
    })
    private _frozenResponse: any = null;

    public get frozenResponse() {
        return this._frozenResponse;
    }

    public get frozenKey() {
        return this._variables.frozenKey;
    }

    public get response() {
        return this._variables.response
    }

    public set response(value: any) {
        this._variables.response = value
    }

    public get headers() {
        return this._variables.headers
    }

    public get one() {
        return this._variables.response
    }

    public get many() {
        return this._variables.response
    }

    public get pagination() {
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
                return pThis
            },
            autoReload() {
                pThis._variables.autoReloadPagination = true
                return pThis
            },
            set enabled(v: boolean) {
                pThis._paginationEnabled = v
            },
            toFirst() {
                pThis._variables.currentPage = 1
                pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage
                if(pThis._variables.autoReloadPagination)
                    pThis._lastStep()
                return pThis
            },
            toLast() {
                pThis._variables.currentPage = pThis._variables.maxPages;
                pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage
                if(pThis._variables.autoReloadPagination)
                    pThis._lastStep()
                return pThis
            },
            next() {
                if(pThis._variables.maxPages > pThis._variables.currentPage) {
                    pThis._variables.currentPage += 1
                    pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage

                    if(pThis._variables.autoReloadPagination)
                        pThis._lastStep()
                }

                return pThis
            },
            prev() {
                if(pThis._variables.currentPage > 0) {
                    pThis._variables.currentPage -= 1
                    pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage
                }

                if(pThis._variables.autoReloadPagination)
                    pThis._lastStep()

                return pThis
            },
            get isLastPage() {
                return pThis._variables.isLastPage
            },
            set current(v: number) {
                pThis._variables.currentPage = v

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
    
    public get params() {
        const pthis = this
        return {
            get path() {
                return pthis._proxies.path
            },
            get query() {
                return pthis._proxies.query
            }
        }
    }

    public get protocol() {
        return this._protocol
    }

    public get loading() {
        return this._variables.isLoading
    }

    public get error() {
        return this._variables.isError
    }

    public get errorText() {
        return this._variables.error
    }

    public static new(url: string, defaultValue?: any) {
        const instance = new Record();
        instance._url = url
        instance._variables.response = defaultValue ?? null;

        instance._proxies.query = new Proxy({}, {
            get(t, p, r) {
                if(p in instance._staticQuery)
                    return instance._staticQuery[p as any]
                else if(p in instance._query)
                    return instance._query[p as any]
                return undefined
            }
        })

        instance._proxies.path = new Proxy({}, {
            get(t, p, r) {
                return instance._pathParams[p as any] 
            }
        })

        instance._proxies.protocol = new Proxy({}, {
            get(t, p, r) {
                return instance._protocol[p as any] 
            }
        })

        return instance
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
            this._tags[name] = 'query'
            this._tagsType[name] = acecssValue
        }
        else if(field.startsWith("path:")) { // Path Param Tag
            const name = field.slice(5) // remove 'path:'
            this._tags[name] = 'path'
            this._tagsType[name] = acecssValue
        }
        return this
    }

    /**
     * Appends new response to current response like\
     * `response.push(...new_response)`
     * 
     * ! If enable disabled swapMethod [Nerd thing]
     */
    public appendsResponse(value: boolean = true) {
        this._variables.expandResponse = value
        return this
    }

    /**
     * Only do Fetch if response == null
     */
    public onlyOnEmpty(enabled = true) {
        this._onNullCheck = enabled
        return this
    }

    /**
     * Clearing Response
     */
    public clearResponse() {
        this._variables.response = null
        this._frozenResponse = null
        return this
    }

    /**
     * Compare tags see `createTag`
     */
    private static compareTags(tags: ParamsTags, other: ParamsTags) {
        for (const [name, value] of Object.entries(tags)) {
            if(!(name in other)) 
                return false // Not includes in other. Not valid

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

    /**
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
        const check = (descriptor: any) => {
            if(typeof rule == 'function') {
                return rule(this.params)
            }
            return Record.compareTags(rule, descriptor)
        }
        
        this._recordRuleBehaviour.push((descriptor: ParamsTags) => {
            if(!check(descriptor)) {
                return false
            }
            behaviour(this)
            return true
        })

        return this
    }

    /**
     * Deafult rule if other rules not valid
     * 
     * Check `rule` method for example
     */
    public defaultRule(behaviour: (setup: any) => void) {
        this._defaultRule = () => behaviour(this)
        return this
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
        for(const [descriptor, value] of this._keepingContainer.entries()) {
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
    private deleteCached(rule: ParamsTags) {
        this._keepingContainer.clear()
    }
    
    /**
     * Rewrite url, using in `rule` and `defaultRule` section 
     */
    private url(path: string) {
        this._url = path
        return this
    }

    /**
     * Enable / Disable logic for `borrowAtAnother` and `borrowAtSelf` 
     */
    public enableBorrow(value: boolean) {
        this._enabledBorrow = value
        return this
    }

    /**
     * Rollback to cached data, using in `rule` and `defaultRule` section 
     */
    private prepare(rule: ParamsTags, behaviour: () => boolean = () => true) {
        let data = this.cached(rule)

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
     * Not using
     * @deprecated
     */
    public frozenTick() {
        this._variables.frozenKey += 1;
        return this;
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
            this._swapMethod = 0
        else if(method == 'greedy')
            this._swapMethod = 1
        else if(method == 'lazy')
            this._swapMethod = 2
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
        this._borrowAnother.set(condition, (_: any) => {
            const object = refOrVar(another) // Get raw data

            if(!Array.isArray(object)) { // If not array skip
                console.warn('{value} is not array')
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
        this._borrow.set(where, [from, (response: any) => {
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
            this._pathParams[name] = result
        })

        return this
    }

    /**
     * [Configuration]
     * Set query, for request
     * Has baked mode, a.k.a by default, this values cannot be delete by `clearDynamicQuery()`
     */
    public query(query: object, baked = false) {
        if(isRef(query)) {
            this._queryStore = query
            return this
        }

        if(baked) {
            this._staticQuery = query
        }
        else {
            if(isReactive(query))
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
                    pThis._lastStep()
                })
                return
            }
            else {
                // State Manager Ref
                if(!('_module_' in result))
                    throw `reloadBy: only ref support`

                result.watch(() => {
                    pThis._lastStep()
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

        return this.doFetch('GET')
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

        return this.doFetch('POST')
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

        return this.doFetch('PUT')
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

        return this.doFetch('DELETE')
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

        return this.doFetch('PATCH')
    }

    // Inner Methods :
    
    private borrowingFromAnother(descriptor: {[key: string]: any}, query: any): any {
        if(!this._enabledBorrow)
            return null

        const resolveRule = (rule, descriptor) => {
            if(typeof rule == 'function') {
                return rule(this.params)
            }
            return Record.compareTags(rule, descriptor)
        }

        if(this._borrowAnother.size > 0) {
            for(const [rule, checking] of this._borrowAnother.entries()) {
                if(!resolveRule(rule, descriptor)) {
                    continue
                }
            
                const result = checking(null)
    
                if(result != null) {
                    return result
                }
            }
        }

        if(this._borrow.size > 0) {
            for(const [rule, checking] of this._borrow.entries()) {
                if(!resolveRule(rule, descriptor)) {
                    continue
                }

                let cached = this.cached(checking[0])

                if(cached != null) {
                    const result = checking[1](cached)
        
                    if(result != null) {
                        return result
                    }
                }
                else {
                    break
                }
            }
        }

        return null
    }

    private compileQuery() {
        const queryObject = 
        this._queryStore != null 
                ? storeToQuery(this._queryStore)
                : {}

        const pagination = this.compilePagination()

        return appendMerge(
            queryObject, 
            this._staticQuery, 
            this._query,
            pagination
        )
    }

    private compilePagination() {
        if(this._paginationEnabled) {
            if(this._pagination.where == 'path') {
                this.pathParam(
                    this._pagination.param, 
                    this._variables.currentPage
                )
            }
            else if(this._pagination.where == "query") {
                const query = {} as any
                query[this._pagination.param] = this._variables.currentPage
                return query
            }
        }

        return {}
    }

    private proccesRules(descriptor: {[key: string]: any}) {
        if(this._recordRuleBehaviour.length == 0) {
            return
        }

        let proccesed = false
        for (const rule of this._recordRuleBehaviour) {
            let result = rule(descriptor)

            if(result) {
                proccesed = true
                break
            }
        }

        if(!proccesed)
            this._defaultRule()
    }

    private proccesDescriptor(query: {[key: string]: any}) {
        const descriptor = {} as any

        const getFrom = (where: string, key: string) =>
            where == 'query'
                ? (query[key] || null)  // Query
                : (this._pathParams[key] || null) // Path

        for (const [key, value] of Object.entries(this._tags)) {
            descriptor[key] = getFrom(value as string, key) != null 
                ? `*`
                : null
        }

        return descriptor
    }

    private async doFetch(method: string = 'GET') {
        this._variables.isLoading = true

        method = method.toLocaleLowerCase()

        const descriptor = this.proccesDescriptor(this.compileQuery())

        this.proccesRules(descriptor)

        let queries = this.compileQuery()

        if(this._onNullCheck && this._variables.response != null) {
            this._variables.isLoading = false
            return this._variables.response
        }

        if(method == 'get' || method == "post") {
            const result = this.borrowingFromAnother(descriptor, queries)
            if(result != null) {
                this.setResponse(result);
                this._variables.error = ''
                this._variables.maxPages = 1
                this._variables.isError = false
                this._variables.isLoading = false
                return result
            }
        }

        this.swapLazy()

        const url = 
            urlPathParams(this._url, this._pathParams)
            + queryToUrl(queries)

        const rebuildHeader = {} as any;
        for (const [key, value] of Object.entries(defaultHeaders)) {
            rebuildHeader[key] = refOrVar(value);
        } 
        for (const [key, value] of Object.entries(this._headers)) {
            rebuildHeader[key] = refOrVar(value);
        } 

        const options:RequestInit = {
            headers: appendMerge(rebuildHeader, {'Authorization': refOrVar(this._auth)}),
            method,
        }

        if(this._body != null) {
            options['body'] = refOrVar(this._body) as any

            if(!(options['body'] instanceof FormData) && typeof options['body'] == 'object') {
                options['body'] = JSON.stringify(this._body)
            }
        }

        let fetchResult = await storeFetch(
                url, 
                options,
                this._isBlob,
                this._template as any
            )

        if(fetchResult.error && this._onError != null) {
            const answer = await this._onError({text: fetchResult.errorText, code: fetchResult.code}, () => this.doFetch(method));

            if(typeof answer == 'object') {
                fetchResult.data = answer
                fetchResult.error = false
            }
        }

        this.setResponse(fetchResult.data);

        this._variables.error = fetchResult.errorText
        this._variables.maxPages = fetchResult.pageCount
        this._variables.isError = fetchResult.error
        this._variables.isLoading = false
        this._variables.headers = fetchResult.header

        if(fetchResult.protocol != null) {
            this._protocol = fetchResult.protocol
        }

        this.keep(fetchResult.data as any, queries)

        if(this._onEnd)
            this._onEnd(fetchResult.data)

        return fetchResult.data
    }

    private swapGreedy() {
        if(this._swapMethod == 1 && !this._variables.expandResponse) {
            this.clearResponse()
        }
    }

    private swapLazy() {
        if(this._swapMethod == 2 && !this._variables.expandResponse) {
            this.clearResponse()
        }
    }

    private setResponse(v: any) {
        if(this._variables.expandResponse) {
            if(!this._variables.response)
                this._variables.response = [];

            this._variables.response.push(...v);
        }
        else {
            this._variables.response = v;
            if(Array.isArray(v)) {
                this._frozenResponse = [...v];
            }
            else {
                this._frozenResponse = {...v};
            }
        }
        return this._variables.response;
    }

    private keep(response: DynamicResponse, query: any) {
        const dataDescription = {} as any

        const getFrom = (where: string, key: string) =>
            where == 'query' 
                ? (query[key] || null) 
                : (this._pathParams[key] || null)

        for (const [key, value] of Object.entries(this._tags)) {
            const mode = this._tagsType[key]
            const data = getFrom(value as string, key)

            dataDescription[key] = data != null 
                ? (mode == 0 ? `*` : data)
                : null
        }

        this._keepingContainer.set(dataDescription, response)
    }
}