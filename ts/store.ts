import { reactive } from "vue"
import { hash } from "./utils.js"

type Definition<T> = ((t: object, p: object) => T|{new(): T})

const symProps  = Symbol()
const symStore  = Symbol()
const symInline = Symbol()

const stores = new Map<any, Record<string, any>>()

enum IStoreType {
    PUBLIC=0,
    SCOPED=1
}

const initStore = (store: Definition<any>, props: Record<string, any> = {}) => {
    const $instance = {
        [symInline]: false,
        [symProps]: reactive<Record<string, any>>({})
    }

    const mut = <T>(value:T) => {
        const key = hash()
        const onChange: Function[] = []

        $instance[symProps][key] = value

        return {
            [symStore]: IStoreType.PUBLIC,
            change(f: Function) {
                return onChange.push(f), this
            },
            get value()     { return $instance[symProps][key] as T },
            set value(v: T) { $instance[symProps][key] = v; onChange.forEach(v => v()) },
            get valid()     { return ($instance[symProps][key] ?? null) != null }
        }
    }

    const scoped = <T>(value:T) => {
        const data = mut(value)
        return data[symStore] = IStoreType.SCOPED, data
    }

    const $append = (key: string, get: () => any, set?: (v: any) => void) =>
        Object.defineProperty($instance, key, { get, set })

    let storeContent: Record<string, any> = 
        store.toString().startsWith('class')
            ? new (store as any)(props)
            : ($instance[symInline] = true, store({ mut, scoped }, props))

    for (const [key, value] of Object.entries(storeContent)) {
        if(typeof value == 'object') {
            if(symStore in value) {


                if(value[symStore] == IStoreType.PUBLIC)
                    Object.defineProperty($instance, key, { get() { return value.value }, set(v) { storeContent[key].value = v } })
                else if(value[symStore] == IStoreType.SCOPED)
                    Object.defineProperty($instance, key, { get() { return value.value } })
                continue
            }
            else if ((typeof value == 'object' && Object.getPrototypeOf(value).__proto__ == null ) || Array.isArray(value)) {
                proxy()
            }
        }
        else if(typeof value == 'function') {
            Object.defineProperty($instance, key, { get() { return storeContent[key] } })
        }
        else if(typeof value != 'object' && !$instance[symInline]) {
            toMut()
        }
    }

    if(!$instance[symInline]) {
        for (const [key, value] of Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(storeContent)))) {
            if(key == 'constructor') continue
            Object.defineProperty($instance, key, { get() { return (...args: any) => storeContent[key](...args) } })
        }
    }

    return $instance
}

export const defineSingletone = <T>(store: Definition<T>, key: string|null = null): T => {
    key = key ?? store as any

    if(stores.has(key))
        return stores.get(key) as T
    
    const instance = initStore(store) as T
    stores.set(key, instance)
    return instance
}

export const defineFactory = <T>(store: Definition<T>): ((props: any) => T) => {
    return (props: any) => initStore(store, props) as T
}