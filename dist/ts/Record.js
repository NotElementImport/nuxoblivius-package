import { appendMerge, isRef, queryToUrl, refOrVar, resolveOrLater, storeToQuery, urlPathParams } from "./Utils.js";
import { options as ConfigOptions } from "./Config.js";
import { reactive } from "vue";
export default class Record {
    _url = '';
    _queryStore = null;
    _query = {};
    _staticQuery = {};
    _pathParams = {};
    _headers = {};
    _body = null;
    _forceBody = false;
    _awaitBlob = false;
    _auth = null;
    _lastStep = {
        method: '',
        arg: null
    };
    _variables = reactive({
        response: null
    });
    get response() {
        return this._variables.response;
    }
    static new(url) {
        const instance = new Record();
        instance._url = url;
        return instance;
    }
    static Bearer(token) {
        return `Bearer ${token}`;
    }
    static Basic(login, password) {
        return `Basic ${btoa(login + ":" + password)}`;
    }
    pathParam(name, value) {
        resolveOrLater(value, (result) => {
            this._pathParams[name] = result;
        });
        return this;
    }
    query(query, locked = false) {
        if (isRef(query)) {
            this._queryStore = query;
            return this;
        }
        if (locked) {
            this._staticQuery = appendMerge(this._staticQuery, query);
        }
        else {
            this._query = appendMerge(this._query, query);
        }
        return this;
    }
    header(name, value) {
        resolveOrLater(value, (result) => {
            this._headers[name] = result;
        });
        return this;
    }
    body(body) {
        resolveOrLater(body, (result) => {
            this._body = result;
            this._forceBody = result != null;
        });
        return this;
    }
    reloadBy(object) {
        resolveOrLater(object, (result) => {
            console.log(result);
            if (typeof result != 'object' || !('_module_' in result))
                throw `reloadBy: only ref support`;
            result.watch(() => {
                console.log('test');
                this[this._lastStep.method](this._lastStep.arg);
            });
        });
        return this;
    }
    auth(data) {
        resolveOrLater(data, (result) => {
            this._auth = result;
        });
        return this;
    }
    isBlob(value = true) {
        this._awaitBlob = true;
        return this;
    }
    clearDynamicQuery() {
        this._query = {};
        return this;
    }
    async get(id = null) {
        if (!this._forceBody)
            this._body = null;
        this.pathParam('id', id);
        this._lastStep.method = 'get';
        this._lastStep.arg = id;
        const item = await this.doFetch('GET');
        this._variables.response = item;
    }
    async post(body = null) {
        this._body = body;
        this._lastStep.method = 'post';
        this._lastStep.arg = body;
        const item = await this.doFetch('POST');
        this._variables.response = item;
    }
    async put(body = null) {
        this._body = body;
        this._lastStep.method = 'put';
        this._lastStep.arg = body;
        const item = await this.doFetch('PUT');
        this._variables.response = item;
    }
    async delete(id = null) {
        if (!this._forceBody)
            this._body = null;
        this.pathParam('id', id);
        this._lastStep.method = 'delete';
        this._lastStep.arg = id;
        const item = await this.doFetch('DELETE');
        this._variables.response = item;
    }
    async doFetch(method = 'GET') {
        const queryObject = storeToQuery(this._queryStore);
        const url = urlPathParams(this._url, this._pathParams)
            + queryToUrl(appendMerge(queryObject, this._staticQuery, this._query));
        const options = {
            headers: appendMerge(this._headers, { 'Authorization': refOrVar(this._auth) }),
            method,
        };
        if (this._body != null) {
            options['body'] = refOrVar(this._body);
        }
        return await ConfigOptions.http(ConfigOptions.isServer ? ConfigOptions.apiRoot + url : url, options, this._awaitBlob);
    }
}
