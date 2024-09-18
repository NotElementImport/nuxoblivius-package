import { appendMerge, isRef, queryToUrl, refOrVar, resolveOrLater, storeToQuery, urlPathParams } from "./Utils.js";
import { defaultHeaders, storeFetch } from "./config.js";
import { isReactive, reactive, watch } from "vue";
var EParamsTagsType;
(function (EParamsTagsType) {
    EParamsTagsType[EParamsTagsType["SIMPLE"] = 0] = "SIMPLE";
    EParamsTagsType[EParamsTagsType["FULL"] = 1] = "FULL";
})(EParamsTagsType || (EParamsTagsType = {}));
/**
 * Checking for disabling some stuff on server
 */
const isClient = typeof document !== 'undefined';
export default class Record {
    // Fetch settings
    /** Pathname for fetching  */
    _url = '';
    /** @deprecated Other Stores as Query object */
    _queryStore = null;
    /** Query for fetching */
    _query = {};
    /** Baked Query for fetching [cannot be removed] */
    _staticQuery = {};
    /** Path params for query */
    _pathParams = {};
    /** Headers for query */
    _headers = {};
    /** Body request for query */
    _body = null;
    /** Authorization for query */
    _auth = null;
    /** Always use body */
    _forceBody = false;
    /** Response type is blob */
    _isBlob = false;
    /** Current `pattern response reader` */
    _template = '';
    // Cachin / Tags
    _tags = { 'id': 'path' };
    _tagsType = { 'id': EParamsTagsType.SIMPLE };
    // Pre Fetch config
    /** Receive data only when the response is empty */
    _onNullCheck = false;
    /** [For nerds] When to delete data in response  */
    _swapMethod = 0;
    // Post Fetch config
    /** Data from `pattern response reader` */
    _protocol = {};
    /** Rebuild the object at the specified rule */
    _recordRuleBehaviour = [];
    /** Default settings if no rule is suitable  */
    _defaultRule = () => null;
    // Event Handlers:
    /** Error Handler */
    _onError = null;
    /** Finish Response Handler */
    _onEnd = null;
    // Links
    /** For re-launching fetch */
    _lastStep = () => { };
    _proxies = {};
    _borrow = new Map();
    _borrowAnother = new Map();
    _keepingContainer = new Map();
    _enabledBorrow = true;
    _paginationEnabled = false;
    _pagination = {
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
            autoReload() {
                pThis._variables.autoReloadPagination = true;
                return pThis;
            },
            set enabled(v) {
                pThis._paginationEnabled = v;
            },
            toFirst() {
                pThis._variables.currentPage = 1;
                pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage;
                if (pThis._variables.autoReloadPagination)
                    pThis._lastStep();
                return pThis;
            },
            toLast() {
                pThis._variables.currentPage = pThis._variables.maxPages;
                pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage;
                if (pThis._variables.autoReloadPagination)
                    pThis._lastStep();
                return pThis;
            },
            next() {
                if (pThis._variables.maxPages > pThis._variables.currentPage) {
                    pThis._variables.currentPage += 1;
                    pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage;
                    if (pThis._variables.autoReloadPagination)
                        pThis._lastStep();
                }
                return pThis;
            },
            prev() {
                if (pThis._variables.currentPage > 0) {
                    pThis._variables.currentPage -= 1;
                    pThis._variables.isLastPage = pThis._variables.maxPages == pThis._variables.currentPage;
                }
                if (pThis._variables.autoReloadPagination)
                    pThis._lastStep();
                return pThis;
            },
            get isLastPage() {
                return pThis._variables.isLastPage;
            },
            set current(v) {
                pThis._variables.currentPage = v;
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
                return pthis._proxies.path;
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
    static new(url, defaultValue) {
        const instance = new Record();
        instance._url = url;
        instance._variables.response = defaultValue ?? null;
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
    /**
    * [Sugar] Creating Bearer auth string
    */
    static Bearer(token) {
        return `Bearer ${token}`;
    }
    /**
    * [Sugar] Creating Basic auth string
    */
    static Basic(login, password) {
        return `Basic ${btoa(login + ":" + password)}`;
    }
    /**
    * [Nerds] Creating Tag for processing: `borrow`, `caching`, `rules`
    *
    * simple - check has value or not
    * full   - can access to value
    */
    createTag(field, access = 'simple') {
        const acecssValue = access == 'simple'
            ? EParamsTagsType.SIMPLE
            : EParamsTagsType.FULL;
        if (field.startsWith('query:')) { // Query Tag
            const name = field.slice(6); // remove 'query:'
            this._tags[name] = 'query';
            this._tagsType[name] = acecssValue;
        }
        else if (field.startsWith("path:")) { // Path Param Tag
            const name = field.slice(5); // remove 'path:'
            this._tags[name] = 'path';
            this._tagsType[name] = acecssValue;
        }
        return this;
    }
    /**
     * Appends new response to current response like\
     * `response.push(...new_response)`
     *
     * ! If enable disabled swapMethod [Nerd thing]
     */
    appendsResponse(value = true) {
        this._variables.expandResponse = value;
        return this;
    }
    /**
     * Only do Fetch if response == null
     */
    onlyOnEmpty(enabled = true) {
        this._onNullCheck = enabled;
        return this;
    }
    /**
     * Clearing Response
     */
    clearResponse() {
        this._variables.response = null;
        this._frozenResponse = null;
        return this;
    }
    /**
     * Compare tags see `createTag`
     */
    static compareTags(tags, other) {
        for (const [name, value] of Object.entries(tags)) {
            if (!(name in other))
                return false; // Not includes in other. Not valid
            const otherValue = other[name] ?? null;
            if (value == otherValue)
                continue;
            if ((value == '*' && otherValue != null) || (otherValue == '*' && value != null))
                continue;
            return false;
        }
        return true;
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
    rule(rule, behaviour) {
        const check = (descriptor) => {
            if (typeof rule == 'function') {
                return rule(this.params);
            }
            return Record.ruleAndDescriptorEqual(rule, descriptor);
        };
        this._recordRuleBehaviour.push((descriptor) => {
            if (!check(descriptor)) {
                return false;
            }
            behaviour(this);
            return true;
        });
        return this;
    }
    /**
     * Deafult rule if other rules not valid
     *
     * Check `rule` method for example
     */
    defaultRule(behaviour) {
        this._defaultRule = () => behaviour(this);
        return this;
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
    cached(rule, defaultIsnt = null) {
        for (const [descriptor, value] of this._keepingContainer.entries()) {
            if (Record.ruleAndDescriptorEqual(rule, descriptor)) {
                return value;
            }
        }
        return defaultIsnt;
    }
    /**
     * Delete cache by tag
     *
     * @deprecated not needed, while
     */
    deleteCached(rule) {
        this._keepingContainer.clear();
    }
    /**
     * Rewrite url, using in `rule` and `defaultRule` section
     */
    url(path) {
        this._url = path;
        return this;
    }
    /**
     * Enable / Disable logic for `borrowAtAnother` and `borrowAtSelf`
     */
    enableBorrow(value) {
        this._enabledBorrow = value;
        return this;
    }
    /**
     * Rollback to cached data
     */
    prepare(rule, behaviour = () => true) {
        let data = this.cached(rule);
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
    /**
     * Not using
     * @deprecated
     */
    frozenTick() {
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
    swapMethod(method) {
        if (method == 'hot')
            this._swapMethod = 0;
        else if (method == 'greedy')
            this._swapMethod = 1;
        else if (method == 'lazy')
            this._swapMethod = 2;
        return this;
    }
    /**
     * [Configuration]
     * [Nerds] Get data from another object, instead of fetching. Otherwise do fetching
     *
     * @param condition Check whether the conditions are suitable for the execution of the "borrow". (By tags or Functioin)
     * @param another   The object we're going to take from
     * @param as        Logic for finding what you need in an object
     */
    borrowFrom(condition, another, as) {
        this._borrowAnother.set(condition, (_) => {
            const object = refOrVar(another); // Get raw data
            if (!Array.isArray(object)) { // If not array skip
                console.warn('{value} is not array');
                return null;
            }
            for (const part of object) { // Search, what you need
                const result = as(part);
                if (typeof result != 'undefined' && result != null) {
                    return result;
                }
            }
            return null;
        });
        return this;
    }
    /**
     * [Configuration]
     * [Nerds] Get data from self, by caching value, instead of fetching. Otherwise do fetching
     *
     * @param condition Check whether the conditions are suitable for the execution of the "borrow". (By tags or Functioin)
     * @param from      Get caching data by tags. Otherwise skip "borrow"
     * @param as        Logic for finding what you need in an object
     */
    borrowAtSelf(where, from, as) {
        this._borrow.set(where, [from, (response) => {
                if (!Array.isArray(response)) { // If not array skip
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
                    pThis._lastStep();
                });
                return;
            }
            else {
                if (!('_module_' in result))
                    throw `reloadBy: only ref support`;
                result.watch(() => {
                    pThis._lastStep();
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
    async get(id = null) {
        this.swapGreedy();
        if (!this._forceBody)
            this._body = null;
        this.pathParam('id', id);
        this._lastStep = () => this.get(id);
        return this.doFetch('GET');
    }
    async post(body = null) {
        if (this._onNullCheck && this._variables.response != null) {
            return this._variables.response;
        }
        this.swapGreedy();
        if (!this._forceBody)
            this._body = body;
        this._lastStep = () => this.post(body);
        return this.doFetch('POST');
    }
    async put(body = null) {
        this.swapGreedy();
        if (!this._forceBody)
            this._body = body;
        this._lastStep = () => this.put(body);
        return this.doFetch('PUT');
    }
    async delete(id = null) {
        this.swapGreedy();
        if (!this._forceBody)
            this._body = null;
        this.pathParam('id', id);
        this._lastStep = () => this.delete(id);
        return this.doFetch('DELETE');
    }
    async patch(id = null) {
        this.swapGreedy();
        if (!this._forceBody)
            this._body = null;
        this.pathParam('id', id);
        this._lastStep = () => this.patch(id);
        return this.doFetch('PATCH');
    }
    // Inner Methods :
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
        if (this._recordRuleBehaviour.length == 0) {
            return;
        }
        let proccesed = false;
        for (const rule of this._recordRuleBehaviour) {
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
            ? (query[key] || null) // Query
            : (this._pathParams[key] || null); // Path
        for (const [key, value] of Object.entries(this._tags)) {
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
        let fetchResult = await storeFetch(url, options, this._isBlob, this._template);
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
        if (this._swapMethod == 1 && !this._variables.expandResponse) {
            this.clearResponse();
        }
    }
    swapLazy() {
        if (this._swapMethod == 2 && !this._variables.expandResponse) {
            this.clearResponse();
        }
    }
    setResponse(v) {
        if (this._variables.expandResponse) {
            if (!this._variables.response)
                this._variables.response = [];
            this._variables.response.push(...v);
        }
        else {
            this._variables.response = v;
            if (Array.isArray(v)) {
                this._frozenResponse = [...v];
            }
            else {
                this._frozenResponse = { ...v };
            }
        }
        return this._variables.response;
    }
    keep(response, query) {
        const dataDescription = {};
        const getFrom = (where, key) => where == 'query'
            ? (query[key] || null)
            : (this._pathParams[key] || null);
        for (const [key, value] of Object.entries(this._tags)) {
            const mode = this._tagsType[key];
            const data = getFrom(value, key);
            dataDescription[key] = data != null
                ? (mode == 0 ? `*` : data)
                : null;
        }
        this._keepingContainer.set(dataDescription, response);
    }
}
