import { reactive } from "vue";
import { uniqId } from "./Utils.js";
const isClient = typeof document !== 'undefined';
const storageOfStores = new Map();
const laterAwaiter = [];
export function forgetAllStores() {
    storageOfStores.clear();
}
export function deleteDump() {
    const recursiveDeleteDump = (_value) => {
        if (_value._variables) {
            for (const [key, _] of Object.entries(_value._variables)) {
                _value._variables[key] = _value._defaults[key];
            }
        }
        if (_value._stores) {
            for (const [_, value] of Object.entries(_value._stores)) {
                recursiveDeleteDump(value);
            }
        }
        for (const name of Object.getOwnPropertyNames(_value)) {
            const value = _value[name];
            if (typeof value == 'object' && value != null && '_variables' in value && value._variables && typeof value._variables == 'object' && 'response' in value._variables) {
                value._variables.response = null;
                value._query = {};
            }
        }
    };
    for (const [key, value] of storageOfStores.entries()) {
        recursiveDeleteDump(value);
    }
}
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
    const variables = reactive({});
    Object.defineProperty(instance, '_defaults', {
        value: {},
        configurable: false
    });
    Object.defineProperty(instance, '_variables', {
        get() { return variables; },
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
                        watch(func, customKey) {
                            if (!isClient)
                                return;
                            const uid = customKey ?? uniqId();
                            if (!(p in instance._watcher)) {
                                later(() => instance._watcher[p].set(uid, func));
                            }
                            else {
                                instance._watcher[p].set(uid, func);
                            }
                            return () => instance._watcher[p].delete(uid);
                        },
                        unwatch(key) {
                            return instance._watcher[p].delete(key);
                        },
                        clearWatching(startWith) {
                            if (!startWith)
                                return instance._watcher[p].clear();
                            if (startWith) {
                                instance._watcher[p].forEach((_, key) => {
                                    if (key.startsWith(startWith))
                                        instance._watcher[p].delete(key);
                                });
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
        if (instance._watcher[nameObject]) {
            instance._watcher[nameObject].forEach((callback) => {
                callback();
            });
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
        instance._watcher[name] = new Map();
    };
    const isDefaultVar = (name) => name == 'ref' || name == '_defaults' || name == '_stores' || name == '_variables' || name == '_watcher';
    for (const propertyName of Object.getOwnPropertyNames(instance)) {
        if (isDefaultVar(propertyName))
            continue;
        const valueOfProperty = instance[propertyName];
        const isNotClassObject = (v = valueOfProperty) => (typeof v != 'undefined' && v != null)
            && (typeof v != 'object' || (typeof v == 'object' && Object.getPrototypeOf(v).__proto__ == null || Array.isArray(v)));
        if (typeof valueOfProperty == 'undefined') {
            if ('_' + propertyName in instance) {
                if (isNotClassObject(instance['_' + propertyName])) {
                    instance._variables[propertyName] = instance['_' + propertyName];
                    instance._defaults[propertyName] = instance['_' + propertyName];
                    objectDefineReadOnly(propertyName, propertyName);
                    objectDefine('_' + propertyName, propertyName);
                }
                else {
                    instance._stores[propertyName] = instance['_' + propertyName];
                    objectDefineReadOnly(propertyName, propertyName, '_stores');
                    objectDefine('_' + propertyName, propertyName, '_stores');
                }
            }
        }
        else if ((isNotClassObject() || valueOfProperty == null) && propertyName[0] != '_') {
            instance._variables[propertyName] = valueOfProperty;
            instance._defaults[propertyName] = valueOfProperty;
            objectDefine(propertyName, propertyName);
        }
    }
    for (const [name, value] of Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(instance)))) {
        if (isDefaultVar(name))
            continue;
        if (typeof value.value == 'undefined' && typeof value.get == 'undefined') {
            if ('_' + name in instance) {
                instance._variables[name] = instance['_' + name];
                instance._defaults[name] = instance['_' + name];
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
                instance._watcher[name] = new Map();
            }
        }
    }
    if ('mounted' in instance) {
        instance.mounted();
    }
    return instance;
}
export function defineStore(store) {
    const objectStore = storageOfStores.get(store);
    if (typeof objectStore == 'undefined') {
        let object = raise(store);
        storageOfStores.set(store, object);
        return object;
    }
    return objectStore;
}
export function subStore(object) {
    return raise(object);
}
export function later(callback) {
    if (typeof localStorage == 'undefined') {
        return new Promise((resolve, reject) => {
            laterAwaiter.push(() => {
                resolve(callback());
            });
        });
    }
    return callback();
}
