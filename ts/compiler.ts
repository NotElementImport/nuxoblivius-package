import Filter from "./Filter/index.js"
import StateManager from "./StateManager/index.js"
import { config, _defaults, useCustomTemplate } from "./config.js"
import { PatternsApi, PlaceKeep } from "./interfaces.js"
import { addToPath, buildUrl, queryToApi } from "./utilits.js"

export default class CompositionBuilder {
    private _currentArgs: any[] = []

    public static instruction(defaultValue: any) {
        let compiledObject: any = null
        const anonInstruction = new Proxy({__wrt: [] as any[], __value: defaultValue}, {
            get(target, p, receiver) {
                if(p == '__wrt' || p == '__value') {
                    return target[p]
                }
                else if(p == '__ref') {
                    return compiledObject
                }
                else { return function (...kwargs: any[]) {
                    target.__wrt.push([p, kwargs])
                    return anonInstruction
            }}},
            set(target, p, newValue, receiver) {
                if(p == '__ref') {
                    compiledObject = newValue
                }
                return true
            },})
        return anonInstruction as any;
    }

    public compile(instruction: {__wrt: any[], __value: any, __ref: any}) {
        const mainComposition = this.composition()
        mainComposition.__default = instruction.__value
        mainComposition.__value = config.init(instruction.__value)
        mainComposition.get = () => config.get(mainComposition.__value)
        mainComposition.set = (v: any) => { 
            config.set(mainComposition.__value, v); 
            mainComposition.subs.forEach((value: Function) => {
                value()
            })
        }
        mainComposition.__obbsv = 0
        mainComposition.subs = [()=>{
            mainComposition.onceSubs.forEach((value: Function) => {
                value()
            })
            mainComposition.onceSubs = []
        }]
        mainComposition.onceSubs = []
        mainComposition.lastStep = () => {}
        mainComposition.call = {}

        instruction.__ref = mainComposition

        for(const doOf of instruction.__wrt) {
            this._currentArgs = doOf[1]
            const name = ((doOf[0] as string)[0].toLocaleUpperCase()) + ((doOf[0] as string).slice(1));
            const answer = (this as any)[`do${name}`](mainComposition, this._currentArgs)
            if(typeof answer !== 'undefined' && answer != null) {
                return answer
            }
        }
    }

    protected callPart(name: string, composition: any) {
        if(name in composition.call) {
            composition.call[name]()
        }
    }

    protected subsToPart(name: string, composition: any, func: Function, awake: boolean = false) {
        composition.call[name] = func
        if(awake) func()
    }

    protected createWay(name: string, composition: {[name: string]: any}, data: any) {
        return (this as any)[`way${name}${data}`](composition, data)
    }

    protected composition(): {[name: string]: any} { return {}; }

    protected setType(composition: {[name: string]: any}, value: number) {
        composition.__obbsv = value
        return this
    }

    protected argument<T>(index: number, method: (value: T) => void) {
        if(Array.isArray(this._currentArgs) && this._currentArgs.length > index) {
            method(this._currentArgs[index])
        }
    }

    protected argumentExist(index: number): boolean {
        return Array.isArray(this._currentArgs) && this._currentArgs.length > index
    }

    protected dynamicAdd(composition: {[name: string]: any}, name: string, value: any) {
        composition[name] = value
        return this
    }
}

interface IStateComposition {
    __obbsv: number
    __value: any
    get: () => any
    set: (v: any) => void
    lastStep: () => void
    call: {[name: string]: Function[]}

    api: {
        watching: boolean
        path: string,
        query: {[name: string]: any},
        userQuery: {[name: string]: any},

        optimization: {
            preventRepeat: boolean,
        }

        customParams: {[name: string]: any},

        method: "GET"|"POST"|"PUT"|"DELETE",

        auth: {
            use: boolean,
            login: string,
            password: string
        },

        linkMethod: string,
        joined: {
            query: {[name: string]: {object: any, field: string} | any}
        }

        filters: [],
        localFilters: [],

        pagination: {
            append: boolean,
            size: number,
            offset: number,
            maxOffset: number
        }
    },
    parent: IStateComposition,
    template: PatternsApi,
    hook: {
        "on awake": Function
        "on instance": Function
        "before process": Function
        "after process": Function
        "on end": Function
    },
    cache: {
        loaded: boolean,
        type: "blob"|"json"|"string"|"number"|"arrayBuffer",
        where: {
            isLocalStorage: boolean,
            isCache: boolean,
            isCookie: boolean
        },
        name: string,
        duration: number,
        safe: () => void
    },
    subs: Function[],
    onceSubs: Function[],
    convert: {
        map: Function[],
        sort: Function[],
        has: Function[],
        isFlat: boolean
    }
}

export class StateComposition extends CompositionBuilder {
    private raiseMethod(composition: IStateComposition, name: string, args: any[], func?: Function) {
        if(name in composition.hook) {
            let result = (composition.hook as any)[name](...args)
            if(typeof result != 'undefined' && func) {
                func(result)
            }
        }
    }

    private subsMethod(composition: IStateComposition, name: string, func: Function) {
        (composition.hook as any)[name] = func
    }

    private compileQuery(composition: IStateComposition) {
        let query = Object.assign({}, composition.api.query, composition.api.userQuery)
        
        if(composition.api.pagination.size > 0) {
            if(composition.template == 'yii2-data-provider') {
                query['page[number]'] = composition.api.pagination.offset
                query['page[size]'] = composition.api.pagination.size
            }
            else if(composition.template != '') {
                const logic = useCustomTemplate(composition.template)
                if(logic) {
                    logic.url( { 
                        set: (value: Record<string, unknown>) => { query = Object.assign(query, value) },
                        get: () => query
                    }, { 
                        set: (value: string) => { composition.api.path += value }, 
                        get: () => composition.api.path
                    },
                    composition.api.pagination.offset, 
                    composition.api.pagination.size)
                }
            }
        }

        for(const filterLink of composition.api.filters) {
            const fquery = Filter.filter(filterLink)
            query = Object.assign(query, fquery)
        }

        for (const [key, val] of Object.entries(composition.api.joined.query)) {
            if(typeof val == 'object') {
                query[key] = val.object.getParams(val.field).get()
            }
            else {
                query[key] = val
            }
        }

        return query
    }

    protected doApi(composition: IStateComposition, args: any[]) {
        let _template = ''
        if('template' in _defaults) {
            _template = _defaults.template
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
                    password: '',
                    update: () => {},
                },
                filters: [],
                localFilters: [],
                joined: {
                    query: {}
                },
                customParams: {},
                optimization: {
                    preventRepeat: process.client,
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
            })
            
        if(typeof args[0] == 'object') {
            composition.api.path = args[0].path
            composition.api.query = args[0].query
        }
        else {
            composition.api.path = args[0]
        }

        if(this.argumentExist(1)) {
            if(typeof args[1] == 'object') {
                composition.api.customParams = args[1]
            }
        }
    }

    protected doKeep(composition: IStateComposition, args: any[]) {
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
                if(composition.cache.where.isCookie) {
                    if(config.getCookie(composition.cache.name) == null) {
                        config.saveCookie(composition.cache.name, (composition as any).__default, undefined as any)
                    }
                }
                else if(composition.cache.where.isLocalStorage) {
                    if(!(composition.cache.name in localStorage)) {
                        localStorage[composition.cache.name] = (composition as any).__default
                    }
                }
            }
        })
    }

    protected doPlace(composition: IStateComposition, args: any[]) {
        if(!Array.isArray(args[0])) {
            args[0] = [args[0]]
        }
        composition.cache.where.isLocalStorage = false
        composition.cache.where.isCookie = false
        composition.cache.where.isCache = false
        for(const a of args[0] as PlaceKeep[]) {
            if(a == 'localStorage') {
                composition.cache.where.isLocalStorage = true
            }
            else if(a == 'cache') {
                composition.cache.where.isCache = true
            }
            else {
                composition.cache.where.isCookie = true
            }
        }
    }

    protected doTemplate(composition: IStateComposition, args: any[]) {
        composition.template = args[0]
    }

    protected doPagination(composition: IStateComposition, args: any[]) {
        composition.api.pagination.size = args[0]
        
        this.argument<boolean>(1, (value) => {
            composition.api.pagination.append = value
        })
    }

    protected doHook(composition: IStateComposition, args: any[]) {
        this.subsMethod(composition, args[0], args[1])
    }

    protected doMap(composition: IStateComposition, args: any[]) {
        composition.convert.map.push(args[0])
    }

    protected doSort(composition: IStateComposition, args: any[]) {
        composition.convert.sort.push(args[0])
    }

    protected doHas(composition: IStateComposition, args: any[]) {
        composition.convert.has.push(args[0])
    }

    protected doFlat(composition: IStateComposition, args: any[]) {
        composition.convert.isFlat = true
    }

    protected doReload(composition: IStateComposition, args: any[]) {
        composition.api.optimization.preventRepeat = false
    }

    protected doFilter(composition: IStateComposition, args: any[]) {
        if(this.argumentExist(1)) {
            if(typeof args[1] == 'string') {
                if(args[1] == 'emit-always') {
                    composition.api.filters.push(args[0] as never)
                    const object = Filter.instance(args[0])
                    object.on(() => {
                        composition.lastStep()
                    })
                }
                else if(args[1] == 'emit-localy') {
                    composition.api.localFilters.push(args[0] as never)
                }
                else {
                    console.error(`state.filter(${args[0]}, ${args[1]}); cmd is empty set, 'emit-always', 'emit-localy'`)
                }
            }
            else if(typeof args[1] == 'boolean') {
                if(args[1]) {
                    composition.api.localFilters.push(args[0] as never)
                }
                else {
                    composition.api.filters.push(args[0] as never)
                }
            }
        }
        else {
            composition.api.filters.push(args[0] as never)
        }
    }

    protected doAuth(composition: IStateComposition, args: any[]) {
        composition.api.auth.use = true;
        const delimeter = args[0].split('.');
        const objectParams = StateManager.manager(delimeter[0].trim()).getParams(delimeter[1].trim());
        objectParams.subs.push(() => {
            composition.api.auth.login = StateManager.manager(delimeter[0].trim())[delimeter[1].trim()];
            if (composition.api.auth.update) {
                composition.api.auth.update();
            }
        });
        composition.api.auth.login = objectParams.get();
    }

    protected doJoin(composition: IStateComposition, args: any[]) {
        if(typeof args[0] == 'string') {
            const delimeter = args[0].split('.')
            try {
                composition.api.watching = true
                if(this.argumentExist(1) && process.client) {
                    if(args[1] == 'only-filter') {
                        StateManager.manager(delimeter[0].trim()).getParams(delimeter[1].trim())
                        .subs.push(() => {
                            this.callPart('filter', composition)
                        })
                    }
                    else if(args[1] == 'only-sort') {
                        StateManager.manager(delimeter[0].trim()).getParams(delimeter[1].trim())
                        .subs.push(() => {
                            this.callPart('sort', composition)
                        })
                    }
                    else if(args[1] == 'only-process') {
                        StateManager.manager(delimeter[0].trim()).getParams(delimeter[1].trim())
                        .subs.push(() => {
                            this.callPart('proccess', composition)
                        })
                    }
                }
                else {
                    if(process.client) {
                        StateManager.manager(delimeter[0].trim()).getParams(delimeter[1].trim())
                            .subs.push(() => {
                                composition.lastStep()
                            })
                    }
                }
            }
            catch(e) {
                console.error(args[0] + ' not exist. Maybe not init')
            }
        }
        else {
            if(args[0].__ref.__obbsv == 2) {
                composition.parent = args[0].__ref
                composition.api.linkMethod = args[1]
                composition.api.optimization.preventRepeat = false

                // args[0].__ref.subs.push(() => {
                //     if(Object.keys(composition.get()).length != 0) {
                //         composition.lastStep()
                //     }
                // })
            }
            else {
                composition.api.watching = true
                if(this.argumentExist(1)) {
                    if(process.client) {
                        if(args[1] == 'only-filter') {
                            args[0].__ref.subs.push(() => {
                                this.callPart('filter', composition)
                            })
                        }
                        else if(args[1] == 'only-sort') {
                            args[0].__ref.subs.push(() => {
                                this.callPart('sort', composition)
                            })
                        }
                        else if(args[1] == 'only-process') {
                            args[0].__ref.subs.push(() => {
                                this.callPart('proccess', composition)
                            })
                        }
                    }
                }
                else {
                    if(process.client)
                        args[0].__ref.subs.push(() => {
                            // setTimeout(() => {
                            composition.lastStep()
                            // },100)
                        })
                }
            }
        }
    }

    protected doJoinToQuery(composition: IStateComposition, args: any[]) {
        if(typeof args[1] == 'string') {
            try {
                const delimeter = args[1].split('.')
                const objt = StateManager.manager(delimeter[0].trim())

                composition.api.joined.query[args[0]] = {
                    object: objt,
                    field: delimeter[1].trim()
                }
            }
            catch(e) {
                console.log(args[1] + " not found. Maybe not init")
            }
        }
        else {
            composition.api.joined.query[args[0]] = args[1]
        }
    }

    protected doCacheType(composition: IStateComposition, args: any[]) {
        composition.cache.type = args[0]
    }

    // Cache for API
    protected doCache(composition: IStateComposition, args: any[]) {
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
            safe: async () => {}
        })
    }

    // Segment doOne
    protected doOne(composition: IStateComposition, args: any[]) {
        return this.createWay('One', composition, composition.__obbsv)
    }

    // Segment doOne
    // if api()
    protected wayOne2(composition: IStateComposition, val: number) {
        const _pthis = this
        const _fetching = config.init(false)

        const customParams = {} as any

        if (composition.api.auth.use) {
            customParams.headers = {};
            customParams.headers['Authorization'] = `Bearer ${composition.api.auth.login}`;
        }
        composition.api.auth.update = () => {
            customParams.headers = {};
            customParams.headers['Authorization'] = `Bearer ${composition.api.auth.login}`;
        };

        if(composition.get() == null) composition.set({})

        const get = async (value: any) => {
            let query = _pthis.compileQuery(composition)
            let path = composition.api.path

            if(typeof value != 'object') {
                if(composition.parent != null) {
                    for(const part of composition.parent.get()) {
                        if(part[composition.api.linkMethod] == value) {
                            return part
                        }
                    }
                }
                path = addToPath(path, value as string)
            }
            else {
                query = Object.assign(query, value)
            }

            let url = buildUrl(path, query, {}, composition.template)
            let params = Object.assign({method: composition.api.method}, composition.api.customParams, customParams);

            return await queryToApi(
                url, params, composition.template, composition
            )
        }

        const send = async (body: any, multipart: boolean = false) => {
            let query = _pthis.compileQuery(composition)
            let path = composition.api.path

            if(typeof body == 'object' && multipart == false) {
                try {
                    body = JSON.stringify(body)
                }
                catch(e) { }
            }

            const customHeaders = {} as any   

            if(!multipart) {
                customHeaders['Content-Type'] = "application/json"
            }

            let url = buildUrl(path, query, {}, composition.template)
            let params = Object.assign({method: composition.api.method, body: body, headers: customHeaders}, composition.api.customParams, customParams);

            return await queryToApi(
                url, params as any, composition.template, composition
            )
        }

        const property = {
            __obbsv: 2,
            _forceMode: false,
            get(value: string|number|{[param:string]:any}) {
                composition.lastStep = () => { property.user().get(value) }

                if(this._forceMode == false && composition.api.optimization.preventRepeat) {
                    if(Object.keys(composition.get()).length > 0) {
                        return composition.get()
                    }
                }
                config.set(_fetching, true)

                _pthis.raiseMethod(composition, 'on awake', [])
                return get(value).then((ival) => {
                    _pthis.raiseMethod(composition, 'before process', [ival], (res: any) => {
                        ival = res
                    })

                    composition.convert.map.forEach((value) => {
                        ival = value(ival)
                    })
                    _pthis.raiseMethod(composition, 'after process', [ival], (res: any) => {
                        ival = res
                    })
                    _pthis.raiseMethod(composition, 'on end', [ival], (res: any) => {
                        ival = res
                    })
                    composition.set(ival)
                    this._forceMode = false
                    config.set(_fetching, false)

                    return ival
                })
            },
            getBy(param: string|{[queryName:string]:string}) {
                composition.lastStep = () => { property.user().getBy(param) }

                if(this._forceMode == false && composition.api.optimization.preventRepeat) {
                    if(Object.keys(composition.get()).length > 0) {
                        return composition.get()
                    }
                }

                config.set(_fetching, true)

                let query = _pthis.compileQuery(composition)
                let path = composition.api.path

                const router = config.router()

                if(typeof param == 'object') {
                    for(const [key, value] of Object.entries(param)) {
                        if(router.currentRoute.value.params && value in router.currentRoute.value.params) {
                            query[key] = router.currentRoute.value.params[value]
                        }
                        else if(router.currentRoute.value.query && value in router.currentRoute.value.query) {
                            query[key] = router.currentRoute.value.query[value]
                        }
                    }
                }
                else {
                    let val = ''
                    if(router.currentRoute.value.params && param in router.currentRoute.value.params) val = router.currentRoute.value.params[param]
                    else if(router.currentRoute.value.query && param in router.currentRoute.value.query) val = router.currentRoute.value.query[param]

                    if(composition.parent != null) {
                        if(process.client) {
                            for(const part of composition.parent.get()) {
                                if(part[composition.api.linkMethod] == val) {
                                    config.set(_fetching, false)
                                    composition.set(part)
                                    return composition.get()
                                }
                            }
                        }
                    }
                    path = addToPath(path, val as string)
                }

                let url = buildUrl(path, query, {}, composition.template)
                let params = Object.assign({method: composition.api.method}, composition.api.customParams);
    
                _pthis.raiseMethod(composition, 'on awake', [])
                return queryToApi(
                    url, params, composition.template, composition
                ).then((ival) => {
                    _pthis.raiseMethod(composition, 'before process', [ival], (res: any) => {
                        ival = res
                    })

                    composition.convert.map.forEach((value) => {
                        ival = value(ival)
                    })
                    _pthis.raiseMethod(composition, 'after process', [ival], (res: any) => {
                        ival = res
                    })
                    _pthis.raiseMethod(composition, 'on end', [ival], (res: any) => {
                        ival = res
                    })
                    composition.set(ival)
                    this._forceMode = false
                    config.set(_fetching, false)
                    return ival
                })
            },
            send(body: {[name: string]: any}|string) {
                config.set(_fetching, true)

                return send(body).then((ival) => {
                    composition.set(ival)
                    config.set(_fetching, false)
                    return ival
                })
            },
            multipart(formData: FormData) {
                config.set(_fetching, true)

                return send(formData, true).then((ival) => {
                    composition.set(ival)
                    config.set(_fetching, false)
                    return ival
                })
            },
            sync() {
                return {
                    async send(body: {[name: string]: any}|string) {
                        config.set(_fetching, true)
                        const response = await send(body)
                        config.set(_fetching, false)
                        return response
                        
                    },
                    async multipart(formData: FormData) {
                        config.set(_fetching, true)
                        const response = await send(formData, true)
                        config.set(_fetching, false)
                        return response
                    },
                    async get(value: string|number|{[param:string]:any}) {
                        config.set(_fetching, true)
                        const response = await get(value)
                        config.set(_fetching, false)
                        return response
                    }
                }
            },
            method(type: any) {
                composition.api.method = type
                return this
            },
            setQuery(params: any) {
                composition.api.query = params
                return this
            },
            customAuth(token: any) {
                composition.api.auth.login = token;
                composition.api.auth.use = true;
                return this;
            },
            user() {
                this._forceMode = true
                return this
            }
        }

        Object.defineProperty(property, 'value', {
            get() { return composition.get() },
            set(v) { composition.set(v) },
        })

        Object.defineProperty(property, 'isLoading', {
            get() { return config.get(_fetching) },
        })

        return property
    }

    // Segment doOne
    // if keep()
    protected wayOne1(composition: IStateComposition, val: number) {
        composition.get = () => {
            if(composition.cache.where.isCookie && composition.cache.loaded == false) {
                const cook = config.getCookie(composition.cache.name)
                if(cook != null && typeof cook != 'undefined') {
                    config.set(composition.__value, cook)
                }
                else {
                    config.set(composition.__value, config.getCookie(composition.cache.name))
                }
                composition.cache.loaded = true
            }
            else if(typeof localStorage !== 'undefined' 
                        && composition.cache.where.isLocalStorage 
                        && composition.cache.loaded == false) {
                if(composition.cache.type == 'json') {
                    const data = localStorage[composition.cache.name]
                    if(data != '') {
                        config.set(composition.__value, JSON.parse(localStorage[composition.cache.name]))
                    }
                }
                else {
                    config.set(composition.__value, localStorage[composition.cache.name])
                }
                composition.cache.loaded = true
            }
            else if(typeof caches !== 'undefined' 
                        && composition.cache.where.isCache 
                        && composition.cache.loaded == false) {
                caches.open('storage').then(e => {
                    e.match(composition.cache.name).then((e) => {
                        switch(composition.cache.type) {
                            case "string":
                                e?.text().then(e => {
                                    config.set(composition.__value, e)
                                })
                                break
                            case "number":
                                e?.text().then(e => {
                                    config.set(composition.__value, Number.parseFloat(e))
                                })
                                break
                            case "arrayBuffer":
                                e?.arrayBuffer().then(e => {
                                    config.set(composition.__value, e)
                                })
                                break
                            case "blob":
                                e?.blob().then(e => {
                                    config.set(composition.__value, e)
                                })
                                break
                            case "json":
                                e?.json().then(e => {
                                    config.set(composition.__value, e)
                                })
                                break
                        }
                        composition.cache.loaded = true
                    })
                })
            }
            return config.get(composition.__value)
        }

        composition.set = (v: any) => {
            if(composition.cache.where.isCookie) {
                if(typeof v == 'object' || Array.isArray(v)) throw "Object cannot be keep in Cookie";

                let expr = undefined as any
                if(composition.cache.duration != 0 && composition.cache.duration != Infinity)
                    expr = Date.now() + composition.cache.duration

                config.saveCookie(composition.cache.name, v, expr)
            }
            if(typeof localStorage !== 'undefined' && composition.cache.where.isLocalStorage) {
                let result = v
                if(typeof v == 'object' || Array.isArray(v)) result = JSON.stringify(v);
                localStorage[composition.cache.name] = result

                if(composition.cache.duration != 0 && composition.cache.duration != Infinity)
                    localStorage[composition.cache.name+"_exp"] = Date.now() + composition.cache.duration
            }
            if(typeof caches !== 'undefined' && composition.cache.where.isCache) {
                caches.open('storage').then(e => {
                    const reponse = new Response(v)
                    e.put(composition.cache.name, reponse)
                })
            }

            config.set(composition.__value, v)

            composition.subs.forEach((value) =>
                value()
            )
        }
        
        return composition
    }

    // Segment doOne
    // if nobody
    protected wayOne0(composition: IStateComposition, val: number) {
        return composition
    }

    // Segment doMany
    protected doMany(composition: IStateComposition, args: any[]) {
        return this.createWay('Many', composition, composition.__obbsv)
    }

        // Segment doOne
    // if api()
    protected wayMany2(composition: IStateComposition, val: number) {
        const _pthis = this
        const _fetching = config.init(false)
        const _isEnd = config.init(false)
        const _originalValue = config.init([])
        const _allInstances: Filter[] = []
        const _max = config.init(0)
        const _current = config.init(1)
        const customParams = {} as any

        if (composition.api.auth.use) {
            customParams.headers = {};
            customParams.headers['Authorization'] = `Bearer ${composition.api.auth.login}`;
        }
        composition.api.auth.update = () => {
            customParams.headers = {};
            customParams.headers['Authorization'] = `Bearer ${composition.api.auth.login}`;
        };

        const updateFilter = () => {
            composition.set(
                config.get(_originalValue)
                    .filter((value: any) => {                                    
                        for (const Filter of _allInstances as Filter[]) {
                            if(Filter.resolve(value) == false) return false
                        }
                        return true
                    })
            )
        }

        this.subsToPart('filter', composition, () => {
            updateFilter()
        })

        const localFilterEnabled = composition.api.localFilters.length > 0

        const setValue = (result: any) => {
            if(localFilterEnabled) {
                config.set(_originalValue, result)
                updateFilter()
            }
            else {
                composition.set(result)
            }
        }

        for (const filter of composition.api.localFilters as string[]) {
            const object = Filter.instance(filter)
            object.on(() => {
                updateFilter()
            })
            _allInstances.push(object)
        }

        if(composition.get() == null) composition.set([])

        const property = {
            __obbsv: 2,
            _forceMode: false,
            all() {
                composition.lastStep = () => { property.user().all() }

                if(this._forceMode == false && composition.api.optimization.preventRepeat) {
                    if(Object.keys(composition.get()).length > 0) {
                        return composition.get()
                    }
                }
                config.set(_fetching, true)
                
                let query = _pthis.compileQuery(composition)
                let path = composition.api.path

                let url = buildUrl(path, query, {}, composition.template)
                let params = Object.assign({method: composition.api.method}, composition.api.customParams, customParams);
                
                _pthis.raiseMethod(composition, 'on awake', [])
                try{
                    return queryToApi(
                        url, params, composition.template, composition
                    ).then((ival: any[]) => {
                        _pthis.subsToPart('proccess',composition, () => {
                            _pthis.raiseMethod(composition, 'before process', [ival], (res: any) => {ival = res})
                            composition.convert.map.forEach((value) => {
                                ival = ival.map(value as any)
                            })
                            if(composition.convert.isFlat) {
                                ival = ival.flat()
                            }
                            let iValPost = ival;
                            _pthis.subsToPart('sort', composition, () => {
                                composition.convert.sort.forEach((value) => {
                                    iValPost = iValPost.sort(value as any)
                                })
                                composition.convert.has.forEach((value) => {
                                    iValPost = iValPost.filter(value as any)
                                }) 
                                setValue(iValPost)
                            })
                            composition.convert.sort.forEach((value) => {
                                ival = ival.sort(value as any)
                            })
                            composition.convert.has.forEach((value) => {
                                ival = ival.filter(value as any)
                            })

                            _pthis.raiseMethod(composition, 'after process', [ival], (res: any) => {
                                ival = res
                            })
                            _pthis.raiseMethod(composition, 'on end', [ival], (res: any) => {
                                ival = res
                            })

                            this._forceMode = false
                            config.set(_max, composition.api.pagination.maxOffset)
                            config.set(_fetching, false)
                            setValue(ival)
                        }, true)
                        
                        return composition.get()
                    })
                } catch(e) {
                    this._forceMode = false
                    config.set(_fetching, false)
                    return composition.get()
                }
            },
            next() {
                composition.lastStep = () => { property.user().page(1, false) }

                config.set(_fetching, true)
                if(composition.api.pagination.maxOffset > 0) {
                    if(composition.api.pagination.offset < composition.api.pagination.maxOffset) {
                        composition.api.pagination.offset += 1
                        config.set(_current, composition.api.pagination.offset)
                        config.set(_isEnd, false)
                    }
                    else {
                        config.set(_isEnd, true)
                        config.set(_fetching, false)
                        return composition.get()
                    }
                }
                else {
                    composition.api.pagination.offset += 1
                }
                
                let query = _pthis.compileQuery(composition)
                let path = composition.api.path

                let url = buildUrl(path, query, {}, composition.template)
                let params = Object.assign({method: composition.api.method}, composition.api.customParams, customParams);
    
                _pthis.raiseMethod(composition, 'on awake', [])
                try{
                    return queryToApi(
                        url, params, composition.template, composition
                    ).then((ival) => {
                        _pthis.subsToPart('proccess',composition, () => {
                            _pthis.raiseMethod(composition, 'before process', [ival], (res: any) => {ival = res})
                            composition.convert.map.forEach((value) => {
                                ival = ival.map(value as any)
                            })
                            if(composition.convert.isFlat) {
                                ival = ival.flat()
                            }
                            composition.convert.sort.forEach((value) => {
                                ival = ival.sort(value as any)
                            })
                            composition.convert.has.forEach((value) => {
                                ival = ival.filter(value as any)
                            })

                            _pthis.raiseMethod(composition, 'after process', [ival], (res: any) => {
                                ival = res
                            })
                            _pthis.raiseMethod(composition, 'on end', [ival], (res: any) => {
                                ival = res
                            })
    
                            config.set(_max, composition.api.pagination.maxOffset)
                            config.set(_fetching, false)
                            if(composition.api.pagination.append) {
                                if(localFilterEnabled)
                                    setValue(config.get(_originalValue).concat(ival))
                                else
                                    setValue(composition.get().concat(ival))
                            }
                            else {
                                setValue(ival)
                            }

                        }, true)

                        return composition.get()

                    })
                } catch(e) {
                    config.set(_fetching, false)
                    return composition.get()
                }

            },
            prev() {
                composition.lastStep = () => { property.user().page(1, false) }

                config.set(_fetching, true)
                if(composition.api.pagination.offset > 1) {
                    composition.set([])
                    composition.api.pagination.offset -= 1
                    config.set(_current, composition.api.pagination.offset)
                }
                else {
                    config.set(_fetching, false)
                    return composition.get()
                }
                
                let query = _pthis.compileQuery(composition)
                let path = composition.api.path

                let url = buildUrl(path, query, {}, composition.template)
                let params = Object.assign({method: composition.api.method}, composition.api.customParams, customParams);
    
                _pthis.raiseMethod(composition, 'on awake', [])
                try{
                    return queryToApi(
                        url, params, composition.template, composition
                    ).then((ival) => {
                        _pthis.subsToPart('proccess',composition, () => {
                            _pthis.raiseMethod(composition, 'before process', [ival], (res: any) => {ival = res})
                            composition.convert.map.forEach((value) => {
                                ival = ival.map(value as any)
                            })
                            if(composition.convert.isFlat) {
                                ival = ival.flat()
                            }
                            composition.convert.sort.forEach((value) => {
                                ival = ival.sort(value as any)
                            })
                            composition.convert.has.forEach((value) => {
                                ival = ival.filter(value as any)
                            })
    
                            _pthis.raiseMethod(composition, 'after process', [ival], (res: any) => {
                                ival = res
                            })
                            _pthis.raiseMethod(composition, 'on end', [ival], (res: any) => {
                                ival = res
                            })
                            
                            config.set(_max, composition.api.pagination.maxOffset)
                            config.set(_fetching, false)
                            setValue(ival)
                        }, true)

                        return composition.get()
                    })
                } catch(e) {
                    config.set(_fetching, false)
                    return composition.get()
                }

            },
            page(number: number, preventLastStep = true) {
                if(preventLastStep) composition.lastStep = () => { property.user().page(number) }

                if(this._forceMode == false && composition.api.optimization.preventRepeat) {
                    if(Object.keys(composition.get()).length > 0) {
                        return composition.get()
                    }
                }

                composition.set([])
                config.set(_fetching, true)
                composition.api.pagination.offset = number
                config.set(_current, composition.api.pagination.offset)
                
                let query = _pthis.compileQuery(composition)
                let path = composition.api.path

                let url = buildUrl(path, query, {}, composition.template)
                let params = Object.assign({method: composition.api.method}, composition.api.customParams, customParams);
    
                _pthis.raiseMethod(composition, 'on awake', [])
                return queryToApi(
                    url, params, composition.template, composition
                ).then((ival) => {
                    _pthis.subsToPart('proccess',composition, () => {
                        _pthis.raiseMethod(composition, 'before process', [ival], (res: any) => {ival = res})

                        composition.convert.map.forEach((value) => {
                            ival = ival.map(value as any)
                        })
                        if(composition.convert.isFlat) {
                            ival = ival.flat()
                        }
                        composition.convert.sort.forEach((value) => {
                            ival = ival.sort(value as any)
                        })
                        composition.convert.has.forEach((value) => {
                            ival = ival.filter(value as any)
                        })

                        _pthis.raiseMethod(composition, 'after process', [ival], (res: any) => {
                            ival = res
                        })
                        _pthis.raiseMethod(composition, 'on end', [ival], (res: any) => {
                            ival = res
                        })

                        config.set(_max, composition.api.pagination.maxOffset)
                        config.set(_fetching, false)
                        setValue(ival)
                    }, true)
                    return composition.get()
                })
            },
            pageBy(name: string) {
                composition.lastStep = () => { property.user().pageBy(name) }

                if(this._forceMode == false && composition.api.optimization.preventRepeat) {
                    if(Object.keys(composition.get()).length > 0) {
                        return composition.get()
                    }
                }

                composition.set([])
                config.set(_fetching, true)

                const router = config.router()
                if(router.currentRoute.value.params && name in router.currentRoute.value.params) {
                    composition.api.pagination.offset = Number.parseInt(router.currentRoute.value.params[name])
                }
                else if(router.currentRoute.value.query && name in router.currentRoute.value.query) {
                    composition.api.pagination.offset = Number.parseInt(router.currentRoute.value.query[name])
                }

                let query = _pthis.compileQuery(composition)
                let path = composition.api.path

                let url = buildUrl(path, query, {}, composition.template)
                let params = Object.assign({method: composition.api.method}, composition.api.customParams, customParams);
                config.set(_current, composition.api.pagination.offset)
    
                _pthis.raiseMethod(composition, 'on awake', [])
                return queryToApi(
                    url, params, composition.template, composition
                ).then((ival) => {
                    _pthis.subsToPart('proccess',composition, () => {
                        _pthis.raiseMethod(composition, 'before process', [ival], (res: any) => {ival = res})
                        
                        composition.convert.map.forEach((value) => {
                            ival = ival.map(value as any)
                        })
                        if(composition.convert.isFlat) {
                            ival = ival.flat()
                        }
                        composition.convert.sort.forEach((value) => {
                            ival = ival.sort(value as any)
                        })
                        composition.convert.has.forEach((value) => {
                            ival = ival.filter(value as any)
                        })

                        _pthis.raiseMethod(composition, 'after process', [ival], (res: any) => {
                            ival = res
                        })
                        _pthis.raiseMethod(composition, 'on end', [ival], (res: any) => {
                            ival = res
                        })

                        config.set(_max, composition.api.pagination.maxOffset)
                        config.set(_fetching, false)
                        setValue(ival)
                    }, true)
                    return composition.get()
                })
            },
            size(size: number) {
                composition.api.pagination.size = size
                return this
            },
            method(type: any) {
                composition.api.method = type
                return this
            },
            customAuth(token: any) {
                composition.api.auth.login = token;
                composition.api.auth.use = true;
                return this;
            },
            setQuery(params: any) {
                composition.api.query = params
                return this
            },
            user() {
                this._forceMode = true
                return this
            }
        }

        Object.defineProperty(property, 'value', {
            get() { return composition.get() },
            set(v) { composition.set(v) },
        })

        Object.defineProperty(property, 'isLoading', {
            get() { return config.get(_fetching) },
        })

        Object.defineProperty(property, 'isFinished', {
            get() { return config.get(_isEnd) },
        })

        Object.defineProperty(property, 'max', {
            get() { return config.get(_max) },
        })

        Object.defineProperty(property, 'current', {
            get() { return config.get(_current) },
        })

        return property
    }

    // Segment doOne
    // if keep()
    protected wayMany1(composition: IStateComposition, val: number) {
        throw "keep() cannot be many()"
    }

    // Segment doOne
    // if nobody
    protected wayMany0(composition: IStateComposition, val: number) {
        return composition
    }
}
export class MoleculaComposition extends CompositionBuilder {

}