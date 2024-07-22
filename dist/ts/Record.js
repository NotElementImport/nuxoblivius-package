import { appendMerge, isRef, queryToUrl, refOrVar, resolveOrLater, storeToQuery, urlPathParams } from "./Utils.js";
import { defaultHeaders, storeFetch } from "./config.js";
import { reactive, watch } from "vue";
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
    _rules = [];
    _defaultRule = () => null;
    _forceBody = false;
    _awaitBlob = false;
    _template = '';
    _lastStep = {
        method: '',
        arg: null
    };
    _protocol = {};
    _proxies = {};
    _keepBy = { 'id': 'path' };
    _keepByMethod = { 'id': 0 };
    _borrow = new Map();
    _borrowAnother = new Map();
    _keepingContainer = new Map();
    _enabledBorrow = true;
    _onError = null;
    _onEnd = null;
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
        headers: {},
        error: '',
        frozenKey: 0,
        isError: false,
        isLoading: false
    });
    _frozenResponse = null;
    get frozenResponse() {
        return this._frozenResponse;
    }
    get frozenKey() {
        return this._variables.frozenKey;
    }
    get response() {
        return this._variables.response;
    }
    get headers() {
        return this._variables.headers;
    }
    get one() {
        return this._variables.response;
    }
    get many() {
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
            },
            get lastPage() {
                return pThis._variables.maxPages;
            }
        };
    }
    get params() {
        const pthis = this;
        return {
            get path() {
                return pthis._proxies.path;
            },
            get query() {
                return pthis._proxies.query;
            }
        };
    }
    get protocol() {
        return this._proxies.protocol;
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
        instance._proxies.query = new Proxy({}, {
            get(t, p, r) {
                if (p in instance._staticQuery)
                    return instance._staticQuery[p];
                else if (p in instance._query)
                    return instance._query[p];
                return undefined;
            }
        });
        instance._proxies.path = new Proxy({}, {
            get(t, p, r) {
                return instance._pathParams[p];
            }
        });
        instance._proxies.protocol = new Proxy({}, {
            get(t, p, r) {
                return instance._protocol[p];
            }
        });
        return instance;
    }
    static Bearer(token) {
        return `Bearer ${token}`;
    }
    static Basic(login, password) {
        return `Basic ${btoa(login + ":" + password)}`;
    }
    keepBy(field, method = 'simple') {
        method = method == 'simple' ? 0 : 1;
        if (field.startsWith('query:')) {
            const name = field.slice(6);
            this._keepBy[name] = 'query';
            this._keepByMethod[name] = method;
        }
        else if (field.startsWith("path:")) {
            const name = field.slice(5);
            this._keepBy[name] = 'path';
            this._keepByMethod[name] = method;
        }
        return this;
    }
    onlyOnEmpty(enabled = true) {
        this._onNullCheck = enabled;
        return this;
    }
    clearResponse() {
        this._variables.response = null;
        this._frozenResponse = null;
        return this;
    }
    static ruleAndDescriptorEqual(rule, descriptor) {
        let isEqual = true;
        for (const [name, value] of Object.entries(rule)) {
            if (!(name in descriptor)) {
                isEqual = false;
                break;
            }
            else if (value != descriptor[name] && value != '*') {
                isEqual = false;
                break;
            }
            else if (value == '*' && descriptor[name] == null) {
                isEqual = false;
                break;
            }
        }
        return isEqual;
    }
    rule(rule, behaviour) {
        const check = (descriptor) => {
            if (typeof rule == 'function') {
                return rule(this.params);
            }
            return Record.ruleAndDescriptorEqual(rule, descriptor);
        };
        this._rules.push((descriptor) => {
            if (!check(descriptor)) {
                return false;
            }
            behaviour(this);
            return true;
        });
        return this;
    }
    defaultRule(behaviour) {
        this._defaultRule = () => behaviour(this);
        return this;
    }
    cached(rule, defaultIsnt = null) {
        for (const [descriptor, value] of this._keepingContainer.entries()) {
            if (Record.ruleAndDescriptorEqual(rule, descriptor)) {
                return value;
            }
        }
        return defaultIsnt;
    }
    deleteCached(rule) {
        for (const [descriptor, value] of this._keepingContainer.entries()) {
            if (Record.ruleAndDescriptorEqual(rule, descriptor)) {
                this._keepingContainer.delete(descriptor);
            }
        }
    }
    url(path) {
        this._url = path;
        return this;
    }
    enableBorrow(value) {
        this._enabledBorrow = value;
        return this;
    }
    prepare(rule, behaviour = () => true) {
        let data = this.cached(rule);
        if (!behaviour())
            return this;
        if (data != null) {
            this.setResponse(data);
            this._variables.currentPage = 1;
        }
        else {
            console.warn('prepare is empty');
        }
        return this;
    }
    frozenTick() {
        this._variables.frozenKey += 1;
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
    borrowAtAnother(logic, another, as) {
        this._borrowAnother.set(logic, (response) => {
            const object = refOrVar(another);
            if (!Array.isArray(object)) {
                console.warn('{value} is not array');
                return null;
            }
            for (const part of object) {
                const result = as(part);
                if (typeof result != 'undefined' && result != null) {
                    return result;
                }
            }
            return null;
        });
        return this;
    }
    borrowAtSelf(where, from, as) {
        this._borrow.set(where, [from, (response) => {
                if (!Array.isArray(response)) {
                    console.warn('{value} is not array');
                    return null;
                }
                for (const part of response) {
                    const result = as(part);
                    if (typeof result != 'undefined' && result != null) {
                        return result;
                    }
                }
                return null;
            }]);
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
    defineProtocol(key, defaultValue = null) {
        this._protocol[key] = defaultValue;
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
        const pThis = this;
        resolveOrLater(object, (result) => {
            if (typeof result != 'object')
                throw `reloadBy: only ref support`;
            const objectClassName = Object.getPrototypeOf(result).constructor.name || 'none';
            if (objectClassName == 'RefImpl') {
                watch(result, () => {
                    pThis.clearResponse();
                    pThis.frozenTick();
                    pThis.deleteCached(pThis.proccesDescriptor(this.compileQuery()));
                    pThis[pThis._lastStep.method](pThis._lastStep.arg)
                        .then((_) => pThis.frozenTick());
                });
            }
            else {
                if (!('_module_' in result))
                    throw `reloadBy: only ref support`;
                result.watch(() => {
                    pThis.clearResponse();
                    pThis.frozenTick();
                    pThis.deleteCached(pThis.proccesDescriptor(this.compileQuery()));
                    pThis[pThis._lastStep.method](pThis._lastStep.arg)
                        .then((_) => pThis.frozenTick());
                });
            }
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
        this._awaitBlob = value;
        return this;
    }
    clearDynamicQuery() {
        this._query = {};
        return this;
    }
    onFailure(method) {
        this._onError = method;
        return this;
    }
    onFinish(method) {
        this._onError = method;
        return this;
    }
    async get(id = null) {
        this.swapGreedy();
        if (!this._forceBody)
            this._body = null;
        this.pathParam('id', id);
        this._lastStep.method = 'get';
        this._lastStep.arg = id;
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
        return this.doFetch('POST');
    }
    async put(body = null) {
        this.swapGreedy();
        if (!this._forceBody)
            this._body = body;
        this._lastStep.method = 'put';
        this._lastStep.arg = body;
        return this.doFetch('PUT');
    }
    async delete(id = null) {
        this.swapGreedy();
        if (!this._forceBody)
            this._body = null;
        this.pathParam('id', id);
        this._lastStep.method = 'delete';
        this._lastStep.arg = id;
        return this.doFetch('DELETE');
    }
    borrowingFromAnother(descriptor, query) {
        if (!this._enabledBorrow)
            return null;
        const resolveRule = (rule, descriptor) => {
            if (typeof rule == 'function') {
                return rule(this.params);
            }
            return Record.ruleAndDescriptorEqual(rule, descriptor);
        };
        if (this._borrowAnother.size > 0) {
            for (const [rule, checking] of this._borrowAnother.entries()) {
                if (!resolveRule(rule, descriptor)) {
                    continue;
                }
                const result = checking(null);
                if (result != null) {
                    return result;
                }
            }
        }
        if (this._borrow.size > 0) {
            for (const [rule, checking] of this._borrow.entries()) {
                if (!resolveRule(rule, descriptor)) {
                    continue;
                }
                let cached = this.cached(checking[0]);
                if (cached != null) {
                    const result = checking[1](cached);
                    if (result != null) {
                        return result;
                    }
                }
                else {
                    break;
                }
            }
        }
        return null;
    }
    compileQuery() {
        const queryObject = this._queryStore != null
            ? storeToQuery(this._queryStore)
            : {};
        const pagination = this.compilePagination();
        return appendMerge(queryObject, this._staticQuery, this._query, pagination);
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
    proccesRules(descriptor) {
        if (this._rules.length == 0) {
            return;
        }
        let proccesed = false;
        for (const rule of this._rules) {
            let result = rule(descriptor);
            if (result) {
                proccesed = true;
                break;
            }
        }
        if (!proccesed)
            this._defaultRule();
    }
    proccesDescriptor(query) {
        const descriptor = {};
        const getFrom = (where, key) => where == 'query'
            ? (query[key] || null)
            : (this._pathParams[key] || null);
        for (const [key, value] of Object.entries(this._keepBy)) {
            descriptor[key] = getFrom(value, key) != null
                ? `*`
                : null;
        }
        return descriptor;
    }
    async doFetch(method = 'GET') {
        this._variables.isLoading = true;
        method = method.toLocaleLowerCase();
        const descriptor = this.proccesDescriptor(this.compileQuery());
        this.proccesRules(descriptor);
        let queries = this.compileQuery();
        if (this._onNullCheck && this._variables.response != null) {
            this._variables.isLoading = false;
            return this._variables.response;
        }
        if (method == 'get' || method == "post") {
            const result = this.borrowingFromAnother(descriptor, queries);
            if (result != null) {
                this.setResponse(result);
                this._variables.error = '';
                this._variables.maxPages = 1;
                this._variables.isError = false;
                this._variables.isLoading = false;
                return result;
            }
        }
        this.swapLazy();
        const url = urlPathParams(this._url, this._pathParams)
            + queryToUrl(queries);
        const rebuildHeader = {};
        for (const [key, value] of Object.entries(defaultHeaders)) {
            rebuildHeader[key] = refOrVar(value);
        }
        for (const [key, value] of Object.entries(this._headers)) {
            rebuildHeader[key] = refOrVar(value);
        }
        const options = {
            headers: appendMerge(rebuildHeader, { 'Authorization': refOrVar(this._auth) }),
            method,
        };
        if (this._body != null) {
            options['body'] = refOrVar(this._body);
            if (!(options['body'] instanceof FormData) && typeof options['body'] == 'object') {
                options['body'] = JSON.stringify(this._body);
            }
        }
        let fetchResult = await storeFetch(url, options, this._awaitBlob, this._template);
        if (fetchResult.error && this._onError != null) {
            const answer = await this._onError({ text: fetchResult.errorText, code: fetchResult.code }, () => this.doFetch(method));
            if (typeof answer == 'object') {
                fetchResult.data = answer;
                fetchResult.error = false;
            }
        }
        this.setResponse(fetchResult.data);
        this._variables.error = fetchResult.errorText;
        this._variables.maxPages = fetchResult.pageCount;
        this._variables.isError = fetchResult.error;
        this._variables.isLoading = false;
        this._variables.headers = fetchResult.header;
        if (fetchResult.protocol != null) {
            this._protocol = fetchResult.protocol;
        }
        this.keep(fetchResult.data, queries);
        if (this._onEnd)
            this._onEnd(fetchResult.data);
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
    setResponse(v) {
        this._variables.response = v;
        if (Array.isArray(v)) {
            this._frozenResponse = [...v];
        }
        else {
            this._frozenResponse = { ...v };
        }
        return this._variables.response;
    }
    keep(response, query) {
        const dataDescription = {};
        const getFrom = (where, key) => where == 'query'
            ? (query[key] || null)
            : (this._pathParams[key] || null);
        for (const [key, value] of Object.entries(this._keepBy)) {
            const mode = this._keepByMethod[key];
            const data = getFrom(value, key);
            dataDescription[key] = data != null
                ? (mode == 0 ? `*` : data)
                : null;
        }
        this._keepingContainer.set(dataDescription, response);
    }
}
