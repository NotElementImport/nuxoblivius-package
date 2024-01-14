import { Ref, ref, computed } from 'vue';
import { preProcces as fetchPreProc } from './compilationFetch.js'
import { preProcces as storagePreProc } from './compilationStorage.js'
import { preProcces as webSocketPreProc } from './compilationWebSocket.js'

const _allStateManagers = new Map<string, SM>()

// Type of render
export enum ETypeRender {
    STATIC,
    FETCH,
    STORAGE,
    WEBSOCKET,
    REACTIVE,
    EMPTY
}

export function useStore<T>(name: string, obj: typeof SM): T {
    if(!_allStateManagers.has(name)) {
        const _object = new obj();
        (_object as any).serialize()

        _allStateManagers.set(name, _object)
        return _object as T
    }
    return _allStateManagers.get(name) as T
}

export default class SM {
    private _containersOfProps: Map<string, Ref<any>> = new Map()
    private _containersDescription: Map<string, {type: ETypeRender}> = new Map()

    constructor() {}

    protected fetch<T>(url: string|{path: string, query: {[name: string]: any}}, options: RequestInit) {
        return fetchPreProc<T>(url, options)
    }

    protected storage<T>(name: string, defaultValue: T) {
        return storagePreProc<T>(name, defaultValue)
    }

    protected webSoket(url: string|{path: string, query: {[name: string]: any}}, protocols: string|string[]) {
        return webSocketPreProc(url, protocols)
    }

    protected static<T>(value: T): T {
        return {
            'of': ETypeRender.STATIC,
            'value': value
        } as T
    }

    public raw<T>(name: string): Ref<T> {
        return this._containersOfProps.get(name) as Ref<T>
    }

    public rawIs(name: string): ETypeRender {
        const element = this._containersDescription.get(name)
        if(element)
            return element.type
        return ETypeRender.EMPTY 
    }

    protected serialize() {
        const proto = Object.getPrototypeOf(this)
        const names = Object.getOwnPropertyNames(this)
        const funcNames = Object.getOwnPropertyNames(proto)

        for(const name of names) {
            const container = (this as any)[name]
            if(typeof container == 'object' && 'of' in container) {
                if(container.of == ETypeRender.STATIC) {
                    this._setStatic(name, container.value)
                }
            }
            else {
                if(name[0] != '_') {
                    console.log(name)
                    this._setDefaultRef(name, container)
                }
            }
        }

        for(const name of funcNames) {
            const isDescript = typeof (this as any)[name] !== 'function'
            if(isDescript) {
                const descript = Object.getOwnPropertyDescriptor(proto, name)
                this._setDescriptor(name, descript as PropertyDescriptor)
            }
        }
    }

    private _setDescriptor(name: string, descript: PropertyDescriptor): void {
        let finalGetter = descript.get
        let finalSetter = descript.set

        if(descript.get) {
            const myObject = computed(() => descript.get?.call(this))
            this._containersOfProps.set(name, myObject)
            finalGetter = () => myObject.value
        }

        Object.defineProperty(this, name, {
            get: finalGetter,
            set: finalSetter
        })
    }

    private _setDefaultRef(name: string, value: any): void {
        const myObject = ref(value)
        this._containersOfProps.set(name, myObject)
        this._containersDescription.set(name, {
            type: ETypeRender.REACTIVE
        })

        Object.defineProperty(this, name, {
            get() {
                return myObject.value
            },
            set(v) {
                myObject.value = v
            }
        })
    }

    private _setStatic(name: string, value: any): void {
        const staticType = {
            value: value
        }

        this._containersDescription.set(name, {
            type: ETypeRender.STATIC
        })

        Object.defineProperty(this, name, {
            get() {
                return staticType.value
            },
            set(v) {
                staticType.value = v
            }
        })
    }
} 

export * from './ref.js'