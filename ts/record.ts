import type { Nullable, PathParams, RawHeader, RequestMethod, SearchParams, WithMutatble, TemplateInit } from "../types.js"

class ObliviusRequest<T> {
    private _accept: (value: T) => void
    private _reject: (reason: any) => void
    private _promise: Promise<T>

    private _afterRequest: Function[] = []
    private _endRequest?: Function

    constructor() {
        this._promise = new Promise((res, rej) => {
            this._accept = res
            this._reject = res
        })

        const request = this

        Object.defineProperty(this._promise, 'resolve', { get() {
            return (value: T) => request.resolve(value) 
        }})
    }

    public after(handle: (value: any) => any) {
        this._afterRequest.push(handle)
    }

    public onEnd(handle: (ok: boolean, value: any) => void) {
        this._endRequest = handle
    }

    protected get promise() {
        return this._promise
    }

    protected resolve(value: T) {
        try {
            this._afterRequest.forEach(callback => {
                value = callback(value)
            })
        }
        catch(e) {
            if(this._endRequest) this._endRequest(false, e)
            return this._reject(e)
        }

        if(this._endRequest) this._endRequest(true, value)

        return this._accept(value)
    }

    protected reject(reason: any) {
        if(this._endRequest) this._endRequest(false, reason)
        return this._reject(reason)
    }
}

class ObliviusRecord {
    private requestInfo = {
        basePath: '',
        searchParams: {} as SearchParams<any>,
        defaultSearchParams: {} as SearchParams<any>,
        pathParams: {} as PathParams
    }
    
    constructor() {

    }
}