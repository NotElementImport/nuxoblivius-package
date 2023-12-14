import StateManager from "./StateManager";
import { config } from "./config";
import { addToPath, buildUrl, queryToApi } from "./utilits";
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
        mainComposition.__value = config.init(instruction.__value);
        mainComposition.get = () => config.get(mainComposition.__value);
        mainComposition.set = (v) => { config.set(mainComposition.__value, v); };
        mainComposition.__obbsv = 0;
        mainComposition.subs = [];
        mainComposition.lastStep = () => { };
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
    dynamicAdd(composition, name, value) {
        composition[name] = value;
        return this;
    }
}
export class StateComposition extends CompositionBuilder {
    compileQuery(composition) {
        let query = Object.assign({}, composition.api.query, composition.api.userQuery);
        if (composition.template == 'yii2-data-provider') {
            query['page[number]'] = composition.api.pagination.offset;
            query['page[size]'] = composition.api.pagination.size;
        }
        for (const [key, val] of Object.entries(composition.api.joined.query)) {
            if (typeof val == 'object') {
                // console.log(val.object)
                query[key] = val.object.getParams(val.field).get();
            }
            else {
                query[key] = val;
            }
        }
        return query;
    }
    doApi(composition, args) {
        this.setType(composition, 2)
            .dynamicAdd(composition, 'api', {
            path: '',
            query: {},
            userQuery: {},
            method: "GET",
            auth: {
                use: false,
                login: '',
                password: ''
            },
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
            .dynamicAdd(composition, 'template', '')
            .dynamicAdd(composition, 'convert', {
            map: [],
            sort: [],
            has: []
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
    doReload(composition, args) {
        composition.api.optimization.preventRepeat = false;
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
                StateManager.manager(delimeter[0].trim()).getParams(delimeter[1].trim())
                    .subs.push(() => {
                    composition.lastStep();
                });
            }
            catch (e) {
                console.error(args[0] + ' not exist. Maybe not init');
            }
        }
        else {
            if (args[0].__ref.__obbsv == 2) {
                composition.parent = args[0].__ref;
                composition.api.linkMethod = args[1];
            }
            else {
                args[0].__ref.subs.push(() => {
                    composition.lastStep();
                });
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
    doMap(composition, args) {
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
            return await queryToApi(url, params, composition.template);
        };
        const send = async (body, multipart = false) => {
            let query = _pthis.compileQuery(composition);
            let path = composition.api.path;
            if (typeof body == 'object' && multipart == false) {
                try {
                    body = JSON.parse(body);
                }
                catch (e) { }
            }
            let url = buildUrl(path, query, {}, composition.template);
            let params = Object.assign({ method: composition.api.method, body: body }, composition.api.customParams);
            return await queryToApi(url, params, composition.template);
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
                get(value).then((val) => {
                    composition.set(val);
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
                queryToApi(url, params, composition.template).then((ival) => {
                    console.log(ival);
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
                config.set(composition.__value, config.getCookie(composition.cache.name));
                composition.cache.loaded = true;
            }
            else if (typeof localStorage !== 'undefined'
                && composition.cache.where.isLocalStorage
                && composition.cache.loaded == false) {
                config.set(composition.__value, localStorage[composition.cache.name]);
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
                if (typeof v == 'object')
                    throw "Object cannot be keep in Cookie";
                let expr = undefined;
                if (composition.cache.duration != 0 && composition.cache.duration != Infinity)
                    expr = Date.now() + composition.cache.duration;
                config.saveCookie(composition.cache.name, v, expr);
            }
            if (typeof localStorage !== 'undefined' && composition.cache.where.isLocalStorage) {
                if (typeof v == 'object')
                    v = JSON.parse(v);
                localStorage[composition.cache.name] = v;
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
        console.log(composition);
        return this.createWay('Many', composition, composition.__obbsv);
    }
    // Segment doOne
    // if api()
    wayMany2(composition, val) {
        const _pthis = this;
        const _fetching = config.init(false);
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
                queryToApi(url, params, composition.template).then((ival) => {
                    composition.set(ival);
                    config.set(_fetching, false);
                });
                this._forceMode = false;
                return composition.get();
            },
            next() {
                composition.lastStep = () => { property.user().page(1, false); };
                config.set(_fetching, true);
                composition.api.pagination.offset += 1;
                let query = _pthis.compileQuery(composition);
                let path = composition.api.path;
                let url = buildUrl(path, query, {}, composition.template);
                let params = Object.assign({ method: composition.api.method }, composition.api.customParams);
                queryToApi(url, params, composition.template).then((ival) => {
                    if (composition.api.pagination.append) {
                        composition.set(composition.get().concat(ival));
                    }
                    else {
                        composition.set(ival);
                    }
                    config.set(_fetching, false);
                });
                return composition.get();
            },
            prev() {
                composition.lastStep = () => { property.user().page(1, false); };
                config.set(_fetching, true);
                composition.set([]);
                composition.api.pagination.offset -= 1;
                let query = _pthis.compileQuery(composition);
                let path = composition.api.path;
                let url = buildUrl(path, query, {}, composition.template);
                let params = Object.assign({ method: composition.api.method }, composition.api.customParams);
                queryToApi(url, params, composition.template).then((ival) => {
                    composition.set(ival);
                    config.set(_fetching, false);
                });
                return composition.get();
            },
            page(number, preventLastStep = true) {
                if (preventLastStep)
                    composition.lastStep = () => { property.user().page(number); };
                composition.set([]);
                config.set(_fetching, true);
                composition.api.pagination.offset = number - 1;
                let query = _pthis.compileQuery(composition);
                let path = composition.api.path;
                let url = buildUrl(path, query, {}, composition.template);
                let params = Object.assign({ method: composition.api.method }, composition.api.customParams);
                queryToApi(url, params, composition.template).then((ival) => {
                    composition.set(ival);
                    config.set(_fetching, false);
                });
                return composition.get();
            },
            pageBy(name) {
                composition.lastStep = () => { property.user().pageBy(name); };
                composition.set([]);
                config.set(_fetching, true);
                const router = config.router();
                if (router.currentRoute.value.params && name in router.currentRoute.value.params) {
                    composition.api.pagination.offset = Number.parseInt(router.currentRoute.value.params[name]) - 1;
                }
                else if (router.currentRoute.value.query && name in router.currentRoute.value.query) {
                    composition.api.pagination.offset = Number.parseInt(router.currentRoute.value.query[name]) - 1;
                }
                let query = _pthis.compileQuery(composition);
                let path = composition.api.path;
                let url = buildUrl(path, query, {}, composition.template);
                let params = Object.assign({ method: composition.api.method }, composition.api.customParams);
                queryToApi(url, params, composition.template).then((ival) => {
                    composition.set(ival);
                    config.set(_fetching, false);
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
