import { appendMerge, isRef, queryToUrl, refOrVar, resolveOrLater, storeToQuery, urlPathParams } from "./Utils.js"
import { options as ConfigOptions, storeFetch } from "./config.js"
import { reactive, watch } from "vue"

type DynamicResponse = {[key: string]: any}
type FunctionParseData = (value: DynamicResponse) => null|DynamicResponse
type Description = {[name: string]: any}

interface IRuleMethod {
    as: FunctionParseData
    where: 'before'|'after'
}

interface IRule {
    [key: string]: IRuleMethod
}

export default class Record {
    private _url: string = ''
    private _queryStore: object = null
    private _query: {[key: string]: any} = {}
    private _staticQuery: {[key: string]: any} = {}
    private _pathParams: {[key: string]: any} = {}
    private _headers: {[key: string]: any} = {}
    private _body: {[key: string]: any}|FormData = null
    private _auth: string|null = null
    private _swapMethod: number = 0
    private _onNullCheck: boolean = false

    private _rules: Function[] = []
    private _defaultRule: Function = () => null as any

    private _forceBody: boolean = false
    private _awaitBlob: boolean = false

    private _template: string|Function = ''

    private _lastStep = {
        method: '',
        arg: null as any
    }

    private _protocol: any = {}

    private _proxies: any = {}

    private _keepBy: any = {'id': 'path'}
    private _keepByMethod: any = {'id': 0}
    private _borrow: Map<Description, [Description, (response: any) => any]> = new Map()
    private _borrowAnother: Map<Description, (response: any) => any> = new Map()
    private _keepingContainer: Map<Description, any> = new Map()
    private _enabledBorrow = true

    private _onError:   Function|null = null;
    private _onEnd:     Function|null = null;

    private _paginationEnabled: boolean = false
    private _pagination = {
        where: 'path',
        param: 'page'
    }
    private _variables = reactive({
        currentPage: 1,
        maxPages: 1,
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
            set enabled(v: boolean) {
                pThis._paginationEnabled = v
            },
            next() {
                if(pThis._variables.maxPages > pThis._variables.currentPage) {
                    pThis._variables.currentPage += 1
                    pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage
                }

                return pThis
            },
            prev() {
                if(pThis._variables.currentPage > 0) {
                    pThis._variables.currentPage -= 1
                    pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage
                }

                return pThis
            },
            get isLastPage() {
                return pThis._variables.isLastPage
            },
            set current(v: number) {
                pThis._variables.currentPage = v
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
        return this._proxies.protocol
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

    public static new(url: string) {
        const instance = new Record();
        instance._url = url

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

    public static Bearer(token: string) {
        return `Bearer ${token}`
    }

    public static Basic(login: string, password: string) {
        return `Basic ${ btoa(login+":"+password) }`
    }

    public keepBy(field: string, method: 'simple'|'full' = 'simple') {
        method =  method == 'simple' ? 0 : 1 as any
        if(field.startsWith('query:')) {
            const name = field.slice(6)
            this._keepBy[name] = 'query'
            this._keepByMethod[name] = method
        }
        else if(field.startsWith("path:")) {
            const name = field.slice(5)
            this._keepBy[name] = 'path'
            this._keepByMethod[name] = method
        }
        return this
    }

    public onlyOnEmpty(enabled = true) {
        this._onNullCheck = enabled
        return this
    }

    public clearResponse() {
        this._variables.response = null
        this._frozenResponse = null
        return this
    }

    private static ruleAndDescriptorEqual(rule: Description, descriptor: Description) {
        let isEqual = true;
        for (const [name, value] of Object.entries(rule)) {
            if(!(name in descriptor)) {
                isEqual = false;
                break
            }
            else if(value != descriptor[name] && value != '*') {
                isEqual = false
                break
            }
            else if(value == '*' && descriptor[name] == null) {
                isEqual = false
                break
            }
        }
        return isEqual
    }

    public rule(rule: Description|Function, behaviour: (setup: any) => void) {
        const check = (descriptor: any) => {
            if(typeof rule == 'function') {
                return rule(this.params)
            }
            return Record.ruleAndDescriptorEqual(rule, descriptor)
        }
        
        this._rules.push((descriptor: Description) => {
            if(!check(descriptor)) {
                return false
            }
            behaviour(this)
            return true
        })
        return this
    }

    public defaultRule(behaviour: (setup: any) => void) {
        this._defaultRule = () => behaviour(this)
        return this
    }

    public cached(rule: Description, defaultIsnt: any = null) {
        for(const [descriptor, value] of this._keepingContainer.entries()) {
            if(Record.ruleAndDescriptorEqual(rule, descriptor)) {
                return value
            }
        }
        return defaultIsnt;
    }

    private deleteCached(rule: Description) {
        for(const [descriptor, value] of this._keepingContainer.entries()) {
            if(Record.ruleAndDescriptorEqual(rule, descriptor)) {
                this._keepingContainer.delete(descriptor)
            }
        }
    }
    
    private url(path: string) {
        this._url = path
        return this
    }

    private enableBorrow(value: boolean) {
        this._enabledBorrow = value
        return this
    }

    private prepare(rule: Description, behaviour: () => boolean = () => true) {
        let data = this.cached(rule)

        if(!behaviour())
            return this

        if(data != null) {
            this.setResponse(data);
            this._variables.currentPage = 1
        }
        else {
            console.warn('prepare is empty')
        }
        return this
    }

    public frozenTick() {
        this._variables.frozenKey += 1;
        return this;
    }

    public swapMethod(method: string) {
        if(method == 'hot') {
            this._swapMethod = 0
        }
        else if(method == 'greedy') {
            this._swapMethod = 1
        }
        else if(method == 'lazy') {
            this._swapMethod = 2
        }
        return this
    }

    public borrowAtAnother(logic: Description | Function, another: object|Function, as: (value: DynamicResponse) => DynamicResponse) {
        this._borrowAnother.set(logic, (response: any) => {
            const object = refOrVar(another)

            if(!Array.isArray(object)) {
                console.warn('{value} is not array')
                return null;
            }

            for (const part of object) {
                const result = as(part)

                if(typeof result != 'undefined' && result != null) {
                    return result
                }
            }

            return null;
        })
        return this
    }

    public borrowAtSelf(where: Description | Function, from: Description, as: (value: DynamicResponse) => DynamicResponse) {
        this._borrow.set(where, [from, (response: any) => {
            if(!Array.isArray(response)) {
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

    public template(template: string|Function) {
        this._template = template
        return this
    }

    public pathParam(name: string, value: any) {
        resolveOrLater(value, (result: any) => {
            this._pathParams[name] = result
        })

        return this
    }

    public query(query: object, locked = false) {
        if(isRef(query)) {
            this._queryStore = query
            return this
        }

        if(locked) {
            this._staticQuery = appendMerge(this._staticQuery, query)
        }
        else {
            this._query = appendMerge(this._query, query)
        }
        return this
    }

    public defineProtocol(key: string, defaultValue: any = null) {
        this._protocol[key] = defaultValue;
        return this
    }

    public header(name: string, value: any) {
        resolveOrLater(value, (result: any) => {
            this._headers[name] = result
        })

        return this
    }

    public body(body: FormData|{[key: string]: any}|null) {
        resolveOrLater(body as any, (result: any) => {
            this._body = result
            this._forceBody = result != null
        })

        return this
    }

    public reloadBy(object: any) {
        const pThis = this
        resolveOrLater(object, (result: any) => {
            if(typeof result != 'object') 
                throw `reloadBy: only ref support`

            const objectClassName = Object.getPrototypeOf(result).constructor.name || 'none'

            if(objectClassName == 'RefImpl') {
                watch(result, () => {
                    pThis.clearResponse();
                    pThis.frozenTick()
                    pThis.deleteCached(
                        pThis.proccesDescriptor(
                            this.compileQuery()
                        )
                    );
                    (pThis as any)[pThis._lastStep.method](pThis._lastStep.arg)
                        .then((_: any) => pThis.frozenTick())
                })
            }
            else {
                if(!('_module_' in result))
                    throw `reloadBy: only ref support`

                result.watch(() => {
                    pThis.clearResponse();
                    pThis.frozenTick()
                    pThis.deleteCached(
                        pThis.proccesDescriptor(
                            this.compileQuery()
                        )
                    );
                    (pThis as any)[pThis._lastStep.method](pThis._lastStep.arg)
                        .then((_: any) => pThis.frozenTick())
                })
            }
        })
        return this
    }

    public auth(data: any) {
        resolveOrLater(data, (result: any) => {
            this._auth = result
        })
        return this
    }

    public isBlob(value = true) {
        this._awaitBlob = value
        return this
    }

    public clearDynamicQuery() {
        this._query = {}
        return this
    }

    public onFailure(method: Function) {
        this._onError = method
        return this
    }

    public onFinish(method: Function) {
        this._onError = method
        return this
    }

    public async get(id: number = null) {
        this.swapGreedy()

        if(!this._forceBody)
            this._body = null

        this.pathParam('id', id)

        this._lastStep.method = 'get'
        this._lastStep.arg = id

        return this.doFetch('GET')
    }

    public async post(body: any = null) {
        if(this._onNullCheck && this._variables.response != null) {
            return this._variables.response
        }

        this.swapGreedy()

        if(!this._forceBody)
            this._body = body

        this._lastStep.method = 'post'
        this._lastStep.arg = body

        return this.doFetch('POST')
    }

    public async put(body: any = null) {
        this.swapGreedy()

        if(!this._forceBody)
            this._body = body

        this._lastStep.method = 'put'
        this._lastStep.arg = body

        return this.doFetch('PUT')
    }

    public async delete(id: number = null) {
        this.swapGreedy()

        if(!this._forceBody)
            this._body = null

        this.pathParam('id', id)
        
        this._lastStep.method = 'delete'
        this._lastStep.arg = id

        return this.doFetch('DELETE')
    }

    private borrowingFromAnother(descriptor: {[key: string]: any}, query: any): any {
        if(!this._enabledBorrow)
            return null

        const resolveRule = (rule, descriptor) => {
            if(typeof rule == 'function') {
                return rule(this.params)
            }
            return Record.ruleAndDescriptorEqual(rule, descriptor)
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
        if(this._rules.length == 0) {
            return
        }

        let proccesed = false
        for (const rule of this._rules) {
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
                ? (query[key] || null) 
                : (this._pathParams[key] || null)

        for (const [key, value] of Object.entries(this._keepBy)) {
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
                this._awaitBlob,
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
        if(this._swapMethod == 1) {
            this.clearResponse()
        }
    }

    private swapLazy() {
        if(this._swapMethod == 2) {
            this.clearResponse()
        }
    }

    private setResponse(v: any) {
        this._variables.response = v;
        if(Array.isArray(v)) {
            this._frozenResponse = [...v];
        }
        else {
            this._frozenResponse = {...v};
        }
        return this._variables.response;
    }

    private keep(response: DynamicResponse, query: any) {
        const dataDescription = {} as any

        const getFrom = (where: string, key: string) =>
            where == 'query' 
                ? (query[key] || null) 
                : (this._pathParams[key] || null)

        for (const [key, value] of Object.entries(this._keepBy)) {
            const mode = this._keepByMethod[key]
            const data = getFrom(value as string, key)

            dataDescription[key] = data != null 
                ? (mode == 0 ? `*` : data)
                : null
        }

        this._keepingContainer.set(dataDescription, response)
    }
}