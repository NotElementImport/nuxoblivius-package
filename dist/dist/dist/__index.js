// import { Ref } from "vue"
import ValidateEmail from "./validate/ValidateEmail.js";
import ValidateTelephone from "./validate/ValidateTelephone.js";
import { ref } from "vue";
import ValidateRange from "./validate/ValidateRange.js";
import ValidateGreater from "./validate/ValidateGreater.js";
import ValidateLess from "./validate/ValidateLess.js";
export const config = {
    get: (object_) => object_,
    set: (object_, value) => object_ = value,
    init: (value) => value,
    request: async (url, params) => (await fetch(url, params)).text(),
    saveCookie: (name, value, expr) => { },
    getCookie: (name) => { },
    router: () => null
};
export const globalStateManager = (class_) => {
    _earlyInstances.push(class_);
};
export const __globas = () => {
    return _earlyInstances;
};
const addToPath = (url, data) => {
    if (url[url.length - 1] == '/') {
        return url + data;
    }
    return url + '/' + data;
};
const aavalidata = (data) => {
    if (typeof data == 'boolean')
        return true;
    if (Array.isArray(data) && data.length > 0) {
        return true;
    }
    else if (typeof data == 'object') {
        if ('__wrt' in data) {
            return aavalidata(data.__ref.get());
        }
        else {
            if (Object.keys(data).length > 0)
                return true;
        }
    }
    else if (typeof data == 'string') {
        if (data.trim().length > 0)
            return true;
    }
    else if (typeof data == 'undefined') {
        return false;
    }
    else if (typeof data == 'number') {
        return !Number.isNaN(data);
    }
    return false;
};
const buildUrl = (path, query, pagiantion, template) => {
    let fullURL = path;
    if (query == null) {
        query = {};
    }
    if (pagiantion.size > 0) {
        if (template == 'yii2-data-provider') {
            query['number'] = pagiantion.offset + 1;
            query['page[number]'] = pagiantion.offset + 1;
            query['page[size]'] = pagiantion.size;
        }
    }
    fullURL += '?';
    const compileName = (names) => {
        let result = '';
        let index = 0;
        for (const value of names) {
            if (index == 0) {
                result = value;
                index += 1;
            }
            else {
                result += `[${value}]`;
            }
        }
        return result;
    };
    const proval = (inner, names) => {
        let mapOfQueryInne = [];
        for (const [key, value] of Object.entries(inner)) {
            names.push(key);
            if (aavalidata(value) == false)
                continue;
            if (typeof value == 'object') {
                if ('__wrt' in value) {
                    mapOfQueryInne.push(`${compileName(names)}=${value.__ref.get()}`);
                }
                else {
                    mapOfQueryInne.push(proval(value, names));
                }
            }
            else {
                mapOfQueryInne.push(`${compileName(names)}=${value}`);
            }
        }
        return mapOfQueryInne.join('&');
    };
    const mapOfQuery = [];
    for (const [key, value] of Object.entries(query)) {
        if (aavalidata(value) == false)
            continue;
        if (typeof value == 'object') {
            if ('__wrt' in value) {
                mapOfQuery.push(`${key}=${value.__ref.get()}`);
            }
            else {
                mapOfQuery.push(proval(value, [key]));
            }
        }
        else {
            mapOfQuery.push(`${key}=${value}`);
        }
    }
    fullURL += mapOfQuery.join('&');
    return fullURL;
};
const queryToApi = async (url, params, template) => {
    let raw = await config.request(url, params);
    let dry = JSON.parse(raw);
    if (template == 'yii2-data-provider') {
        if ('data' in dry) {
            if (Array.isArray(dry.data)) {
                return dry.data.map((value) => value.attributes);
            }
            return dry.data.attributes;
        }
    }
    return dry;
};
export const state = (value = null) => {
    let ref = null;
    const _A = new Proxy({ __wrt: [], __value: value }, {
        get(target, p, receiver) {
            if (p == '__wrt' || p == '__value') {
                return target[p];
            }
            else if (p == '__ref') {
                return ref;
            }
            else {
                return function (...kwargs) {
                    target.__wrt.push([p, kwargs]);
                    return _A;
                };
            }
        },
        set(target, p, newValue, receiver) {
            if (p == '__ref') {
                ref = newValue;
            }
            return true;
        },
    });
    return _A;
};
export const pin = (_data) => {
    let _target = {
        __obbsv: 1,
        value: config.init(_data.__value),
        get: () => {
            return config.get(_target.value);
        },
        set: (v) => {
            config.set(_target.value, v);
            if (_target._lockKick == false) {
                _target.subs.forEach((value) => {
                    value();
                });
            }
        },
        _lockKick: false,
        isSaving: config.init(false),
        api: {
            check: null,
            checkValue: '',
            once: true,
            path: '',
            method: "GET",
            customParams: {},
            auth: {
                login: '',
                password: ''
            },
            queryLinked: {},
            query: {},
            join: {
                object: null,
                name: ''
            },
            pagination: {
                append: false,
                size: 0,
                offset: 0,
                maxOffset: -1
            }
        },
        with: [],
        kick: null,
        subs: [],
        buxt: null,
        template: "",
        cache: {
            loaded: false,
            cacheType: "string",
            where: {
                isLocalStorage: false,
                isCache: false,
                isCooke: false
            },
            name: '',
            duration: 0,
        },
        type: 0
    };
    _data.__ref = _target;
    const _maps = [];
    const _isLoading = config.init(false);
    const apiOne = {
        __obbsv: 2,
        unlock: false,
        get(value) {
            _target.kick = () => {
                this.user().get(value);
            };
            if (this.unlock == false && Object.keys(this.value).length == 0 || _target.api.once == false || this.unlock) {
                if (_target.api.once && Object.keys(this.value).length != 0 && this.unlock == false) {
                    return config.get(_target.value);
                }
                config.set(_isLoading, true);
                let _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                let _path = _target.api.path;
                if (typeof value == 'object') {
                    _query = Object.assign(_query, value);
                }
                else {
                    if (_target.api.check != null) {
                        const inner = _target.api.check.get();
                        if (inner.length > 0) {
                            for (const part of inner) {
                                if (part[_target.api.checkValue] == value) {
                                    config.set(_target.value, part);
                                    return config.get(_target.value);
                                }
                            }
                        }
                    }
                    _path = addToPath(_path, value);
                }
                queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                    method: _target.api.method
                }, _target.api.customParams), _target.template).then(e => {
                    _target.set(e);
                    config.set(_isLoading, false);
                });
            }
            this.unlock = false;
            return config.get(_target.value);
        },
        getBy(name) {
            _target.kick = () => {
                this.user().getBy(name);
            };
            if (this.unlock == false && Object.keys(this.value).length == 0 || _target.api.once == false || this.unlock) {
                if (_target.api.once && Object.keys(this.value).length != 0 && this.unlock == false) {
                    return config.get(_target.value);
                }
                config.set(_isLoading, true);
                let _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                let _path = _target.api.path;
                const router = config.router();
                if (typeof name == 'object') {
                    const completeName = {};
                    for (const [key, value] of Object.entries(name)) {
                        let val = '';
                        if (router.currentRoute.value.params && value in router.currentRoute.value.params) {
                            val = router.currentRoute.value.params[value];
                        }
                        else if (router.currentRoute.value.query && value in router.currentRoute.value.query) {
                            val = router.currentRoute.value.query[value];
                        }
                        completeName[key] = val;
                    }
                    _query = Object.assign(_query, completeName);
                }
                else {
                    let val = '';
                    if (router.currentRoute.value.params && name in router.currentRoute.value.params) {
                        val = router.currentRoute.value.params[name];
                    }
                    else if (router.currentRoute.value.query && name in router.currentRoute.value.query) {
                        val = router.currentRoute.value.query[name];
                    }
                    if (_target.api.check != null) {
                        const inner = _target.api.check.get();
                        if (inner.length > 0) {
                            for (const part of inner) {
                                if (part[_target.api.checkValue] == val) {
                                    config.set(_target.value, part);
                                    return config.get(_target.value);
                                }
                            }
                        }
                    }
                    _path = addToPath(_path, val);
                }
                queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                    method: _target.api.method
                }, _target.api.customParams), _target.template).then(e => {
                    _target.set(e);
                    config.set(_isLoading, false);
                });
            }
            this.unlock = false;
            return config.get(_target.value);
        },
        send(body) {
            config.set(_isLoading, true);
            let _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
            let _path = _target.api.path;
            let parsedBody = body;
            if (typeof body == 'object') {
                try {
                    parsedBody = JSON.parse(body);
                }
                catch (e) {
                    parsedBody = body;
                }
            }
            queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                method: _target.api.method,
                body: parsedBody
            }, _target.api.customParams), _target.template).then(e => {
                _target.set(e);
                config.set(_isLoading, false);
            });
        },
        multipart(formData) {
            config.set(_isLoading, true);
            let _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
            let _path = _target.api.path;
            let parsedBody = formData;
            queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                method: _target.api.method,
                body: parsedBody
            }, _target.api.customParams), _target.template).then(e => {
                _target.set(e);
                config.set(_isLoading, false);
            });
        },
        sync() {
            return {
                async get(value) {
                    let _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                    let _path = _target.api.path;
                    if (typeof value == 'object') {
                        _query = Object.assign(_query, value);
                    }
                    else {
                        if (_target.api.check != null) {
                            const inner = _target.api.check.get();
                            if (inner.length > 0) {
                                for (const part of inner) {
                                    if (part[_target.api.checkValue] == value) {
                                        config.set(_target.value, part);
                                        return config.get(_target.value);
                                    }
                                }
                            }
                        }
                        _path = addToPath(_path, value);
                    }
                    return await queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                        method: _target.api.method
                    }, _target.api.customParams), _target.template);
                },
                async send(body) {
                    let _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                    let _path = _target.api.path;
                    let parsedBody = body;
                    if (typeof body == 'object') {
                        try {
                            parsedBody = JSON.parse(body);
                        }
                        catch (e) {
                            parsedBody = body;
                        }
                    }
                    return await queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                        method: _target.api.method,
                        body: parsedBody
                    }, _target.api.customParams), _target.template);
                },
                async multipart(formData) {
                    let _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                    let _path = _target.api.path;
                    let parsedBody = formData;
                    return await queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                        method: _target.api.method,
                        body: parsedBody
                    }, _target.api.customParams), _target.template);
                },
            };
        },
        method(type) {
            _target.api.method = type;
            return this;
        },
        setQuery(params) {
            _target.api.query = Object.assign(params, _target.api.query);
            return this;
        },
        user() {
            this.unlock = true;
            return this;
        }
    };
    const apiMany = {
        __obbsv: 2,
        unlock: false,
        all() {
            if (apiMany.unlock == false && apiMany.value.length == 0 || _target.api.once == false || apiMany.unlock) {
                if (_target.api.once && Object.keys(apiMany.value).length != 0 && apiMany.unlock == false) {
                    return config.get(_target.value);
                }
                config.set(_isLoading, true);
                let _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                let _path = _target.api.path;
                queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                    method: _target.api.method
                }, _target.api.customParams), _target.template).then(e => {
                    _target.set(e);
                    config.set(_isLoading, false);
                });
            }
            apiMany.unlock = false;
            _target.kick = () => {
                this.user().all();
            };
            return config.get(_target.value);
        },
        next() {
            if (this.unlock == false && this.value.length == 0 || _target.api.once == false || this.unlock) {
                if (_target.api.once && Object.keys(this.value).length != 0 && this.unlock == false) {
                    return config.get(_target.value);
                }
                config.set(_isLoading, true);
                _target.api.pagination.offset += 1;
                let _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                let _path = _target.api.path;
                queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                    method: _target.api.method
                }, _target.api.customParams), _target.template).then(e => {
                    if (_target.api.pagination.append) {
                        _target.set(_target.get().concat(e));
                        config.set(_isLoading, false);
                    }
                    else {
                        _target.set(e);
                        config.set(_isLoading, false);
                    }
                });
            }
            this.unlock = false;
        },
        prev() {
            if (this.unlock == false && this.value.length == 0 || _target.api.once == false || this.unlock) {
                if (_target.api.once && Object.keys(this.value).length != 0 && this.unlock == false) {
                    return config.get(_target.value);
                }
                config.set(_isLoading, true);
                _target.api.pagination.offset -= 1;
                let _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                let _path = _target.api.path;
                queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                    method: _target.api.method
                }, _target.api.customParams), _target.template).then(e => {
                    _target.set(e);
                    config.set(_isLoading, false);
                });
            }
            this.unlock = false;
        },
        page(number) {
            if (this.unlock == false && this.value.length == 0 || _target.api.once == false || this.unlock) {
                if (_target.api.once && Object.keys(this.value).length != 0 && this.unlock == false) {
                    return config.get(_target.value);
                }
                config.set(_isLoading, true);
                _target.set([]);
                _target.api.pagination.offset = number - 1;
                let _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                let _path = _target.api.path;
                queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                    method: _target.api.method
                }, _target.api.customParams), _target.template).then(e => {
                    _target.set(e);
                    config.set(_isLoading, false);
                });
            }
            this.unlock = false;
        },
        size(sze) {
            _target.api.pagination.size = sze;
            return this;
        },
        pageBy(name) {
            if (this.unlock == false && this.value.length == 0 || _target.api.once == false || this.unlock) {
                if (_target.api.once && Object.keys(this.value).length != 0 && this.unlock == false) {
                    return config.get(_target.value);
                }
                config.set(_isLoading, true);
                _target.set([]);
                const router = config.router();
                let val = 0;
                if (router.currentRoute.value.params && name in router.currentRoute.value.params) {
                    val = Number.parseInt(router.currentRoute.value.params[name]);
                }
                else if (router.currentRoute.value.query && name in router.currentRoute.value.query) {
                    val = Number.parseInt(router.currentRoute.value.query[name]);
                }
                _target.api.pagination.offset = val - 1;
                let _query = Object.assign({}, _target.api.query, _target.api.queryLinked);
                let _path = _target.api.path;
                queryToApi(buildUrl(_path, _query, _target.api.pagination, _target.template), Object.assign({
                    method: _target.api.method
                }, _target.api.customParams), _target.template).then(e => {
                    _target.set(e);
                    config.set(_isLoading, false);
                });
            }
            this.unlock = false;
        },
        reset() {
            if (this.unlock == false && this.value.length == 0 || _target.api.once == false || this.unlock) {
                if (_target.api.once && Object.keys(this.value).length != 0 && this.unlock == false) {
                    return config.get(_target.value);
                }
                _target.api.pagination.offset = 0;
                _target.set([]);
            }
            this.unlock = false;
        },
        setQuery(params) {
            _target.api.query = Object.assign(params, _target.api.query);
            return this;
        },
        user() {
            this.unlock = true;
            return this;
        }
    };
    for (const doOf of _data.__wrt) {
        const args = doOf[1];
        switch (doOf[0]) {
            case "reload":
                _target.api.once = false;
                break;
            case "api":
                _target.type = 1;
                if (typeof args[0] == 'object') {
                    _target.api.path = args[0].path;
                    _target.api.query = args[0].query;
                }
                else {
                    _target.api.path = args[0];
                }
                break;
            case "keep":
                _target.type = 2;
                _target.cache.name = args[0];
                _target.cache.duration = args[1];
                break;
            case "cacheType":
                _target.cache.cacheType = args[0];
                break;
            case "template":
                _target.template = args[0];
                break;
            case "pagination":
                _target.api.pagination.size = args[0];
                if (args.length > 1)
                    _target.api.pagination.append = args[1];
                break;
            case "map":
                _maps.push(args[0]);
                break;
            case "place":
                if (!Array.isArray(args[0])) {
                    args[0] = [args[0]];
                }
                _target.cache.where.isLocalStorage = false;
                _target.cache.where.isCooke = false;
                _target.cache.where.isCache = false;
                for (const a of args[0]) {
                    if (a == 'localStorage') {
                        _target.cache.where.isLocalStorage = true;
                    }
                    else if (a == 'cache') {
                        _target.cache.where.isCache = true;
                    }
                    else {
                        _target.cache.where.isCooke = true;
                    }
                }
                break;
            case "join":
                let objectJoin = args[0];
                if (typeof objectJoin == 'string') {
                    const data = objectJoin.split('.');
                    objectJoin = { __ref: StateManager.manager(data[0]).getParams(data[1]) };
                }
                if (objectJoin.__ref.type == 1) {
                    if (_data.__wrt[_data.__wrt.length - 1][0] == 'one') {
                        _target.api.check = objectJoin.__ref;
                        _target.api.once = false;
                        if (args.length > 1) {
                            _target.api.checkValue = args[1];
                        }
                    }
                    else {
                        _target.with.push({ name: objectJoin.__ref, field: args[1] });
                    }
                }
                else {
                    objectJoin.__ref.subs.push(() => {
                        if (_target.kick != null) {
                            _target.kick();
                        }
                    });
                }
                break;
            case "joinToQuery":
                {
                    let objectJoin = args[1];
                    if (typeof objectJoin == 'string') {
                        const data = objectJoin.split('.');
                        objectJoin = { __ref: StateManager.manager(data[0]).getParams(data[1]), __wrt: [] };
                    }
                    if (objectJoin.__ref.type == 2 || objectJoin.__ref.type == 0) {
                        _target.api.queryLinked[args[0]] = objectJoin;
                    }
                }
                break;
            case "auth":
                if (typeof args[0] == 'object') {
                }
                _target.api.auth.login = args[0];
                _target.api.auth.password = args[1];
                break;
            case "one":
                if (_target.type == 1) {
                    if (config.get(_target.value) == null) {
                        config.set(_target.value, {});
                    }
                    Object.defineProperty(apiOne, 'value', {
                        get() {
                            return _target.get();
                        },
                        set(v) {
                            _target.set(v);
                        },
                    });
                    Object.defineProperty(apiOne, 'isLoading', {
                        get() {
                            return config.get(_isLoading);
                        },
                    });
                    return apiOne;
                }
                else if (_target.type == 2) {
                    _target.set = (v) => {
                        if (typeof localStorage !== 'undefined') {
                            if (_target.cache.where.isLocalStorage) {
                                if (typeof v == 'object') {
                                    v = JSON.parse(v);
                                }
                                localStorage[_target.cache.name] = v;
                                if (_target.cache.duration != 0 && _target.cache.duration != Infinity) {
                                    localStorage[_target.cache.name + "_exp"] = Date.now() + _target.cache.duration;
                                }
                            }
                        }
                        if (_target.cache.where.isCooke) {
                            if (typeof v == 'object') {
                                throw "Object cannot be keep in Cookie";
                            }
                            let expr = undefined;
                            if (_target.cache.duration != 0 && _target.cache.duration != Infinity) {
                                expr = Date.now() + _target.cache.duration;
                            }
                            config.saveCookie(_target.cache.name, v, expr);
                        }
                        if (typeof caches !== 'undefined') {
                            if (_target.cache.where.isCache) {
                                config.set(_target.isSaving, true);
                                caches.open("caching").then(e => {
                                    const reponse = new Response(v);
                                    e.put(_target.cache.name, reponse).then(e => {
                                        config.set(_target.isSaving, false);
                                    });
                                });
                                if (_target.cache.duration != 0 && _target.cache.duration != Infinity) {
                                    localStorage[_target.cache.name + "_exp"] = Date.now() + _target.cache.duration;
                                }
                            }
                        }
                        config.set(_target.value, v);
                        setTimeout(() => {
                            _target.subs.forEach((value) => {
                                value();
                            });
                        }, 50);
                    };
                    _target.get = () => {
                        if (_target.cache.where.isCooke) {
                            if (_target.cache.loaded == false) {
                                config.set(_target.value, config.getCookie(_target.cache.name));
                                _target.cache.loaded == true;
                            }
                        }
                        else if (_target.cache.where.isLocalStorage) {
                            if (_target.cache.loaded == false) {
                                config.set(_target.value, localStorage[_target.cache.name]);
                                _target.cache.loaded == true;
                            }
                        }
                        else {
                            if (_target.cache.loaded == false) {
                                caches.open("vue-power-store").then(e => {
                                    e.match(_target.cache.name).then(e => {
                                        if (_target.cache.cacheType == 'string') {
                                            e?.text().then(e => {
                                                config.set(_target.value, e);
                                            });
                                        }
                                        else if (_target.cache.cacheType == 'number') {
                                            e?.text().then(e => {
                                                config.set(_target.value, Number.parseFloat(e));
                                            });
                                        }
                                        else if (_target.cache.cacheType == 'json') {
                                            e?.json().then(e => {
                                                config.set(_target.value, e);
                                            });
                                        }
                                        else if (_target.cache.cacheType == 'blob') {
                                            e?.blob().then(e => {
                                                config.set(_target.value, e);
                                            });
                                        }
                                        else if (_target.cache.cacheType == 'arrayBuffer') {
                                            e?.arrayBuffer().then(e => {
                                                config.set(_target.value, e);
                                            });
                                        }
                                        _target.cache.loaded == true;
                                    });
                                });
                            }
                        }
                        return config.get(_target.value);
                    };
                    return _target;
                }
                return _target;
                break;
            case "many":
                if (_target.type == 1) {
                    if (_target.get() == null) {
                        _target.set([]);
                    }
                    Object.defineProperty(apiMany, 'value', {
                        get() {
                            return _target.get();
                        },
                        set(v) {
                            _target.set(v);
                        },
                    });
                    Object.defineProperty(apiMany, 'isLoading', {
                        get() {
                            return config.get(_isLoading);
                        },
                    });
                    if (_target.api.pagination.size > 0) {
                        _target.kick = () => {
                            apiMany.user().page(1);
                        };
                    }
                    return apiMany;
                }
                return _target;
                break;
        }
    }
    return _target;
};
const _instances = new Map();
const _earlyInstances = [];
export default class StateManager {
    _nameInstance = "";
    _isServer = false;
    _paramsObjects = new Map();
    constructor(name = null) {
        this._nameInstance = this.constructor.name;
        if (name != null) {
            this._nameInstance = name;
        }
        if (_instances.has(this._nameInstance) == false) {
            _instances.set(this._nameInstance, null);
            const server = new this.constructor();
            _instances.set(this._nameInstance, server);
        }
        this._isServer = _instances.get(this._nameInstance) == null;
    }
    static manager(name) {
        return _instances.get(name);
    }
    getParams(name) {
        return this._paramsObjects.get(name);
    }
    manage() {
        const names = Object.getOwnPropertyNames(this);
        const getServer = _instances.get(this._nameInstance);
        for (const name of names) {
            if (this._isServer) {
                const objectGet = this[name];
                if (typeof objectGet == 'object' && '__wrt' in objectGet) {
                    const dataContains = pin(objectGet);
                    dataContains.buxt = this;
                    if (dataContains.__obbsv == 1) {
                        Object.defineProperty(this, name, {
                            get() {
                                return dataContains.get();
                            },
                            set(v) {
                                dataContains.set(v);
                            }
                        });
                        if (dataContains.type == 2) {
                            dataContains.get();
                        }
                        this._paramsObjects.set(name, dataContains);
                    }
                    else {
                        Object.defineProperty(this, name, {
                            get() {
                                return dataContains;
                            }
                        });
                        this._paramsObjects.set(name, dataContains);
                    }
                }
            }
            else {
                const objectGet = this[name];
                if (typeof objectGet == 'object' && '__wrt' in objectGet) {
                    Object.defineProperty(this, name, {
                        get() {
                            return getServer[name];
                        },
                        set(v) {
                            getServer[name] = v;
                        }
                    });
                }
            }
        }
    }
    name() {
        return this._nameInstance;
    }
}
export class FormModel extends StateManager {
    _fields = {};
    createForm(description) {
        if (this._isServer) {
            this._fields = description;
        }
        else {
            const context = _instances.get(this.name());
            Object.defineProperty(this, '_fields', {
                get() {
                    return context._fields;
                },
            });
        }
    }
    get formData() {
        const form = new FormData();
        for (const [key, value] of Object.entries(this._fields)) {
            form.append(key, value.value.value);
        }
        return form;
    }
    get form() {
        return this._fields;
    }
    getValues() { }
    setValues(data) {
        if ('value' in data) {
        }
        else {
            for (const [key, value] of Object.entries(data)) {
                this._fields[key].value.value = value;
            }
        }
    }
    validate() {
        let result = true;
        for (const [key, value] of Object.entries(this._fields)) {
            if (value.validate != null) {
                const argv = [];
                if (value.validate instanceof ValidateRange) {
                    if (value.options.min)
                        argv.push(value.options.min);
                    else
                        argv.push(null);
                    if (value.options.max)
                        argv.push(value.options.max);
                    else
                        argv.push(null);
                }
                else if (value.validate instanceof ValidateGreater) {
                    if (value.options.max)
                        argv.push(value.options.max);
                }
                else if (value.validate instanceof ValidateLess) {
                    if (value.options.min)
                        argv.push(value.options.min);
                }
                if (!value.validate.behaviour(value.value.value, ...argv)) {
                    result = false;
                }
            }
        }
        return result;
    }
    localValidate(name) {
        const data = this._fields[name];
        if (data.validate != null) {
            const argv = [];
            if (data.validate == ValidateRange) {
                if (data.options.min)
                    argv.push(data.options.min);
                else
                    argv.push(null);
                if (data.options.max)
                    argv.push(data.options.max);
                else
                    argv.push(null);
            }
            else if (data.validate == ValidateGreater) {
                if (data.options.max)
                    argv.push(data.options.max);
            }
            else if (data.validate == ValidateLess) {
                if (data.options.min)
                    argv.push(data.options.min);
            }
            if (data.validate.behaviour(data.value.value, ...argv)) {
                data.options.validateMessage.value = "";
            }
            else {
                data.options.validateMessage.value = data.validate.getMessage(...argv);
            }
        }
    }
    get field() {
        return {
            text(title, options) {
                const data = {
                    type: 'basic',
                    value: ref(""),
                    title: title,
                    options: {
                        ...options,
                        validateMessage: ref("")
                    },
                    validate: null
                };
                if (options.validate) {
                    data['validate'] = options.validate;
                }
                if (options.multiline) {
                    data.type = 'multiline';
                }
                return data;
            },
            email(title, options) {
                return {
                    type: 'email',
                    value: ref(""),
                    title: title,
                    options: {
                        ...options,
                        validateMessage: ref("")
                    },
                    validate: ValidateEmail
                };
            },
            tel(title, prefix = "+1") {
                return {
                    type: 'tel',
                    value: ref(""),
                    title: title,
                    options: {
                        prefix: prefix,
                        validateMessage: ref("")
                    },
                    validate: ValidateTelephone
                };
            },
            number(title, options) {
                const data = {
                    type: 'number',
                    value: ref(0),
                    title: title,
                    options: {
                        ...options,
                        validateMessage: ref("")
                    },
                    validate: null
                };
                if (options.validate) {
                    data['validate'] = options.validate;
                }
                return data;
            },
            checkbox(title, validate) {
                const data = {
                    type: 'checkbox',
                    value: ref(false),
                    title: title,
                    options: {
                        validateMessage: ref("")
                    },
                    validate: null
                };
                if (validate) {
                    data['validate'] = validate;
                }
                return data;
            }
        };
    }
}
