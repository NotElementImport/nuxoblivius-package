import { reactive, onMounted, onUnmounted, watch } from "vue"
import Storage from "./Storage.js"
import StoreRecord from "./Record.js"

const isClient = typeof document !== 'undefined'

const storageOfStores = new Map<object, any>()

const laterAwaiter: Function[] = []
const configAwaiter: Function[] = []

export const onMountedApp = () => {
    for (const func of laterAwaiter) {
        func() // call functions from "later" array after vue mounting
    }
}
export const onConfigured = () => {
    for (const func of configAwaiter) {
        func()
    }
}
export function deleteDump() {
    const recursiveDeleteDump = (_value: any) => {
        if(_value._variables) {
            for (const [key, value] of Object.entries(_value._variables)) {
                _value._variables[key] = _value._defaults[key]
            }
        }

        if(_value._stores) {
            for (const [key, value] of Object.entries(_value._stores)) {
                recursiveDeleteDump(value)
            }
        }

        for (const name of Object.getOwnPropertyNames(_value)) {
            const value = _value[name]
            if(typeof value == 'object' && value != null && '_variables' in value && value._variables && typeof value._variables == 'object' && 'response' in value._variables) {
                value._variables.response = null
            }
        }
    }

    for (const [key, value] of storageOfStores.entries()) {
        recursiveDeleteDump(value);
    }
}

function create_proxy(target: object, get: Function, has: Function = (t: any, p: any) => true) {
    return new Proxy({}, {
        get(target, p, receiver) {
            return get(target, p, receiver)
        },
        has(target, p) {
            return has(target, p)
        },})
}

function raise(store: any) {
    store.prototype.ref = create_proxy({}, 
        (t: any, p: any,) => create_proxy({} , 
            (subT: any, subP: any) => {
                return instance.ref[p][subP]
            }, 
            () => true), 
        () => true)
    
    const instance = new store()

    const variables = reactive({})

    Object.defineProperty(instance, '_defaults', {
        value: {},
        configurable: false
    })
    Object.defineProperty(instance, '_variables', {
        get() {return variables},
        configurable: false
    })
    Object.defineProperty(instance, '_stores', {
        value: {},
        configurable: false
    })
    Object.defineProperty(instance, '_watcher', {
        value: {},
        configurable: false
    })
    Object.defineProperty(instance, 'ref', {
        get() {
            const proxy = create_proxy(store, 
                (target: any, p: any, receiver: any) => {
                    if(p in instance) {
                        if(instance._variables[p] instanceof Storage) {
                            return instance._variables[p].ref
                        }

                        return {
                            _module_: 'EX-REF',
                            get value() {
                                return instance[p]
                            },
                            name: p,
                            get isEmpty() {
                                const value = instance[p];
                                return typeof value == 'undefined' || value == null
                            },
                            get isImportant() {
                                return (p as string)[0] == '$'
                            },
                            watch(func: Function) {
                                if(!isClient)
                                    return

                                if(!(p in instance._watcher)) {
                                    later(() => instance._watcher[p].push(func))
                                }
                                else {
                                    instance._watcher[p].push(func)
                                }
                            }
                        }
                    }
                    
                    throw `Object ${p as string} not founed`
                })
            return proxy
        }
    })

    const triggerToChanges = (nameObject: string) => {
        if(instance._watcher[nameObject]) {
            for (const func of instance._watcher[nameObject]) {
                func()
            }
        }
    }

    const objectDefineReadOnly = (name: PropertyKey, to: string, as = '_variables') => {
        Object.defineProperty(instance, name, {
            get() {
                return instance[as][to]
            }
        })
    }

    const objectDefine = (name: PropertyKey, to: string, as = '_variables') => {
        Object.defineProperty(instance, name, {
            get() {
                return instance[as][to]
            },
            set(v) {
                instance[as][to] = v
                triggerToChanges(to)
            }
        })

        instance._watcher[name] = []
    }

    const isDefaultVar = (name: any) =>
        name == 'ref' || name == '_defaults' || name == '_stores' || name == '_variables' || name == '_watcher'

    // Define property to reactive
    for (const propertyName of Object.getOwnPropertyNames(instance)) {
        if(isDefaultVar(propertyName))
            continue;

        const valueOfProperty = instance[propertyName]
        
        const isNotClassObject = (v: any = valueOfProperty) =>
            typeof v != 'undefined' && v != null && typeof v == 'object' && Object.getPrototypeOf(v).__proto__ == null || Array.isArray(v)

        // If Undefined
        if(typeof valueOfProperty == 'undefined') {
            if('_'+propertyName in instance) {
                if(isNotClassObject(instance['_'+propertyName])) {
                    instance._variables[propertyName] = instance['_'+propertyName]
                    instance._defaults[propertyName] = instance['_'+propertyName]

                    objectDefineReadOnly(propertyName, propertyName)
                    objectDefine('_'+propertyName, propertyName)
                }
                else {
                    if(instance['_'+propertyName] instanceof Storage) {
                        instance._variables[propertyName] = instance['_'+propertyName]
                        instance._defaults[propertyName] = instance['_'+propertyName]
                        Object.defineProperty(instance, propertyName, {
                            get() {
                                return instance._variables[propertyName].value
                            },
                        })
                        Object.defineProperty(instance, '_'+propertyName, {
                            get() {
                                return instance._variables[propertyName].value
                            },
                            set(value: any) {
                                instance._variables[propertyName].value = value
                            }
                        })
                    }
                    else {
                        instance._stores[propertyName] = instance['_'+propertyName]
                        objectDefineReadOnly(propertyName, propertyName, '_stores')
                        objectDefine('_'+propertyName, propertyName, '_stores')
                    }
                }
            }
        }
        // Is Reactive value
        else if((isNotClassObject() || valueOfProperty == null) && propertyName[0] != '_') {
            instance._variables[propertyName] = valueOfProperty
            instance._defaults[propertyName] = valueOfProperty

            objectDefine(propertyName, propertyName)
        }
        // Is Storage 
        else if(valueOfProperty instanceof Storage && propertyName[0] != '_') {
            instance._variables[propertyName] = valueOfProperty
            instance._defaults[propertyName] = valueOfProperty

            Object.defineProperty(instance, propertyName, {
                get() {
                    return valueOfProperty.value
                },
                set(value: any) {
                    valueOfProperty.value = value
                }
            })
        }
    }

    for (const [name, value] of Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(instance)))) {
        if(isDefaultVar(name))
            continue;

        if(typeof value.value == 'undefined' && typeof value.get == 'undefined') {
            if('_'+name in instance) {
                instance._variables[name] = instance['_'+name]
                instance._defaults[name] = instance['_'+name]

                Object.defineProperty(instance, name, {
                    get() {
                        return instance._variables[name]
                    },
                    set(v: any) {
                        value.set.call(instance, v)
                    }
                })
                Object.defineProperty(instance, '_'+name, {
                    get() {
                        return instance._variables[name]
                    },
                    set(v) {
                        instance._variables[name] = v
                        triggerToChanges(name)
                    }
                })
                instance._watcher[name] = []
            }
        }
    }

    if('mounted' in instance) {
        instance.mounted()
    }

    return instance
}

/**
 * Store defining
 */
export function defineStore<T>(store: any): T {
    const objectStore = storageOfStores.get(store) // store may already exist

    if(typeof objectStore == 'undefined') {
        let object = raise(store) // if it isn't exists --> raise

        storageOfStores.set(store, object as any) // and save to storageOfStores array
        return object as T // return raised object with T type (from generic)
    }

    return objectStore // if it had been already exist
}

/**
 * subStore creating
 */
export function subStore<T>(object: any): T {
    return raise(object) as T
}

/**
 * Add function to laterAwaiter array (for a later call)
 * @returns 
 */
export function later(callback: () => any) {
    if(typeof localStorage == 'undefined') { // isServer
        return new Promise((resolve, reject) => {
            laterAwaiter.push(() => { // array consists of Promises
                resolve(callback())
            })
        })
    }

    return callback()
}