import { reactive, onMounted, onUnmounted, watch } from "vue"
import Storage from "./Storage.js"
import StoreRecord from "./Record.js"

const storageOfStores = new Map<object, any>()

const laterAwaiter: Function[] = []
const configAwaiter: Function[] = []

export const onMountedApp = () => {
    for (const func of laterAwaiter) {
        func()
    }
}
export const onConfigured = () => {
    for (const func of configAwaiter) {
        func()
    }
}

// export const hydrateDataFromStores = () => {
//     let meta: any = {}
//     const clearAllResponses: Function[] = []

//     for (const [store, instance] of storageOfStores.entries()) {
//         let isHad = ''
//         const temp = {}

//         const notSystem = (p: string) => 
//             p != 'ref' 
//             && p != '_variables'
//             && p != '_watcher'
//             && p != '_stores'

//         const writeTo = (to: any, object: any) => {
//             const hyd = (p: string, value: any) => to[p] = value
//             const existDuplicate = (p: string) => '_'+p in object
//             const isRecord = (p: string) => object[p] instanceof StoreRecord
//             const isStorage = (p: string) => object[p] instanceof Storage
//             const isNotObject = (p: string) => typeof object[p] != "object"

//             for (const property of Object.getOwnPropertyNames(object)) {
//                 if(notSystem(property) && !existDuplicate(property)) {
//                     if(isRecord(property)) {
//                         hyd(property, object[property].response)
//                         clearAllResponses.push(() => {object[property]._variables.response = null})
//                     }
//                     else if(isNotObject(property)) {
//                         hyd(property, object[property])
//                     }
//                     else {
//                         to[property] = {}
//                         writeTo(to[property], object[property])
//                     }
//                     isHad += property.substring(0, 3)
//                 }
//             }
//         }

//         writeTo(temp, instance)

//         meta[btoa(isHad.substring(0, 32))] = temp
//     }

//     const dataToReturn = JSON.stringify(meta)
//     clearAllResponses.forEach((v) => v())
//     return dataToReturn
// }

// export const hydrateOnClient = (data: Record<string, any>) => {
//     const exist = (hash: string) => hash in data
//     const storeHash = (store: object) => {
//         let isHad = ''

//         const notSystem = (p: string) => 
//             p != 'ref' 
//             && p != '_variables'
//             && p != '_watcher'
//             && p != '_stores'

//         const readVariables = (object: any) => {
//             const existDuplicate = (p: string) => '_'+p in object
//             const isRecord = (p: string) => object[p] instanceof StoreRecord

//             for (const property of Object.getOwnPropertyNames(object)) {
//                 if(notSystem(property) && !existDuplicate(property)) {
//                     if(typeof object[property] === "object" && object[property] != null && !isRecord(property)) {
//                         readVariables(object[property])
//                     }
//                     isHad += property.substring(0, 3)
//                 }
//             }
//         }

//         readVariables(store)

//         return btoa(isHad.substring(0, 32))
//     }

//     for (const [store, instance] of storageOfStores.entries()) {
//         const hash = storeHash(instance)

//         if(!exist(hash)) {
//             continue;
//         }

//         const hydrateData = data[hash]

//         const notSystem = (p: string) => 
//             p != 'ref' 
//             && p != '_variables'
//             && p != '_watcher'
//             && p != '_stores'

//         const setAttributes = (to: Record<string, any>, object: Record<string, any>) => {
//             const hyd = (p: string, value: any) => to[p] = value
//             const existDuplicate = (p: string) => '_'+p in object
//             const isRecord = (p: string) => to[p] instanceof StoreRecord
//             const isNotObject = (p: string) => typeof to[p] != "object"

//             for (const property of Object.getOwnPropertyNames(object)) {
//                 if(notSystem(property) && !existDuplicate(property)) {
//                     if(typeof object[property] == 'undefined' || object[property] == null)
//                         continue;

//                     if(isRecord(property)) {
//                         if(object[property] != null) {
//                             to[property]._isHydration = true;
//                         }
//                         to[property]._variables.response = object[property]
//                     }
//                     else if(isNotObject(property)) {
//                         hyd(property, object[property])
//                     }
//                     else {
//                         setAttributes(to[property], object[property])
//                     }
//                 }
//             }
//         }

//         setAttributes(instance, hydrateData)
//     }
// }

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

    Object.defineProperty(instance, '_variables', {
        value: reactive({}),
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
        for (const func of instance._watcher[nameObject]) {
            func()
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

    // Define property to reactive
    for (const propertyName of Object.getOwnPropertyNames(instance)) {
        const valueOfProperty = instance[propertyName]
        
        // If Undefined
        if(typeof valueOfProperty == 'undefined') {
            if('_'+propertyName in instance) {
                if(typeof instance['_'+propertyName] != 'object') {
                    instance._variables[propertyName] = instance['_'+propertyName]

                    objectDefineReadOnly(propertyName, propertyName)
                    objectDefine('_'+propertyName, propertyName)
                }
                else {
                    if(instance['_'+propertyName] instanceof Storage) {
                        instance._variables[propertyName] = instance['_'+propertyName]
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
        else if((typeof valueOfProperty != 'object' || valueOfProperty == null) && propertyName[0] != '_') {
            instance._variables[propertyName] = valueOfProperty

            objectDefine(propertyName, propertyName)
        }
        // Is Storage 
        else if(valueOfProperty instanceof Storage && propertyName[0] != '_') {
            instance._variables[propertyName] = valueOfProperty

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
        if(typeof value.value == 'undefined' && typeof value.get == 'undefined') {
            if('_'+name in instance) {
                instance._variables[name] = instance['_'+name]

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

    return instance
} 

export function defineStore<T>(store: any): T {
    const objectStore = storageOfStores.get(store)

    if(typeof objectStore == 'undefined') {
        let object = raise(store)

        storageOfStores.set(store, object as any)
        return object as T
    }

    return objectStore
}

export function subStore<T>(object: any): T {
    return raise(object) as T
}

export function defineForm<T>(store: any): T {
    const instance = raise(store)
    
    return instance as T
}

export function afterConfig(callback: Function) {
    configAwaiter.push(callback)
}

export function later(callback: () => any) {
    if(typeof localStorage == 'undefined') {
        return new Promise((resolve, reject) => {
            laterAwaiter.push(() => {
                resolve(callback())
            })
        })
    }

    return callback()
}