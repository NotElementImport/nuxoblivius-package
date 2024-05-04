import { appendMerge, isRef, queryToUrl, refOrVar, resolveOrLater, storeToQuery, urlPathParams } from "./Utils.js";
import { storeFetch } from "./Config.js";
import { reactive } from "vue";
export default class Record {
    _url = '';
    _queryStore = null;
    _query = {};
    _staticQuery = {};
    _pathParams = {};
    _headers = {};
    _body = null;
    _auth = null;
    _swapMethod = 0;
    _onNullCheck = false;
    _forceBody = false;
    _awaitBlob = false;
    _keepBy = { 'id': 'path' };
    _keepingContainer = {};
    _template = '';
    _lastStep = {
        method: '',
        arg: null
    };
    _borrow = {};
    _paginationEnabled = false;
    _pagination = {
        where: 'path',
        param: 'page'
    };
    _variables = reactive({
        currentPage: 1,
        maxPages: 1,
        isLastPage: false,
        response: null,
        error: '',
        isError: false,
        isLoading: false
    });
    get response() {
        return this._variables.response;
    }
    get pagination() {
        const pThis = this;
        return {
            setup(how, enabledByDefault = true) {
                this.enabled = enabledByDefault;
                if (how.startsWith('query:')) {
                    pThis._pagination.where = 'query';
                    pThis._pagination.param = how.slice(6);
                }
                else if (how.startsWith('path:')) {
                    pThis._pagination.where = 'path';
                    pThis._pagination.param = how.slice(5);
                }
                return pThis;
            },
            set enabled(v) {
                pThis._paginationEnabled = v;
            },
            next() {
                if (pThis._variables.maxPages > pThis._variables.currentPage) {
                    pThis._variables.currentPage += 1;
                    pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage;
                }
                return pThis;
            },
            prev() {
                if (pThis._variables.currentPage > 0) {
                    pThis._variables.currentPage -= 1;
                    pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage;
                }
                return pThis;
            },
            get isLastPage() {
                return pThis._variables.isLastPage;
            },
            set current(v) {
                pThis._variables.currentPage = v;
            },
            get current() {
                return pThis._variables.currentPage;
            }
        };
    }
    get loading() {
        return this._variables.isLoading;
    }
    get error() {
        return this._variables.isError;
    }
    get errorText() {
        return this._variables.error;
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
    keepBy(...fields) {
        for (const field of fields) {
            if (field.startsWith('query:')) {
                this._keepBy[field.slice(6)] = 'query';
            }
            else if (field.startsWith("path:")) {
                this._keepBy[field.slice(5)] = 'path';
            }
        }
        return this;
    }
    onlyOnEmpty() {
        this._onNullCheck = true;
        return this;
    }
    clearResponse() {
        this._variables.response = null;
        return this;
    }
    swapMethod(method) {
        if (method == 'hot') {
            this._swapMethod = 0;
        }
        else if (method == 'greedy') {
            this._swapMethod = 1;
        }
        else if (method == 'lazy') {
            this._swapMethod = 2;
        }
        return this;
    }
    borrowAtAnother(another, as) {
    }
    borrowAtSelf(where, as) {
        const response = () => {
        };
        return this;
    }
    template(template) {
        this._template = template;
        return this;
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
            if (typeof result != 'object' || !('_module_' in result))
                throw `reloadBy: only ref support`;
            result.watch(() => {
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
        if (this._onNullCheck && this._variables.response != null) {
            return this._variables.response;
        }
        this.swapGreedy();
        if (!this._forceBody)
            this._body = null;
        this.pathParam('id', id);
        this._lastStep.method = 'get';
        this._lastStep.arg = id;
        this.swapLazy();
        return this.doFetch('GET');
    }
    async post(body = null) {
        if (this._onNullCheck && this._variables.response != null) {
            return this._variables.response;
        }
        this.swapGreedy();
        if (!this._forceBody)
            this._body = body;
        this._lastStep.method = 'post';
        this._lastStep.arg = body;
        this.swapLazy();
        return this.doFetch('POST');
    }
    async put(body = null) {
        if (this._onNullCheck && this._variables.response != null) {
            return this._variables.response;
        }
        this.swapGreedy();
        if (!this._forceBody)
            this._body = body;
        this._lastStep.method = 'put';
        this._lastStep.arg = body;
        this.swapLazy();
        return this.doFetch('PUT');
    }
    async delete(id = null) {
        if (this._onNullCheck && this._variables.response != null) {
            return this._variables.response;
        }
        this.swapGreedy();
        if (!this._forceBody)
            this._body = null;
        this.pathParam('id', id);
        this._lastStep.method = 'delete';
        this._lastStep.arg = id;
        this.swapLazy();
        return this.doFetch('DELETE');
    }
    compilePagination() {
        if (this._paginationEnabled) {
            if (this._pagination.where == 'path') {
                this.pathParam(this._pagination.param, this._variables.currentPage);
            }
            else if (this._pagination.where == "query") {
                const query = {};
                query[this._pagination.param] = this._variables.currentPage;
                return query;
            }
        }
        return {};
    }
    async doFetch(method = 'GET') {
        this._variables.isLoading = true;
        const queryObject = this._queryStore != null
            ? storeToQuery(this._queryStore)
            : {};
        const pagination = this.compilePagination();
        const queries = appendMerge(queryObject, this._staticQuery, this._query, pagination);
        const url = urlPathParams(this._url, this._pathParams)
            + queryToUrl(queries);
        const options = {
            headers: appendMerge(this._headers, { 'Authorization': refOrVar(this._auth) }),
            method,
        };
        if (this._body != null) {
            options['body'] = refOrVar(this._body);
            if (!(options['body'] instanceof FormData) && typeof options['body'] == 'object') {
                options['body'] = JSON.stringify(this._body);
            }
        }
        const fetchResult = await storeFetch(url, options, this._awaitBlob, this._template);
        this._variables.response = fetchResult.data;
        this._variables.error = fetchResult.errorText;
        this._variables.maxPages = fetchResult.pageCount;
        this._variables.isError = fetchResult.error;
        this._variables.isLoading = false;
        this.keep(fetchResult.data, queries);
        return fetchResult.data;
    }
    swapGreedy() {
        if (this._swapMethod == 1) {
            this.clearResponse();
        }
    }
    swapLazy() {
        if (this._swapMethod == 2) {
            this.clearResponse();
        }
    }
    keep(response, query) {
        const getFrom = (where, key) => where == 'query'
            ? (query[key] || null)
            : (this._pathParams[key] || null);
        const keyForKeeping = Object.entries(this._keepBy)
            .map(([key, where]) => getFrom(where, key) != null
            ? `${key}:sets`
            : `${key}:null`)
            .join(';');
        this._keepingContainer[keyForKeeping] = response;
    }
}
