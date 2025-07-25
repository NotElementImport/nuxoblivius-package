import { appendMerge, isRef, queryToUrl, refOrVar, resolveOrLater, storeToQuery, urlPathParams } from "./Utils.js";
import { defaultHeaders, storeFetch, defaultFetchFailure, routerInterpolation } from "./config.js";
import { isReactive, reactive, watch } from "vue";
var ETagPlace;
(function (ETagPlace) {
    ETagPlace[ETagPlace["PATH"] = 0] = "PATH";
    ETagPlace[ETagPlace["QUERY"] = 1] = "QUERY";
})(ETagPlace || (ETagPlace = {}));
var EParamsTagsType;
(function (EParamsTagsType) {
    EParamsTagsType[EParamsTagsType["SIMPLE"] = 0] = "SIMPLE";
    EParamsTagsType[EParamsTagsType["FULL"] = 1] = "FULL";
})(EParamsTagsType || (EParamsTagsType = {}));
var ESwapMethod;
(function (ESwapMethod) {
    ESwapMethod[ESwapMethod["HOT"] = 0] = "HOT";
    ESwapMethod[ESwapMethod["LAZY"] = 1] = "LAZY";
    ESwapMethod[ESwapMethod["GREEDY"] = 2] = "GREEDY";
    ESwapMethod[ESwapMethod["PAGINATION"] = 3] = "PAGINATION";
})(ESwapMethod || (ESwapMethod = {}));
const isClient = typeof document !== 'undefined';
export const MarkSetup = Symbol('Record Setup');
const isSetup = (value) => (value && typeof value === 'object' && value[MarkSetup]);
const createRequest = () => {
    let [resolve, reject] = [(data) => { }, () => { }];
    const request = new Promise((res, rej) => { resolve = res; reject = rej; });
    return { request, resolve, reject };
};
export default class Record {
    _oneRequestAtTime = false;
    _currentRequest = null;
    _defaultValue = null;
    _url = '';
    _queryStore = null;
    _query = {};
    _interQuery = {};
    _staticQuery = {};
    _pathParams = {};
    _interPathParams = {};
    _headers = {};
    _body = null;
    _auth = null;
    _forceBody = false;
    _isBlob = false;
    _template = '';
    _tags = { 'id': ETagPlace.PATH };
    _tagsType = { 'id': EParamsTagsType.SIMPLE };
    _lastRequestTags = {};
    _onNullCheck = false;
    _swapMethod = ESwapMethod.HOT;
    _protocol = {};
    _recordRuleBehaviour = [];
    _defaultRule = () => null;
    _onError = null;
    _onEnd = null;
    _lastStep = () => (new Promise((resolve) => resolve(null)));
    _proxies = {};
    _borrow = new Map();
    _borrowAnother = new Map();
    _enabledBorrow = true;
    _allCachedResponse = new Map();
    _paginationEnabled = false;
    _pagination = {
        change: false,
        where: 'path',
        param: 'page'
    };
    _variables = reactive({
        currentPage: 1,
        maxPages: 1,
        autoReloadPagination: false,
        expandResponse: false,
        isLastPage: false,
        response: null,
        headers: {},
        error: '',
        errorCode: 200,
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
    set response(value) {
        this._variables.response = value;
    }
    get headers() {
        return this._variables.headers;
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
                pThis._swapMethod = ESwapMethod.PAGINATION;
                return pThis;
            },
            autoReload(value = true) {
                pThis._variables.autoReloadPagination = value;
                return pThis;
            },
            set enabled(v) {
                pThis._paginationEnabled = v;
            },
            toFirst() {
                if (pThis._variables.currentPage == 1)
                    return pThis;
                pThis._variables.currentPage = 1;
                pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage;
                if (pThis._variables.autoReloadPagination)
                    pThis._lastStep();
                return pThis;
            },
            toLast() {
                if (pThis._variables.currentPage == pThis._variables.maxPages)
                    return pThis;
                pThis._variables.currentPage = pThis._variables.maxPages;
                pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage;
                pThis._pagination.change = true;
                if (pThis._variables.autoReloadPagination)
                    pThis._lastStep();
                return pThis;
            },
            next() {
                if (pThis._variables.maxPages > pThis._variables.currentPage) {
                    pThis._variables.currentPage += 1;
                    pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage;
                    pThis._pagination.change = true;
                    if (pThis._variables.autoReloadPagination)
                        pThis._lastStep();
                }
                return pThis;
            },
            prev() {
                if (pThis._variables.currentPage > 1) {
                    pThis._variables.currentPage -= 1;
                    pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage;
                    pThis._pagination.change = true;
                    if (pThis._variables.autoReloadPagination)
                        pThis._lastStep();
                }
                return pThis;
            },
            get isLastPage() {
                return pThis._variables.isLastPage;
            },
            set current(v) {
                pThis._variables.currentPage = v;
                pThis._pagination.change = true;
                if (pThis._variables.autoReloadPagination)
                    pThis._lastStep();
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
                return pthis._proxies.pathParam;
            },
            get query() {
                return pthis._proxies.query;
            }
        };
    }
    get protocol() {
        return this._protocol;
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
    get errorCode() {
        return this._variables.errorCode;
    }
    static new(url, defaultValue) {
        const instance = new Record();
        const isShortURL = url[0] == '/';
        const urlReader = new URL(url, isShortURL ? 'http://localhost:3000' : undefined);
        instance._url = decodeURIComponent(isShortURL ? urlReader.pathname : urlReader.origin + urlReader.pathname);
        const pathInterpolation = instance._url.split('[').splice(1);
        if (pathInterpolation.length != 0) {
            for (let data of pathInterpolation) {
                data = data.split(']').shift().trim();
                const [name, value] = routerInterpolation(data, 'path');
                instance._interPathParams[name] = value;
                instance._url = instance._url.replaceAll(`[${data}]`, `{${name}}`);
                instance.pathParam(name, value);
            }
        }
        for (let [key, value] of urlReader.searchParams.entries()) {
            value = decodeURIComponent(value);
            key = decodeURIComponent(key);
            if (value[0] == '[') {
                const [_, queryValue] = routerInterpolation(value.slice(1, -1), 'query');
                instance._interQuery[key] = queryValue;
                continue;
            }
            instance._query[key] = value;
        }
        instance._variables.response = defaultValue ?? null;
        instance._defaultValue = defaultValue ?? null;
        instance._proxies.query = new Proxy({}, {
            get(t, p, r) {
                if (p in instance._query)
                    return refOrVar(instance._query[p]);
                else if (p in instance._staticQuery)
                    return refOrVar(instance._staticQuery[p]);
                else if (p in instance._interQuery)
                    return refOrVar(instance._interQuery[p]);
                return undefined;
            }
        });
        instance._proxies.pathParam = new Proxy({}, {
            get(t, p, r) {
                if (p in instance._pathParams)
                    return refOrVar(instance._pathParams[p]);
                else if (p in instance._interPathParams)
                    return refOrVar(instance._interPathParams[p]);
                return undefined;
            }
        });
        return instance;
    }
    static ff(code = '', defaultValue) {
        const instruction = code.split(';');
        const record = Record.new(instruction.pop().trim(), defaultValue);
        for (let tag of instruction) {
            tag = tag.trim();
            switch (tag) {
                case 'swap-lazy':
                    record.swapMethod('lazy');
                    continue;
                case 'swap-greedy':
                    record.swapMethod('greedy');
                    continue;
                case 'swap-hot':
                    record.swapMethod('hot');
                    continue;
                case 'on-empty':
                    record.onlyOnEmpty();
                    continue;
                case 'one-at-time':
                    record.oneRequestAtTime();
                    continue;
            }
            if (tag.startsWith("template ")) {
                record.template(tag.replace('template ', ''));
            }
            else if (tag.startsWith("page ")) {
                record.pagination.setup(tag.replace('page ', '').trim());
                record.pagination.autoReload();
            }
        }
        return record;
    }
    get one() {
        return this._variables.response;
    }
    get many() {
        return this._variables.response;
    }
    static Bearer(token) {
        return `Bearer ${token}`;
    }
    static Basic(login, password) {
        return `Basic ${btoa(login + ":" + password)}`;
    }
    static json(item) {
        return {
            [MarkSetup]: true,
            headers: { 'Content-Type': 'application/json' },
            body: () => JSON.stringify(refOrVar(item)),
        };
    }
    static urlEncoded(item) {
        return {
            [MarkSetup]: true,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: () => {
                const raw = refOrVar(item);
                return queryToUrl(raw);
            },
        };
    }
    preset(object) {
        if (typeof object === 'function') {
            object(this);
            return this;
        }
        if ('body' in object)
            this.body(object.body);
        if ('appendsResponse' in object)
            this.appendsResponse(object.appendsResponse);
        if ('onlyOnEmpty' in object)
            this.onlyOnEmpty(object.onlyOnEmpty);
        if ('oneRequestAtTime' in object)
            this.oneRequestAtTime(object.oneRequestAtTime);
        if (object.headers) {
            for (const [name, value] of Object.entries(object.headers))
                this.header(name, value);
        }
        if (object.rule) {
            for (const [condition, apply] of object.rule)
                this.rule(condition, apply);
        }
        if (object.borrow) {
            for (const [condition, from, research] of object.borrow)
                this.borrowFrom(condition, from, research);
        }
        if (object.defaultRule)
            this.defaultRule(object.defaultRule);
        if (object.query)
            this.query(object.query);
        if (object.swapMethod)
            this.swapMethod(object.swapMethod);
        if (object.pagination) {
            const [name, enabled, autoReload] = object.pagination;
            this.pagination.setup(name, enabled);
            this.pagination.autoReload(autoReload);
        }
        if (object.pathParams) {
            for (const [name, value] of Object.entries(object.pathParams))
                this.pathParam(name, value);
        }
        return this;
    }
    createTag(field, access = 'simple') {
        const acecssValue = access == 'simple'
            ? EParamsTagsType.SIMPLE
            : EParamsTagsType.FULL;
        if (field.startsWith('query:')) {
            const name = field.slice(6);
            this._tags[name] = ETagPlace.QUERY;
            this._tagsType[name] = acecssValue;
        }
        else if (field.startsWith("path:")) {
            const name = field.slice(5);
            this._tags[name] = ETagPlace.PATH;
            this._tagsType[name] = acecssValue;
        }
        return this;
    }
    oneRequestAtTime(value = true) {
        this._oneRequestAtTime = value;
        return this;
    }
    appendsResponse(value = true) {
        if (isClient)
            this._variables.expandResponse = value;
        return this;
    }
    onlyOnEmpty(enabled = true) {
        if (isClient)
            this._onNullCheck = enabled;
        return this;
    }
    rule(rule, behaviour) {
        const check = (recordTag) => {
            return typeof rule == 'function'
                ? rule(this.params)
                : Record.compareTags(rule, recordTag, this._lastRequestTags);
        };
        this._recordRuleBehaviour.push((recordTag) => {
            if (!check(recordTag))
                return false;
            return behaviour(this) ?? true;
        });
        return this;
    }
    defaultRule(behaviour) {
        this._defaultRule = () => behaviour(this);
        return this;
    }
    url(path) {
        this._url = path;
        return this;
    }
    enableBorrow(value) {
        this._enabledBorrow = value;
        return this;
    }
    prepare(condition, behaviour = () => true) {
        let data = this.cached(condition);
        if (!behaviour())
            return this;
        if (data != null) {
            this.setResponse(data);
            this._variables.currentPage = 1;
            this._variables.isLastPage = this._variables.currentPage == this._variables.maxPages;
        }
        else {
            console.warn('prepare is empty');
        }
        return this;
    }
    swapMethod(method) {
        if (method == 'hot')
            this._swapMethod = ESwapMethod.HOT;
        else if (method == 'greedy')
            this._swapMethod = ESwapMethod.GREEDY;
        else if (method == 'lazy')
            this._swapMethod = ESwapMethod.LAZY;
        else if (method == 'pagination')
            this._swapMethod = ESwapMethod.PAGINATION;
        return this;
    }
    borrowFrom(condition, another, as) {
        if (!isClient)
            return this;
        this._borrowAnother.set(condition, (_) => {
            const object = refOrVar(another);
            if (!Array.isArray(object)) {
                console.warn('borrow, from value is not array');
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
        if (!isClient)
            return this;
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
            if (result == null && this._interPathParams[name])
                this._pathParams[name] = this._interPathParams[name];
            else
                this._pathParams[name] = result;
        });
        return this;
    }
    query(query, baked = false) {
        if (isRef(query)) {
            this._queryStore = query;
            return this;
        }
        if (baked) {
            this._staticQuery = query;
        }
        else {
            if (isReactive(query))
                this._query = query;
            else
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
        if (isSetup(body)) {
            this.preset(body);
            return this;
        }
        resolveOrLater(body, (result) => {
            this._body = result;
            this._forceBody = result != null;
        });
        return this;
    }
    reloadBy(object) {
        if (!isClient)
            return this;
        const pThis = this;
        resolveOrLater(object, (result) => {
            if (isReactive(result) || isRef(result) || result?.__v_isRef) {
                watch(result, () => {
                    const oldValueOnNullCheck = pThis._onNullCheck;
                    const oldValueExpandCheck = pThis._variables.expandResponse;
                    pThis._onNullCheck = false;
                    pThis._variables.expandResponse = false;
                    pThis._variables.currentPage = 1;
                    pThis._lastStep()
                        .then(() => { pThis._onNullCheck = oldValueOnNullCheck; pThis._variables.expandResponse = oldValueExpandCheck; });
                });
                return;
            }
            else {
                if (!('_module_' in result))
                    throw `reloadBy: only ref support`;
                result.watch(() => {
                    const oldValueOnNullCheck = pThis._onNullCheck;
                    const oldValueExpandCheck = pThis._variables.expandResponse;
                    pThis._onNullCheck = false;
                    pThis._variables.expandResponse = false;
                    pThis._variables.currentPage = 1;
                    pThis._lastStep()
                        .then(() => { pThis._onNullCheck = oldValueOnNullCheck; pThis._variables.expandResponse = oldValueExpandCheck; });
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
        this._isBlob = value;
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
        this._onEnd = method;
        return this;
    }
    then(handle) {
        handle();
        return this;
    }
    clearResponse(defaultValue = true) {
        this._variables.response = defaultValue ? this._defaultValue : null;
        return this;
    }
    reset(config = { pagination: true, response: true, query: true }) {
        if (config.pagination) {
            this._variables.currentPage = 1;
        }
        if (config.response) {
            if (typeof config.response === "boolean")
                this._variables.response = this._defaultValue;
            else if (typeof config.response === 'object')
                this._variables.response = config.response;
        }
        if (config.query) {
            this.clearDynamicQuery();
        }
    }
    cached(rule, defaultIsnt = null) {
        for (const [descriptor, value] of this._allCachedResponse.entries()) {
            if (Record.compareTags(rule, descriptor)) {
                return value;
            }
        }
        return defaultIsnt;
    }
    deleteAllCache() {
        this._allCachedResponse.clear();
        return this;
    }
    frozenTick() {
        this._variables.frozenKey += 1;
        return this;
    }
    async get(id = null) {
        this.swapGreedy();
        if (!this._forceBody)
            this._body = null;
        this.pathParam('id', id);
        this._lastStep = () => this.get(id);
        return this.doFetch('get');
    }
    async post(body = null) {
        if (this._onNullCheck && this._variables.response != null) {
            return this._variables.response;
        }
        this.swapGreedy();
        if (!this._forceBody)
            this._body = body;
        this._lastStep = () => this.post(body);
        return this.doFetch('post');
    }
    async put(body = null) {
        this.swapGreedy();
        if (!this._forceBody)
            this._body = body;
        this._lastStep = () => this.put(body);
        return this.doFetch('put');
    }
    async delete(id = null) {
        this.swapGreedy();
        if (!this._forceBody)
            this._body = null;
        this.pathParam('id', id);
        this._lastStep = () => this.delete(id);
        return this.doFetch('delete');
    }
    async patch(id = null) {
        this.swapGreedy();
        if (!this._forceBody)
            this._body = null;
        this.pathParam('id', id);
        this._lastStep = () => this.patch(id);
        return this.doFetch('patch');
    }
    borrowingFromAnother(condition) {
        if (!this._enabledBorrow)
            return null;
        const checkCondition = (condition, other) => {
            return typeof other === 'function'
                ? other(this.params)
                : Record.compareTags(other, condition, this._lastRequestTags);
        };
        if (this._borrowAnother.size > 0) {
            for (const [rule, searching] of this._borrowAnother.entries()) {
                if (!checkCondition(condition, rule) || !this._enabledBorrow)
                    continue;
                const result = searching(null);
                if (result)
                    return result;
            }
        }
        if (this._borrow.size > 0) {
            for (const [rule, options] of this._borrow.entries()) {
                if (!checkCondition(condition, rule) || !this._enabledBorrow)
                    continue;
                const [cacheCondition, searching] = options;
                let cached = this.cached(cacheCondition);
                if (!cached)
                    break;
                const result = searching(cached);
                if (result)
                    return result;
            }
        }
        return null;
    }
    compileQuery() {
        const queryObject = this._queryStore != null
            ? storeToQuery(this._queryStore)
            : {};
        return appendMerge(queryObject, this._interQuery, this._staticQuery, this._query, this.compilePagination());
    }
    compilePagination() {
        if (!this._paginationEnabled)
            return {};
        if (this._pagination.where == 'path') {
            this.pathParam(this._pagination.param, this._variables.currentPage);
            return {};
        }
        else if (this._pagination.where == "query") {
            return {
                [this._pagination.param]: this._variables.currentPage
            };
        }
    }
    proccesRules(condition) {
        if (this._recordRuleBehaviour.length == 0)
            return;
        for (const rule of this._recordRuleBehaviour) {
            if (rule(condition))
                return;
        }
        this._defaultRule();
    }
    recordDataTag(compiledQuery) {
        const tag = {};
        for (const [paramName, type] of Object.entries(this._tags)) {
            const access = this._tagsType[paramName];
            const value = type == ETagPlace.PATH
                ? refOrVar(this._pathParams[paramName])
                : refOrVar(compiledQuery[paramName]);
            if (access == EParamsTagsType.FULL)
                tag[paramName] = value ?? null;
            else
                tag[paramName] = value ? '*' : null;
        }
        return tag;
    }
    async doFetch(method = 'get') {
        if (this._oneRequestAtTime && this._currentRequest != null) {
            return this._currentRequest;
        }
        const { request, resolve } = createRequest();
        this._currentRequest = request;
        const endRequest = (value) => {
            this._currentRequest = null;
            resolve(value);
        };
        this._variables.isLoading = true;
        const pageChange = this._pagination.change;
        this._pagination.change = false;
        let recordTag = this.recordDataTag(this.compileQuery());
        this.proccesRules(recordTag);
        recordTag = this.recordDataTag(this.compileQuery());
        this._lastRequestTags = recordTag;
        let queries = this.compileQuery();
        if (this._onNullCheck) {
            const response = this._variables.response;
            const isEmpty = (response == null)
                || (typeof response == 'object' && Object.keys(response ?? []).length == 0)
                || (this._swapMethod == ESwapMethod.PAGINATION && pageChange);
            if (!isEmpty) {
                this._variables.isLoading = false;
                endRequest(response);
                return response;
            }
        }
        if (method == 'get' || method == "post") {
            const result = this.borrowingFromAnother(recordTag);
            if (result != null) {
                const oldResponse = this._variables.response;
                this.setResponse(result);
                this._variables.error = '';
                this._variables.isError = false;
                this._variables.errorCode = 200;
                this._variables.isLoading = false;
                endRequest(result);
                if (this._onEnd)
                    await this._onEnd(result, { fromCache: true, oldResponse });
                return result;
            }
        }
        this.swapLazy();
        const url = urlPathParams(this._url, this._pathParams)
            + queryToUrl(queries);
        const headers = {};
        for (const [key, value] of Object.entries(defaultHeaders))
            headers[key] = refOrVar(value);
        for (const [key, value] of Object.entries(this._headers))
            headers[key] = refOrVar(value);
        const options = {
            headers: appendMerge(headers, { 'Authorization': refOrVar(this._auth) }),
            method: method.toUpperCase(),
        };
        if (this._body != null) {
            options.body = refOrVar(this._body);
            if (options.body instanceof FormData)
                delete headers['Content-Type'];
            else if (typeof options.body == 'object')
                options.body = JSON.stringify(this._body);
        }
        let fetchResult = await storeFetch(url, options, this._isBlob, this._template);
        if (fetchResult.error) {
            const answer = await (this._onError || defaultFetchFailure)({ text: fetchResult.errorText, code: fetchResult.code, response: fetchResult.data }, () => this.doFetch(method));
            if (typeof answer == 'object') {
                fetchResult.data = answer;
                fetchResult.error = false;
            }
        }
        const oldResponse = this._variables.response;
        this.setResponse(fetchResult.data);
        this._variables.error = fetchResult.errorText;
        this._variables.maxPages = fetchResult.pageCount;
        this._variables.isError = fetchResult.error;
        this._variables.errorCode = fetchResult.code;
        this._variables.isLoading = false;
        this._variables.headers = fetchResult.header;
        if (fetchResult.protocol != null) {
            this._protocol = fetchResult.protocol;
        }
        if (method.toLowerCase() == "get" && fetchResult.code == 200) {
            this._variables.isLastPage = this._variables.maxPages == this._variables.currentPage;
            this.keep(fetchResult.data, recordTag);
        }
        endRequest(fetchResult.data);
        if (this._onEnd)
            await this._onEnd(fetchResult.data, { fromCache: false, oldResponse });
        return fetchResult.data;
    }
    swapGreedy() {
        if (this._swapMethod == ESwapMethod.GREEDY && !this._variables.expandResponse) {
            this._variables.response = this._defaultValue;
        }
    }
    swapLazy() {
        if (this._swapMethod == ESwapMethod.LAZY && !this._variables.expandResponse) {
            this._variables.response = this._defaultValue;
        }
    }
    static compareTags(tags, other, otherLast) {
        for (const [name] of Object.entries(tags)) {
            const value = refOrVar(tags[name]);
            if (!(name in other))
                return false;
            if (otherLast && name in otherLast) {
                if (value == '<>' && otherLast[name] != other[name])
                    continue;
            }
            const otherValue = other[name] ?? null;
            if (value == otherValue)
                continue;
            if ((value == '*' && otherValue != null) || (otherValue == '*' && value != null))
                continue;
            return false;
        }
        return true;
    }
    setResponse(v) {
        if (this._variables.expandResponse) {
            if (!this._variables.response)
                this._variables.response = [];
            this._variables.response.push(...v);
        }
        else {
            this._variables.response = v;
        }
        return this._variables.response;
    }
    async keep(response, recordTag) {
        const deepClone = (v) => JSON.parse(JSON.stringify(v));
        for (const [key] of this._allCachedResponse.entries()) {
            if (Record.compareTags(key, recordTag)) {
                this._allCachedResponse.set(key, deepClone(response));
                return;
            }
        }
        this._allCachedResponse.set(recordTag, deepClone(response));
    }
}
