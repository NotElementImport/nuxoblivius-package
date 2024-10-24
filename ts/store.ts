import { isRef, reactive, watch } from "vue"
import { hash, isPrimitive } from "./utils.js"

type Definition<T> = ((t: object, p: object) => T|{new(): T})

const symProps  = Symbol()
const symStore  = Symbol()
const symInline = Symbol()
const symRaw    = Symbol()
const symWatch  = Symbol()

const stores = new Map<any, Record<string, any>>()

enum IStoreType {
    PUBLIC=0,
    SCOPED=1
}

export const toComputed = (followers: string[], handler: () => any) =>
    ([ symProps, followers, handler ])

const initStore = (store: Definition<any>, props: Record<string, any> = {}) => {
    const $instance = {
        unwatch(key: string) { $instance[symWatch][key]?.() },
        watch(handle: Function, key?: string) {
            key = key ?? hash()
            $instance[symWatch][key] = watch($instance[symProps], handle as any, { flush: 'sync', deep: true })
            return key
        },
        [symWatch]:  {} as Record<string, Function>,
        [symInline]: false,
        [symRaw]:    {} as Record<string, any>,
        [symProps]:  reactive<Record<string, any>>({})
    }

    const mut = <T>(value:T) => {
        const key = hash()
        const onChange: Function[] = []

        const toProxy = (v: any) => 
            Array.isArray(v) || typeof v == 'object'
                ? new Proxy(v as object, { set(target, p, newValue, receiver) {
                    Reflect.set(target, p, toProxy(newValue), receiver)
                    onChange.forEach(v => v())
                    return true
                }}) as T
                : v

        $instance[symProps][key] = toProxy(value)

        return {
            [symStore]: IStoreType.PUBLIC,
            change(f: Function) {
                return onChange.push(f), this
            },
            get value()     { return $instance[symProps][key] as T },
            set value(v: T) { $instance[symProps][key] = toProxy(v); onChange.forEach(v => v()) },
            get valid()     { return ($instance[symProps][key] ?? null) != null }
        }
    }

    const scoped = <T>(value:T) => {
        const data = mut(value)
        return data[symStore] = IStoreType.SCOPED, data
    }

    const computed = (followers: any[], handler: Function) => {
        const key = hash()
        const watchKey = hash()
        $instance[symProps][key] = null

        const raise = () =>
            $instance[symProps][key] = handler()

        for (const follower of followers) {
            if(typeof follower != 'object') continue
            else if(symStore in follower)
                follower.change(() => {
                    if(Array.isArray(follower.value)) {
                        follower.value.forEach((item: any) => {
                            if(typeof item == 'object') {
                                if(symWatch in item)
                                    (item.unwatch(watchKey), item.watch(() => raise(), watchKey))
                                else if(isRef(item))
                                    (follower.unwatch?.(), follower.unwatch = watch(follower, raise, { flush: 'sync', deep: true }))
                            }
                        });
                    }
                    raise()
                })
            else if(isRef(follower))
                watch(follower, raise, { flush: 'sync', deep: true })
        }

        return $instance[symProps][key] = handler(), {
            [symStore]: IStoreType.SCOPED,
            get value() { return $instance[symProps][key] },
            get valid() { return ($instance[symProps][key] ?? null) != null }
        }
    }

    const $append = (key: string, get: () => any, set?: (v: any) => void) =>
        Object.defineProperty($instance, key, { get, set })

    let storeContent: Record<string, any> = 
        store.toString().startsWith('class')
            ? new (store as any)(props)
            : ($instance[symInline] = true, store({ mut, scoped, computed }, props))

    for (const [key, value] of Object.entries(storeContent)) {
        let toProxy = value

        // Class Store => Conver props to mut()
        if(isPrimitive(value) && !$instance[symInline] && key[0] != '_') {
            if(Array.isArray(value) && value[0] == symProps) { // Computed
                toProxy = computed(
                    value[1].map((v: any) => typeof v == 'string' ? $instance[symRaw][v] : v), 
                    value[2])
                Object.defineProperty(storeContent, key, { get() { return toProxy.value } })
            }
            else { // Scoped / Mut
                toProxy = key[0] == '$'
                    ? scoped(value)
                    : mut(value);
                Object.defineProperty(storeContent, key, { get() { return toProxy.value }, set (v) { toProxy.value = v } })
            }
        }

        if(typeof toProxy == 'object') {
            if(symStore in toProxy) {
                $instance[symRaw][key] = toProxy
                $append(
                    key, 
                    () => toProxy.value, 
                    toProxy[symStore] == IStoreType.PUBLIC ? (v) => toProxy.value = v : undefined
                )
            }
            else if(isRef(toProxy)) {
                $append(key, () => toProxy.value, (v) => toProxy.value = v)
            }
        }
        else if(typeof toProxy == 'function')
            $append(key, () => storeContent[key])
        else
            $append(key, () => storeContent[key], (v) => storeContent[key] = v)
    }

    if(!$instance[symInline]) {
        for (const [key, value] of Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(storeContent)))) {
            if(key == 'constructor') continue
            else if(key.startsWith('change')) {
                let prop = key.replace('change', '')
                prop = prop[0].toLocaleLowerCase() + prop.slice(1)
                $instance[symRaw][prop].change(() => storeContent[key]())
            }
            else
                $append(key, () => (...args: any) => storeContent[key](...args))
        }
    }

    return $instance
}

export const defineSingletone = <T>(store: Definition<T>, key: string|null = null): T => {
    key = key ?? store as any

    if(stores.has(key))
        return stores.get(key) as T
    
    const instance = initStore(store) as T
    return stores.set(key, instance), instance
}

export const defineFactory = <T>(store: Definition<T>): ((props: any) => T) => {
    return (props: any) => initStore(store, props) as T
}