import { StateComposition } from "../compiler.js"

export const _instances: Map<string, StateManager> = new Map()
const _earlyInstances: StateManager[] = []

export default class StateManager {
    private _nameInstance: string = ""
    protected _isServer: boolean = false
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

    public getParams(name: string) {
        return this._paramsObjects.get(name) as any
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
                    if(dataContains.__obbsv != 2) {
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
                        this._paramsObjects.set(name, dataContains)
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