import { appendMerge, isRef, queryToUrl, refOrVar, resolveOrLater, storeToQuery, urlPathParams } from "./Utils.js"
import { options as ConfigOptions, storeFetch } from "./Config.js"
import { reactive } from "vue"

type DynamicResponse = {[key: string]: any}
type FunctionParseData = (value: DynamicResponse) => null|DynamicResponse
type BorrowLogic = {[key: string]: (data: any) => any|undefined}

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

    private _forceBody: boolean = false
    private _awaitBlob: boolean = false

    private _keepBy: any = {'id': 'path'}
    private _keepingContainer = {} as any

    private _template: string|Function = ''

    private _lastStep = {
        method: '',
        arg: null as any
    }

    private _borrow: BorrowLogic = {}

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
        error: '',

        isError: false,
        isLoading: false
    })

    public get response() {
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
            }
        }
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
        return instance
    }

    public static Bearer(token: string) {
        return `Bearer ${token}`
    }

    public static Basic(login: string, password: string) {
        return `Basic ${ btoa(login+":"+password) }`
    }

    public keepBy(...fields: string[]) {
        for (const field of fields) {
            if(field.startsWith('query:')) {
                this._keepBy[field.slice(6)] = 'query'
            }
            else if(field.startsWith("path:")) {
                this._keepBy[field.slice(5)] = 'path'
            }
        }
        return this
    }

    public onlyOnEmpty() {
        this._onNullCheck = true
        return this
    }

    public clearResponse() {
        this._variables.response = null
        return this
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

    public borrowAtAnother(another: object, as: (value: DynamicResponse) => DynamicResponse) {

    }

    public borrowAtSelf(where: string, as: (value: DynamicResponse) => DynamicResponse) {
        const response = () => {
            
        }
        

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
        resolveOrLater(object, (result: any) => {
            if(typeof result != 'object' || !('_module_' in result)) 
                throw `reloadBy: only ref support`

            result.watch(() => {
                (this as any)[this._lastStep.method](this._lastStep.arg)
            })
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
        this._awaitBlob = true
        return this
    }

    public clearDynamicQuery() {
        this._query = {}
        return this
    }

    public async get(id: number = null) {
        if(this._onNullCheck && this._variables.response != null) {
            return this._variables.response
        }

        this.swapGreedy()

        if(!this._forceBody)
            this._body = null

        this.pathParam('id', id)

        this._lastStep.method = 'get'
        this._lastStep.arg = id

        this.swapLazy()
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

        this.swapLazy()
        return this.doFetch('POST')
    }

    public async put(body: any = null) {
        if(this._onNullCheck && this._variables.response != null) {
            return this._variables.response
        }

        this.swapGreedy()

        if(!this._forceBody)
            this._body = body

        this._lastStep.method = 'put'
        this._lastStep.arg = body

        this.swapLazy()
        return this.doFetch('PUT')
    }

    public async delete(id: number = null) {
        if(this._onNullCheck && this._variables.response != null) {
            return this._variables.response
        }

        this.swapGreedy()

        if(!this._forceBody)
            this._body = null

        this.pathParam('id', id)
        
        this._lastStep.method = 'delete'
        this._lastStep.arg = id

        this.swapLazy()
        return this.doFetch('DELETE')
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

    private async doFetch(method: string = 'GET') {
        this._variables.isLoading = true
        const queryObject = 
            this._queryStore != null 
                ? storeToQuery(this._queryStore)
                : {}

        const pagination = this.compilePagination()

        const queries = appendMerge(
            queryObject, 
            this._staticQuery, 
            this._query,
            pagination
        )

        const url = 
            urlPathParams(this._url, this._pathParams)
            + queryToUrl(queries)

        const options:RequestInit = {
            headers: appendMerge(this._headers, {'Authorization': refOrVar(this._auth)}),
            method,
        }

        if(this._body != null) {
            options['body'] = refOrVar(this._body) as any

            if(!(options['body'] instanceof FormData) && typeof options['body'] == 'object') {
                options['body'] = JSON.stringify(this._body)
            }
        }

        const fetchResult = await storeFetch(
                url, 
                options,
                this._awaitBlob,
                this._template as any
            )

        this._variables.response = fetchResult.data
        this._variables.error = fetchResult.errorText
        this._variables.maxPages = fetchResult.pageCount
        this._variables.isError = fetchResult.error
        this._variables.isLoading = false

        this.keep(fetchResult.data, queries)

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

    private keep(response: DynamicResponse, query: any) {
        const getFrom = (where: string, key: string) =>
            where == 'query' 
                ? (query[key] || null) 
                : (this._pathParams[key] || null)

        const keyForKeeping = Object.entries(this._keepBy)
            .map(([key, where]) =>
                getFrom(where as string, key) != null 
                    ? `${key}:sets`
                    : `${key}:null` 
            )
            .join(';')

        this._keepingContainer[keyForKeeping] = response
    }
}