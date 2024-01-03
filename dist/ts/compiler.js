import Filter from "./Filter/index.js";
import StateManager from "./StateManager/index.js";
import { config, _defaults } from "./config.js";
import { addToPath, buildUrl, queryToApi } from "./utilits.js";
export default class CompositionBuilder {
    _currentArgs = [];
    static instruction(defaultValue) {
        let compiledObject = null;
        const anonInstruction = new Proxy({ __wrt: [], __value: defaultValue }, {
            get(target, p, receiver) {
                if (p == '__wrt' || p == '__value') {
                    return target[p];
                }
                else if (p == '__ref') {
                    return compiledObject;
                }
                else {
                    return function (...kwargs) {
                        target.__wrt.push([p, kwargs]);
                        return anonInstruction;
                    };
                }
            },
            set(target, p, newValue, receiver) {
                if (p == '__ref') {
                    compiledObject = newValue;
                }
                return true;
            },
        });
        return anonInstruction;
    }
    compile(instruction) {
        const mainComposition = this.composition();
        mainComposition.__default = instruction.__value;
        mainComposition.__value = config.init(instruction.__value);
        mainComposition.get = () => config.get(mainComposition.__value);
        mainComposition.set = (v) => {
            config.set(mainComposition.__value, v);
            mainComposition.subs.forEach((value) => {
                value();
            });
        };
        mainComposition.__obbsv = 0;
        mainComposition.subs = [() => {
                mainComposition.onceSubs.forEach((value) => {
                    value();
                });
                mainComposition.onceSubs = [];
            }];
        mainComposition.onceSubs = [];
        mainComposition.lastStep = () => { };
        mainComposition.call = {};
        instruction.__ref = mainComposition;
        for (const doOf of instruction.__wrt) {
            this._currentArgs = doOf[1];
            const name = (doOf[0][0].toLocaleUpperCase()) + (doOf[0].slice(1));
            const answer = this[`do${name}`](mainComposition, this._currentArgs);
            if (typeof answer !== 'undefined' && answer != null) {
                return answer;
            }
        }
    }
    callPart(name, composition) {
        if (name in composition.call) {
            composition.call[name]();
        }
    }
    subsToPart(name, composition, func, awake = false) {
        composition.call[name] = func;
        if (awake)
            func();
    }
    createWay(name, composition, data) {
        return this[`way${name}${data}`](composition, data);
    }
    composition() { return {}; }
    setType(composition, value) {
        composition.__obbsv = value;
        return this;
    }
    argument(index, method) {
        if (Array.isArray(this._currentArgs) && this._currentArgs.length > index) {
            method(this._currentArgs[index]);
        }
    }
    argumentExist(index) {
        return Array.isArray(this._currentArgs) && this._currentArgs.length > index;
    }
    dynamicAdd(composition, name, value) {
        composition[name] = value;
        return this;
    }
}
export class StateComposition extends CompositionBuilder {
    raiseMethod(composition, name, args, func) {
        if (name in composition.hook) {
            let result = composition.hook[name](...args);
            if (typeof result != 'undefined' && func) {
                func(result);
            }
        }
    }
    subsMethod(composition, name, func) {
        composition.hook[name] = func;
    }
    compileQuery(composition) {
        let query = Object.assign({}, composition.api.query, composition.api.userQuery);
        if (composition.api.pagination.size > 0) {
            if (composition.template == 'yii2-data-provider') {
                query['page[number]'] = composition.api.pagination.offset;
                query['page[size]'] = composition.api.pagination.size;
            }
        }
        for (const filterLink of composition.api.filters) {
            const fquery = Filter.filter(filterLink);
            query = Object.assign(query, fquery);
        }
        for (const [key, val] of Object.entries(composition.api.joined.query)) {
            if (typeof val == 'object') {
                query[key] = val.object.getParams(val.field).get();
            }
            else {
                query[key] = val;
            }
        }
        return query;
    }
    doApi(composition, args) {
        let _template = '';
        if ('template' in _defaults) {
            _template = _defaults.template;
        }
        this.setType(composition, 2)
            .dynamicAdd(composition, 'api', {
            watching: false,
            path: '',
            query: {},
            userQuery: {},
            method: "GET",
            auth: {
                use: false,
                login: '',
                password: ''
            },
            filters: [],
            localFilters: [],
            joined: {
                query: {}
            },
            customParams: {},
            optimization: {
                preventRepeat: true,
            },
            pagination: {
                append: false,
                size: 0,
                offset: 0,
                maxOffset: 99999
            }
        })
            .dynamicAdd(composition, 'parent', null)
            .dynamicAdd(composition, 'hook', {})
            .dynamicAdd(composition, 'template', _template)
            .dynamicAdd(composition, 'convert', {
            map: [],
            sort: [],
            has: [],
            isFlat: false
        });
        if (typeof args[0] == 'object') {
            composition.api.path = args[0].path;
            composition.api.query = args[0].query;
        }
        else {
            composition.api.path = args[0];
        }
    }
    doKeep(composition, args) {
        this.setType(composition, 1)
            .dynamicAdd(composition, 'cache', {
            loaded: false,
            type: "string",
            where: {
                isLocalStorage: false,
                isCache: false,
                isCookie: false
            },
            name: args[0],
            duration: args[1],
            safe: async () => {
                if (composition.cache.where.isCookie) {
                    if (config.getCookie(composition.cache.name) == null) {
                        config.saveCookie(composition.cache.name, composition.__default, undefined);
                    }
                }
                else if (composition.cache.where.isLocalStorage) {
                    if (!(composition.cache.name in localStorage)) {
                        localStorage[composition.cache.name] = composition.__default;
                    }
                }
            }
        });
    }
    doPlace(composition, args) {
        if (!Array.isArray(args[0])) {
            args[0] = [args[0]];
        }
        composition.cache.where.isLocalStorage = false;
        composition.cache.where.isCookie = false;
        composition.cache.where.isCache = false;
        for (const a of args[0]) {
            if (a == 'localStorage') {
                composition.cache.where.isLocalStorage = true;
            }
            else if (a == 'cache') {
                composition.cache.where.isCache = true;
            }
            else {
                composition.cache.where.isCookie = true;
            }
        }
    }
    doTemplate(composition, args) {
        composition.template = args[0];
    }
    doPagination(composition, args) {
        composition.api.pagination.size = args[0];
        this.argument(1, (value) => {
            composition.api.pagination.append = value;
        });
    }
    doHook(composition, args) {
        this.subsMethod(composition, args[0], args[1]);
    }
    doMap(composition, args) {
        composition.convert.map.push(args[0]);
    }
    doSort(composition, args) {
        composition.convert.sort.push(args[0]);
    }
    doHas(composition, args) {
        composition.convert.has.push(args[0]);
    }
    doFlat(composition, args) {
        composition.convert.isFlat = true;
    }
    doReload(composition, args) {
        composition.api.optimization.preventRepeat = false;
    }
    doFilter(composition, args) {
        if (this.argumentExist(1)) {
            if (typeof args[1] == 'string') {
                if (args[1] == 'emit-always') {
                    composition.api.filters.push(args[0]);
                    const object = Filter.instance(args[0]);
                    object.on(() => {
                        composition.lastStep();
                    });
                }
                else if (args[1] == 'emit-localy') {
                    composition.api.localFilters.push(args[0]);
                }
                else {
                    console.error(`state.filter(${args[0]}, ${args[1]}); cmd is empty set, 'emit-always', 'emit-localy'`);
                }
            }
            else if (typeof args[1] == 'boolean') {
                if (args[1]) {
                    composition.api.localFilters.push(args[0]);
                }
                else {
                    composition.api.filters.push(args[0]);
                }
            }
        }
        else {
            composition.api.filters.push(args[0]);
        }
    }
    doAuth(composition, args) {
        composition.api.auth.use = true;
        composition.api.auth.login = args[0];
        composition.api.auth.password = args[1];
    }
    doJoin(composition, args) {
        if (typeof args[0] == 'string') {
            const delimeter = args[0].split('.');
            try {
                composition.api.watching = true;
                if (this.argumentExist(1)) {
                    if (args[1] == 'only-filter') {
                        StateManager.manager(delimeter[0].trim()).getParams(delimeter[1].trim())
                            .subs.push(() => {
                            this.callPart('filter', composition);
                        });
                    }
                    else if (args[1] == 'only-sort') {
                        StateManager.manager(delimeter[0].trim()).getParams(delimeter[1].trim())
                            .subs.push(() => {
                            this.callPart('sort', composition);
                        });
                    }
                    else if (args[1] == 'only-process') {
                        StateManager.manager(delimeter[0].trim()).getParams(delimeter[1].trim())
                            .subs.push(() => {
                            this.callPart('proccess', composition);
                        });
                    }
                }
                else {
                    StateManager.manager(delimeter[0].trim()).getParams(delimeter[1].trim())
                        .subs.push(() => {
                        setTimeout(() => {
                            composition.lastStep();
                        }, 100);
                    });
                }
            }
            catch (e) {
                console.error(args[0] + ' not exist. Maybe not init');
            }
        }
        else {
            if (args[0].__ref.__obbsv == 2) {
                composition.parent = args[0].__ref;
                composition.api.linkMethod = args[1];
                composition.api.optimization.preventRepeat = false;
                args[0].__ref.subs.push(() => {
                    setTimeout(() => {
                        if (Object.keys(composition.get()).length != 0) {
                            composition.lastStep();
                        }
                    }, 50);
                });
            }
            else {
                composition.api.watching = true;
                if (this.argumentExist(1)) {
                    if (args[1] == 'only-filter') {
                        args[0].__ref.subs.push(() => {
                            this.callPart('filter', composition);
                        });
                    }
                    else if (args[1] == 'only-sort') {
                        args[0].__ref.subs.push(() => {
                            this.callPart('sort', composition);
                        });
                    }
                    else if (args[1] == 'only-process') {
                        args[0].__ref.subs.push(() => {
                            this.callPart('proccess', composition);
                        });
                    }
                }
                else {
                    args[0].__ref.subs.push(() => {
                        setTimeout(() => {
                            composition.lastStep();
                        }, 100);
                    });
                }
            }
        }
    }
    doJoinToQuery(composition, args) {
        if (typeof args[1] == 'string') {
            try {
                const delimeter = args[1].split('.');
                const objt = StateManager.manager(delimeter[0].trim());
                composition.api.joined.query[args[0]] = {
                    object: objt,
                    field: delimeter[1].trim()
                };
            }
            catch (e) {
                console.log(args[1] + " not found. Maybe not init");
            }
        }
        else {
            composition.api.joined.query[args[0]] = args[1];
        }
    }
    doCacheType(composition, args) {
        composition.cache.type = args[0];
    }
    // Cache for API
    doCache(composition, args) {
        this.dynamicAdd(composition, 'cache', {
            loaded: false,
            type: "json",
            where: {
                isLocalStorage: false,
                isCache: true,
                isCookie: false
            },
            name: "dynamic",
            duration: args[0],
            safe: async () => { }
        });
    }
    // Segment doOne
    doOne(composition, args) {
        return this.createWay('One', composition, composition.__obbsv);
    }
    // Segment doOne
    // if api()
    wayOne2(composition, val) {
        const _pthis = this;
        const _fetching = config.init(false);
        if (composition.get() == null)
            composition.set({});
        const get = async (value) => {
            let query = _pthis.compileQuery(composition);
            let path = composition.api.path;
            if (typeof value != 'object') {
                if (composition.parent != null) {
                    for (const part of composition.parent.get()) {
                        if (part[composition.api.linkMethod] == value) {
                            return part;
                        }
                    }
                }
                path = addToPath(path, value);
            }
            else {
                query = Object.assign(query, value);
            }
            let url = buildUrl(path, query, {}, composition.template);
            let params = Object.assign({ method: composition.api.method }, composition.api.customParams);
            return await queryToApi(url, params, composition.template, composition);
        };
        const send = async (body, multipart = false) => {
            let query = _pthis.compileQuery(composition);
            let path = composition.api.path;
            if (typeof body == 'object' && multipart == false) {
                try {
                    body = JSON.stringify(body);
                }
                catch (e) { }
            }
            let url = buildUrl(path, query, {}, composition.template);
            let params = Object.assign({ method: composition.api.method, body: body, headers: {
                    'Content-Type': multipart ? undefined : 'application/json'
                } }, composition.api.customParams);
            return await queryToApi(url, params, composition.template, composition);
        };
        const property = {
            __obbsv: 2,
            _forceMode: false,
            get(value) {
                composition.lastStep = () => { property.user().get(value); };
                if (this._forceMode == false && composition.api.optimization.preventRepeat) {
                    if (Object.keys(composition.get()).length > 0) {
                        return composition.get();
                    }
                }
                config.set(_fetching, true);
                _pthis.raiseMethod(composition, 'on awake', []);
                get(value).then((ival) => {
                    _pthis.raiseMethod(composition, 'before process', [ival], (res) => {
                        ival = res;
                    });
                    composition.convert.map.forEach((value) => {
                        ival = value(ival);
                    });
                    _pthis.raiseMethod(composition, 'after process', [ival], (res) => {
                        ival = res;
                    });
                    _pthis.raiseMethod(composition, 'on end', [ival], (res) => {
                        ival = res;
                    });
                    composition.set(ival);
                    config.set(_fetching, false);
                });
                this._forceMode = false;
                return composition.get();
            },
            getBy(param) {
                composition.lastStep = () => { property.user().getBy(param); };
                if (this._forceMode == false && composition.api.optimization.preventRepeat) {
                    if (Object.keys(composition.get()).length > 0) {
                        return composition.get();
                    }
                }
                config.set(_fetching, true);
                let query = _pthis.compileQuery(composition);
                let path = composition.api.path;
                const router = config.router();
                if (typeof param == 'object') {
                    for (const [key, value] of Object.entries(param)) {
                        if (router.currentRoute.value.params && value in router.currentRoute.value.params) {
                            query[key] = router.currentRoute.value.params[value];
                        }
                        else if (router.currentRoute.value.query && value in router.currentRoute.value.query) {
                            query[key] = router.currentRoute.value.query[value];
                        }
                    }
                }
                else {
                    let val = '';
                    if (router.currentRoute.value.params && param in router.currentRoute.value.params)
                        val = router.currentRoute.value.params[param];
                    else if (router.currentRoute.value.query && param in router.currentRoute.value.query)
                        val = router.currentRoute.value.query[param];
                    if (composition.parent != null) {
                        for (const part of composition.parent.get()) {
                            if (part[composition.api.linkMethod] == val) {
                                config.set(_fetching, false);
                                composition.set(part);
                                return composition.get();
                            }
                        }
                    }
                    path = addToPath(path, val);
                }
                let url = buildUrl(path, query, {}, composition.template);
                let params = Object.assign({ method: composition.api.method }, composition.api.customParams);
                _pthis.raiseMethod(composition, 'on awake', []);
                queryToApi(url, params, composition.template, composition).then((ival) => {
                    _pthis.raiseMethod(composition, 'before process', [ival], (res) => {
                        ival = res;
                    });
                    composition.convert.map.forEach((value) => {
                        ival = value(ival);
                    });
                    _pthis.raiseMethod(composition, 'after process', [ival], (res) => {
                        ival = res;
                    });
                    _pthis.raiseMethod(composition, 'on end', [ival], (res) => {
                        ival = res;
                    });
                    composition.set(ival);
                    config.set(_fetching, false);
                });
                this._forceMode = false;
                return composition.get();
            },
            send(body) {
                config.set(_fetching, true);
                send(body).then((ival) => {
                    composition.set(ival);
                    config.set(_fetching, false);
                });
            },
            multipart(formData) {
                config.set(_fetching, true);
                send(formData, true).then((ival) => {
                    composition.set(ival);
                    config.set(_fetching, false);
                });
            },
            sync() {
                return {
                    async send(body) {
                        return await send(body);
                    },
                    async multipart(formData) {
                        return await send(formData, true);
                    },
                    async get(value) {
                        return await get(value);
                    }
                };
            },
            method(type) {
                composition.api.method = type;
                return this;
            },
            setQuery(params) {
                composition.api.query = params;
                return this;
            },
            user() {
                this._forceMode = true;
                return this;
            }
        };
        Object.defineProperty(property, 'value', {
            get() { return composition.get(); },
            set(v) { composition.set(v); },
        });
        Object.defineProperty(property, 'isLoading', {
            get() { return config.get(_fetching); },
        });
        return property;
    }
    // Segment doOne
    // if keep()
    wayOne1(composition, val) {
        composition.get = () => {
            if (composition.cache.where.isCookie && composition.cache.loaded == false) {
                const cook = config.getCookie(composition.cache.name);
                if (cook != null && typeof cook != 'undefined') {
                    config.set(composition.__value, cook);
                }
                else {
                    setTimeout(() => {
                        config.set(composition.__value, config.getCookie(composition.cache.name));
                    }, 100);
                }
                composition.cache.loaded = true;
            }
            else if (typeof localStorage !== 'undefined'
                && composition.cache.where.isLocalStorage
                && composition.cache.loaded == false) {
                if (composition.cache.type == 'json') {
                    const data = localStorage[composition.cache.name];
                    if (data != '') {
                        config.set(composition.__value, JSON.parse(localStorage[composition.cache.name]));
                    }
                }
                else {
                    config.set(composition.__value, localStorage[composition.cache.name]);
                }
                composition.cache.loaded = true;
            }
            else if (typeof caches !== 'undefined'
                && composition.cache.where.isCache
                && composition.cache.loaded == false) {
                caches.open('storage').then(e => {
                    e.match(composition.cache.name).then((e) => {
                        switch (composition.cache.type) {
                            case "string":
                                e?.text().then(e => {
                                    config.set(composition.__value, e);
                                });
                                break;
                            case "number":
                                e?.text().then(e => {
                                    config.set(composition.__value, Number.parseFloat(e));
                                });
                                break;
                            case "arrayBuffer":
                                e?.arrayBuffer().then(e => {
                                    config.set(composition.__value, e);
                                });
                                break;
                            case "blob":
                                e?.blob().then(e => {
                                    config.set(composition.__value, e);
                                });
                                break;
                            case "json":
                                e?.json().then(e => {
                                    config.set(composition.__value, e);
                                });
                                break;
                        }
                        composition.cache.loaded = true;
                    });
                });
            }
            return config.get(composition.__value);
        };
        composition.set = (v) => {
            if (composition.cache.where.isCookie) {
                if (typeof v == 'object' || Array.isArray(v))
                    throw "Object cannot be keep in Cookie";
                let expr = undefined;
                if (composition.cache.duration != 0 && composition.cache.duration != Infinity)
                    expr = Date.now() + composition.cache.duration;
                config.saveCookie(composition.cache.name, v, expr);
            }
            if (typeof localStorage !== 'undefined' && composition.cache.where.isLocalStorage) {
                let result = v;
                if (typeof v == 'object' || Array.isArray(v))
                    result = JSON.stringify(v);
                localStorage[composition.cache.name] = result;
                if (composition.cache.duration != 0 && composition.cache.duration != Infinity)
                    localStorage[composition.cache.name + "_exp"] = Date.now() + composition.cache.duration;
            }
            if (typeof caches !== 'undefined' && composition.cache.where.isCache) {
                caches.open('storage').then(e => {
                    const reponse = new Response(v);
                    e.put(composition.cache.name, reponse);
                });
            }
            config.set(composition.__value, v);
            setTimeout(() => {
                composition.subs.forEach((value) => {
                    value();
                });
            }, 50);
        };
        return composition;
    }
    // Segment doOne
    // if nobody
    wayOne0(composition, val) {
        return composition;
    }
    // Segment doMany
    doMany(composition, args) {
        return this.createWay('Many', composition, composition.__obbsv);
    }
    // Segment doOne
    // if api()
    wayMany2(composition, val) {
        const _pthis = this;
        const _fetching = config.init(false);
        const _isEnd = config.init(false);
        const _originalValue = config.init([]);
        const _allInstances = [];
        const _max = config.init(0);
        const _current = config.init(1);
        const updateFilter = () => {
            composition.set(config.get(_originalValue)
                .filter((value) => {
                for (const Filter of _allInstances) {
                    if (Filter.resolve(value) == false)
                        return false;
                }
                return true;
            }));
        };
        this.subsToPart('filter', composition, () => {
            updateFilter();
        });
        const localFilterEnabled = composition.api.localFilters.length > 0;
        const setValue = (result) => {
            if (localFilterEnabled) {
                config.set(_originalValue, result);
                updateFilter();
            }
            else {
                composition.set(result);
            }
        };
        for (const filter of composition.api.localFilters) {
            const object = Filter.instance(filter);
            object.on(() => {
                updateFilter();
            });
            _allInstances.push(object);
        }
        if (composition.get() == null)
            composition.set([]);
        const property = {
            __obbsv: 2,
            _forceMode: false,
            all() {
                composition.lastStep = () => { property.user().all(); };
                if (this._forceMode == false && composition.api.optimization.preventRepeat) {
                    if (Object.keys(composition.get()).length > 0) {
                        return composition.get();
                    }
                }
                config.set(_fetching, true);
                let query = _pthis.compileQuery(composition);
                let path = composition.api.path;
                let url = buildUrl(path, query, {}, composition.template);
                let params = Object.assign({ method: composition.api.method }, composition.api.customParams);
                _pthis.raiseMethod(composition, 'on awake', []);
                try {
                    queryToApi(url, params, composition.template, composition).then((ival) => {
                        _pthis.subsToPart('proccess', composition, () => {
                            _pthis.raiseMethod(composition, 'before process', [ival], (res) => { ival = res; });
                            composition.convert.map.forEach((value) => {
                                ival = ival.map(value);
                            });
                            if (composition.convert.isFlat) {
                                ival = ival.flat();
                            }
                            let iValPost = ival;
                            _pthis.subsToPart('sort', composition, () => {
                                composition.convert.sort.forEach((value) => {
                                    iValPost = iValPost.sort(value);
                                });
                                composition.convert.has.forEach((value) => {
                                    iValPost = iValPost.filter(value);
                                });
                                setValue(iValPost);
                            });
                            composition.convert.sort.forEach((value) => {
                                ival = ival.sort(value);
                            });
                            composition.convert.has.forEach((value) => {
                                ival = ival.filter(value);
                            });
                            _pthis.raiseMethod(composition, 'after process', [ival], (res) => {
                                ival = res;
                            });
                            _pthis.raiseMethod(composition, 'on end', [ival], (res) => {
                                ival = res;
                            });
                            config.set(_max, composition.api.pagination.maxOffset);
                            config.set(_fetching, false);
                            setValue(ival);
                        }, true);
                    });
                }
                catch (e) {
                    config.set(_fetching, false);
                    setTimeout(() => {
                        this.user().all();
                    }, 1000);
                }
                this._forceMode = false;
                return composition.get();
            },
            next() {
                composition.lastStep = () => { property.user().page(1, false); };
                config.set(_fetching, true);
                if (composition.api.pagination.maxOffset > 0) {
                    if (composition.api.pagination.offset < composition.api.pagination.maxOffset) {
                        composition.api.pagination.offset += 1;
                        config.set(_current, composition.api.pagination.offset);
                        config.set(_isEnd, false);
                    }
                    else {
                        config.set(_isEnd, true);
                        config.set(_fetching, false);
                        return composition.get();
                    }
                }
                else {
                    composition.api.pagination.offset += 1;
                }
                let query = _pthis.compileQuery(composition);
                let path = composition.api.path;
                let url = buildUrl(path, query, {}, composition.template);
                let params = Object.assign({ method: composition.api.method }, composition.api.customParams);
                _pthis.raiseMethod(composition, 'on awake', []);
                try {
                    queryToApi(url, params, composition.template, composition).then((ival) => {
                        _pthis.subsToPart('proccess', composition, () => {
                            _pthis.raiseMethod(composition, 'before process', [ival], (res) => { ival = res; });
                            composition.convert.map.forEach((value) => {
                                ival = ival.map(value);
                            });
                            if (composition.convert.isFlat) {
                                ival = ival.flat();
                            }
                            composition.convert.sort.forEach((value) => {
                                ival = ival.sort(value);
                            });
                            composition.convert.has.forEach((value) => {
                                ival = ival.filter(value);
                            });
                            _pthis.raiseMethod(composition, 'after process', [ival], (res) => {
                                ival = res;
                            });
                            _pthis.raiseMethod(composition, 'on end', [ival], (res) => {
                                ival = res;
                            });
                            config.set(_max, composition.api.pagination.maxOffset);
                            config.set(_fetching, false);
                            if (composition.api.pagination.append) {
                                if (localFilterEnabled)
                                    setValue(config.get(_originalValue).concat(ival));
                                else
                                    setValue(composition.get().concat(ival));
                            }
                            else {
                                setValue(ival);
                            }
                        }, true);
                    });
                }
                catch (e) {
                    setTimeout(() => {
                        config.set(_fetching, false);
                        composition.api.pagination.offset -= 1;
                        this.user().next();
                    }, 1000);
                }
                return composition.get();
            },
            prev() {
                composition.lastStep = () => { property.user().page(1, false); };
                config.set(_fetching, true);
                if (composition.api.pagination.offset > 1) {
                    composition.set([]);
                    composition.api.pagination.offset -= 1;
                    config.set(_current, composition.api.pagination.offset);
                }
                else {
                    config.set(_fetching, false);
                    return composition.get();
                }
                let query = _pthis.compileQuery(composition);
                let path = composition.api.path;
                let url = buildUrl(path, query, {}, composition.template);
                let params = Object.assign({ method: composition.api.method }, composition.api.customParams);
                _pthis.raiseMethod(composition, 'on awake', []);
                try {
                    queryToApi(url, params, composition.template, composition).then((ival) => {
                        _pthis.subsToPart('proccess', composition, () => {
                            _pthis.raiseMethod(composition, 'before process', [ival], (res) => { ival = res; });
                            composition.convert.map.forEach((value) => {
                                ival = ival.map(value);
                            });
                            if (composition.convert.isFlat) {
                                ival = ival.flat();
                            }
                            composition.convert.sort.forEach((value) => {
                                ival = ival.sort(value);
                            });
                            composition.convert.has.forEach((value) => {
                                ival = ival.filter(value);
                            });
                            _pthis.raiseMethod(composition, 'after process', [ival], (res) => {
                                ival = res;
                            });
                            _pthis.raiseMethod(composition, 'on end', [ival], (res) => {
                                ival = res;
                            });
                            config.set(_max, composition.api.pagination.maxOffset);
                            config.set(_fetching, false);
                            setValue(ival);
                        }, true);
                    });
                }
                catch (e) {
                    setTimeout(() => {
                        config.set(_fetching, false);
                        composition.api.pagination.offset += 1;
                        this.user().next();
                    }, 1000);
                }
                return composition.get();
            },
            page(number, preventLastStep = true) {
                if (preventLastStep)
                    composition.lastStep = () => { property.user().page(number); };
                if (this._forceMode == false && composition.api.optimization.preventRepeat) {
                    if (Object.keys(composition.get()).length > 0) {
                        return composition.get();
                    }
                }
                composition.set([]);
                config.set(_fetching, true);
                composition.api.pagination.offset = number;
                config.set(_current, composition.api.pagination.offset);
                let query = _pthis.compileQuery(composition);
                let path = composition.api.path;
                let url = buildUrl(path, query, {}, composition.template);
                let params = Object.assign({ method: composition.api.method }, composition.api.customParams);
                _pthis.raiseMethod(composition, 'on awake', []);
                queryToApi(url, params, composition.template, composition).then((ival) => {
                    _pthis.subsToPart('proccess', composition, () => {
                        _pthis.raiseMethod(composition, 'before process', [ival], (res) => { ival = res; });
                        composition.convert.map.forEach((value) => {
                            ival = ival.map(value);
                        });
                        if (composition.convert.isFlat) {
                            ival = ival.flat();
                        }
                        composition.convert.sort.forEach((value) => {
                            ival = ival.sort(value);
                        });
                        composition.convert.has.forEach((value) => {
                            ival = ival.filter(value);
                        });
                        _pthis.raiseMethod(composition, 'after process', [ival], (res) => {
                            ival = res;
                        });
                        _pthis.raiseMethod(composition, 'on end', [ival], (res) => {
                            ival = res;
                        });
                        config.set(_max, composition.api.pagination.maxOffset);
                        config.set(_fetching, false);
                        setValue(ival);
                    }, true);
                });
                return composition.get();
            },
            pageBy(name) {
                composition.lastStep = () => { property.user().pageBy(name); };
                if (this._forceMode == false && composition.api.optimization.preventRepeat) {
                    if (Object.keys(composition.get()).length > 0) {
                        return composition.get();
                    }
                }
                composition.set([]);
                config.set(_fetching, true);
                const router = config.router();
                if (router.currentRoute.value.params && name in router.currentRoute.value.params) {
                    composition.api.pagination.offset = Number.parseInt(router.currentRoute.value.params[name]);
                }
                else if (router.currentRoute.value.query && name in router.currentRoute.value.query) {
                    composition.api.pagination.offset = Number.parseInt(router.currentRoute.value.query[name]);
                }
                let query = _pthis.compileQuery(composition);
                let path = composition.api.path;
                let url = buildUrl(path, query, {}, composition.template);
                let params = Object.assign({ method: composition.api.method }, composition.api.customParams);
                config.set(_current, composition.api.pagination.offset);
                _pthis.raiseMethod(composition, 'on awake', []);
                queryToApi(url, params, composition.template, composition).then((ival) => {
                    _pthis.subsToPart('proccess', composition, () => {
                        _pthis.raiseMethod(composition, 'before process', [ival], (res) => { ival = res; });
                        composition.convert.map.forEach((value) => {
                            ival = ival.map(value);
                        });
                        if (composition.convert.isFlat) {
                            ival = ival.flat();
                        }
                        composition.convert.sort.forEach((value) => {
                            ival = ival.sort(value);
                        });
                        composition.convert.has.forEach((value) => {
                            ival = ival.filter(value);
                        });
                        _pthis.raiseMethod(composition, 'after process', [ival], (res) => {
                            ival = res;
                        });
                        _pthis.raiseMethod(composition, 'on end', [ival], (res) => {
                            ival = res;
                        });
                        config.set(_max, composition.api.pagination.maxOffset);
                        config.set(_fetching, false);
                        setValue(ival);
                    }, true);
                });
                return composition.get();
            },
            size(size) {
                composition.api.pagination.size = size;
                return this;
            },
            method(type) {
                composition.api.method = type;
                return this;
            },
            setQuery(params) {
                composition.api.query = params;
                return this;
            },
            user() {
                this._forceMode = true;
                return this;
            }
        };
        Object.defineProperty(property, 'value', {
            get() { return composition.get(); },
            set(v) { composition.set(v); },
        });
        Object.defineProperty(property, 'isLoading', {
            get() { return config.get(_fetching); },
        });
        Object.defineProperty(property, 'isFinished', {
            get() { return config.get(_isEnd); },
        });
        Object.defineProperty(property, 'max', {
            get() { return config.get(_max); },
        });
        Object.defineProperty(property, 'current', {
            get() { return config.get(_current); },
        });
        return property;
    }
    // Segment doOne
    // if keep()
    wayMany1(composition, val) {
        throw "keep() cannot be many()";
    }
    // Segment doOne
    // if nobody
    wayMany0(composition, val) {
        return composition;
    }
}
export class MoleculaComposition extends CompositionBuilder {
}
