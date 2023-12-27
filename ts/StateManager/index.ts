import { StaticKeyword } from "typescript"
import { StateComposition } from "../compiler.js"

export const _instances: Map<string, StateManager> = new Map()
const _globalInstances: StateManager[] = []

export default class StateManager {
    private _nameInstance: string = ""
    protected _isServer: boolean = false
    protected static globalName: string = ""
    private _paramsObjects: Map<string, {[key: string]:any}> = new Map()

    constructor(name: string|null = null) {
        this._nameInstance = this.constructor.name

        if(name != null) {
            this._nameInstance = name
        }

        if(_instances.has(this._nameInstance) == false) {
            _instances.set(this._nameInstance, null as any)
            const server = new (this.constructor as any)()
            _instances.set(this._nameInstance, server)
        }

        this._isServer = _instances.get(this._nameInstance) == null
    }

    public static manager<T extends StateManager>(name: string): T {
        return _instances.get(name) as T
    }

    public static set(variable: string, value: any) {
        if(this.globalName != '') {
            let server: StateManager = null as any
            if(!_instances.has(this.globalName)) {
                _instances.set(this.globalName, null as any)
                server = new this()
                _instances.set(this.globalName, server)
            }
            else {
                server = _instances.get(this.globalName) as any
            }
            (server as any)[variable] = value
            
            return
        }
        throw "static.globalName not set: SM.set(), " + this.name + ", name: " + this.globalName
    }
    
    public static get(variable: string) {
        if(this.globalName != '') {
            let server: StateManager = null as any
            if(!_instances.has(this.globalName)) {
                _instances.set(this.globalName, null as any)
                // console.log(this.constructor as any)
                server = new this()
                _instances.set(this.globalName, server)
            }
            else {
                server = _instances.get(this.globalName) as any
            }
            return (server as any)[variable]
        }
        throw "static.globalName not set: SM.get(), " + this.name + ", name: " + this.globalName
    }

    public static ref(variable: string): string {
        if(this.globalName != '') {
            let server: StateManager = null as any
            if(!_instances.has(this.globalName)) {
                _instances.set(this.globalName, null as any)
                server = new this()
                _instances.set(this.globalName, server)
            }
            return this.globalName+'.'+variable
        }
        throw "static.globalName not set: SM.ref(), " + this.name + ", name: " + this.globalName
    }

    public getParams(name: string) {
        return _instances.get(this._nameInstance)?._paramsObjects.get(name) as any
    }

    public debugParams() {
        return _instances.get(this._nameInstance)?._paramsObjects.entries()
    }

    public watch(name: string, func: () => void) {
        _instances.get(this._nameInstance)?.getParams(name).subs.push(func)
    }

    public catchOnce(name: string, func: () => void) {
        _instances.get(this._nameInstance)?.getParams(name).onceSubs.push(func)
    }

    public static globalWatch(name: string, func: () => void) {
        if(this.globalName) {
            _instances.get(this.globalName)?.getParams(name).subs.push(func)
            return
        }
        throw "static.globalName not set: SM.ref(), " + this.name + ", name: " + this.globalName
    }

    public static globalCatchOnce(name: string, func: () => void) {
        if(this.globalName) {
            _instances.get(this.globalName)?.getParams(name).onceSubs.push(func)
            return
        }
        throw "static.globalName not set: SM.ref(), " + this.name + ", name: " + this.globalName
    }

    protected manage() {
        const names = Object.getOwnPropertyNames(this)
        const getServer = _instances.get(this._nameInstance) as StateManager

        for(const name of names) {
            if(this._isServer) {
                const objectGet = (this as any)[name]
                if(typeof objectGet == 'object' &&  '__wrt' in objectGet) {
                    const stateBuilder = new StateComposition()
                    const dataContains = stateBuilder.compile(objectGet)
                    dataContains.buxt = this
                    dataContains.buxtName = name
                    if(dataContains.__obbsv != 2) {
                        if(dataContains.__obbsv == 1) {
                            dataContains.cache.safe()
                        }

                        Object.defineProperty(this, name, {
                            get() {
                                return dataContains.get()
                            },
                            set(v) {
                                dataContains.set(v)
                            }
                        })
                        if(dataContains.type == 2) {
                            dataContains.get()
                        }
                        this._paramsObjects.set(name, dataContains)
                    }
                    else {
                        Object.defineProperty(this, name, {
                            get() {
                                return dataContains
                            }
                        })
                        objectGet.__ref.buxt = this
                        objectGet.__ref.buxtName = name
                        this._paramsObjects.set(name, objectGet.__ref)
                    }
                }
            }
            else {
                const objectGet = (this as any)[name]
                if(typeof objectGet == 'object' &&  '__wrt' in objectGet) {
                    Object.defineProperty(this, name, {
                        get() {
                            return (getServer as any)[name]
                        },
                        set(v) {
                            (getServer as any)[name] = v
                        }
                    })
                }
            }
        }
    }

    protected name() {
        return this._nameInstance
    }
}