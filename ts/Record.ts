import { appendMerge, isRef, queryToUrl, refOrVar, resolveOrLater, storeToQuery, urlPathParams } from "./Utils.js"
import { options as ConfigOptions } from "./Config.js"
import { reactive } from "vue"

export default class Record {
    private _url: string = ''
    private _queryStore: object = null
    private _query: {[key: string]: any} = {}
    private _staticQuery: {[key: string]: any} = {}
    private _pathParams: {[key: string]: any} = {}
    private _headers: {[key: string]: any} = {}
    private _body: {[key: string]: any}|FormData = null
    private _forceBody: boolean = false
    private _awaitBlob: boolean = false
    private _auth: string|null = null
    private _lastStep = {
        method: '',
        arg: null as any
    }
    private _variables = reactive({
        response: null
    })

    public get response() {
        return this._variables.response
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
        if(!this._forceBody)
            this._body = null

        this.pathParam('id', id)

        this._lastStep.method = 'get'
        this._lastStep.arg = id

        const item = await this.doFetch('GET')

        this._variables.response = item
    }

    public async post(body: any = null) {
        this._body = body

        this._lastStep.method = 'post'
        this._lastStep.arg = body

        const item = await this.doFetch('POST')

        this._variables.response = item
    }

    public async put(body: any = null) {
        this._body = body

        this._lastStep.method = 'put'
        this._lastStep.arg = body

        const item = await this.doFetch('PUT')

        this._variables.response = item
    }

    public async delete(id: number = null) {
        if(!this._forceBody)
            this._body = null

        this.pathParam('id', id)
        
        this._lastStep.method = 'delete'
        this._lastStep.arg = id

        const item = await this.doFetch('DELETE')

        this._variables.response = item
    }

    private async doFetch(method: string = 'GET') {
        const queryObject = storeToQuery(this._queryStore)

        const url = 
            urlPathParams(this._url, this._pathParams)
            + queryToUrl(appendMerge(queryObject, this._staticQuery, this._query))

        const options:RequestInit = {
            headers: appendMerge(this._headers, {'Authorization': refOrVar(this._auth)}),
            method,
        }

        if(this._body != null) {
            options['body'] = refOrVar(this._body) as any
        }

        return await ConfigOptions.http(
                ConfigOptions.isServer ? ConfigOptions.apiRoot + url : url, 
                options,
                this._awaitBlob
            )
    }
}