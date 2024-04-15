import { reactive } from "vue";
import Storage from "./Storage.js";
const storageOfStores = new Map();
const laterAwaiter = [];
const configAwaiter = [];
export const onMountedApp = () => {
    for (const func of laterAwaiter) {
        func();
    }
};
export const onConfigured = () => {
    for (const func of configAwaiter) {
        func();
    }
};
function create_proxy(target, get, has = (t, p) => true) {
    return new Proxy({}, {
        get(target, p, receiver) {
            return get(target, p, receiver);
        },
        has(target, p) {
            return has(target, p);
        },
    });
}
function raise(store) {
    store.prototype.ref = create_proxy({}, (t, p) => create_proxy({}, (subT, subP) => {
        return instance.ref[p][subP];
    }, () => true), () => true);
    const instance = new store();
    Object.defineProperty(instance, '_variables', {
        value: reactive({}),
        configurable: false
    });
    Object.defineProperty(instance, '_stores', {
        value: {},
        configurable: false
    });
    Object.defineProperty(instance, '_watcher', {
        value: {},
        configurable: false
    });
    Object.defineProperty(instance, 'ref', {
        get() {
            const proxy = create_proxy(store, (target, p, receiver) => {
                if (p in instance) {
                    if (instance._variables[p] instanceof Storage) {
                        return instance._variables[p].ref;
                    }
                    return {
                        _module_: 'EX-REF',
                        get value() {
                            return instance[p];
                        },
                        name: p,
                        get isEmpty() {
                            const value = instance[p];
                            return typeof value == 'undefined' || value == null;
                        },
                        get isImportant() {
                            return p[0] == '$';
                        },
                        watch(func) {
                            if (!(p in instance._watcher)) {
                                later(() => instance._watcher[p].push(func));
                            }
                            else {
                                instance._watcher[p].push(func);
                            }
                        }
                    };
                }
                throw `Object ${p} not founed`;
            });
            return proxy;
        }
    });
    const triggerToChanges = (nameObject) => {
        for (const func of instance._watcher[nameObject]) {
            func();
        }
    };
    const objectDefineReadOnly = (name, to, as = '_variables') => {
        Object.defineProperty(instance, name, {
            get() {
                return instance[as][to];
            }
        });
    };
    const objectDefine = (name, to, as = '_variables') => {
        Object.defineProperty(instance, name, {
            get() {
                return instance[as][to];
            },
            set(v) {
                instance[as][to] = v;
                triggerToChanges(to);
            }
        });
        instance._watcher[name] = [];
    };
    // Define property to reactive
    for (const propertyName of Object.getOwnPropertyNames(instance)) {
        const valueOfProperty = instance[propertyName];
        // If Undefined
        if (typeof valueOfProperty == 'undefined') {
            if ('_' + propertyName in instance) {
                if (typeof instance['_' + propertyName] != 'object') {
                    instance._variables[propertyName] = instance['_' + propertyName];
                    objectDefineReadOnly(propertyName, propertyName);
                    objectDefine('_' + propertyName, propertyName);
                }
                else {
                    if (instance['_' + propertyName] instanceof Storage) {
                        instance._variables[propertyName] = instance['_' + propertyName];
                        Object.defineProperty(instance, propertyName, {
                            get() {
                                return instance._variables[propertyName].value;
                            },
                        });
                        Object.defineProperty(instance, '_' + propertyName, {
                            get() {
                                return instance._variables[propertyName].value;
                            },
                            set(value) {
                                instance._variables[propertyName].value = value;
                            }
                        });
                    }
                    else {
                        instance._stores[propertyName] = instance['_' + propertyName];
                        objectDefineReadOnly(propertyName, propertyName, '_stores');
                        objectDefine('_' + propertyName, propertyName, '_stores');
                    }
                }
            }
        }
        // Is Reactive value
        else if ((typeof valueOfProperty != 'object' || valueOfProperty == null) && propertyName[0] != '_') {
            instance._variables[propertyName] = valueOfProperty;
            objectDefine(propertyName, propertyName);
        }
        // Is Storage 
        else if (valueOfProperty instanceof Storage && propertyName[0] != '_') {
            instance._variables[propertyName] = valueOfProperty;
            Object.defineProperty(instance, propertyName, {
                get() {
                    return valueOfProperty.value;
                },
                set(value) {
                    valueOfProperty.value = value;
                }
            });
        }
    }
    for (const [name, value] of Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(instance)))) {
        if (typeof value.value == 'undefined' && typeof value.get == 'undefined') {
            if ('_' + name in instance) {
                instance._variables[name] = instance['_' + name];
                Object.defineProperty(instance, name, {
                    get() {
                        return instance._variables[name];
                    },
                    set(v) {
                        value.set.call(instance, v);
                    }
                });
                Object.defineProperty(instance, '_' + name, {
                    get() {
                        return instance._variables[name];
                    },
                    set(v) {
                        instance._variables[name] = v;
                        triggerToChanges(name);
                    }
                });
                instance._watcher[name] = [];
            }
        }
    }
    return instance;
}
export function defineStore(store) {
    const objectStore = storageOfStores.get(store);
    if (typeof objectStore == 'undefined') {
        let object = raise(store);
        console.log(object);
        storageOfStores.set(store, object);
        return object;
    }
    return objectStore;
}
export function subStore(object) {
    return raise(object);
}
export function defineForm(store) {
    const instance = raise(store);
    return instance;
}
export function afterConfig(callback) {
    configAwaiter.push(callback);
}
export function later(callback) {
    return new Promise((resolve, reject) => {
        laterAwaiter.push(() => {
            resolve(callback());
        });
    });
}
