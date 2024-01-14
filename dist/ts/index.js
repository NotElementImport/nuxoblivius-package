import { ref, computed } from 'vue';
import { preProcces as fetchPreProc } from './compilationFetch.js';
import { preProcces as storagePreProc } from './compilationStorage.js';
import { preProcces as webSocketPreProc } from './compilationWebSocket.js';
const _allStateManagers = new Map();
// Type of render
export var ETypeRender;
(function (ETypeRender) {
    ETypeRender[ETypeRender["STATIC"] = 0] = "STATIC";
    ETypeRender[ETypeRender["FETCH"] = 1] = "FETCH";
    ETypeRender[ETypeRender["STORAGE"] = 2] = "STORAGE";
    ETypeRender[ETypeRender["WEBSOCKET"] = 3] = "WEBSOCKET";
    ETypeRender[ETypeRender["REACTIVE"] = 4] = "REACTIVE";
    ETypeRender[ETypeRender["EMPTY"] = 5] = "EMPTY";
})(ETypeRender || (ETypeRender = {}));
export function useStore(name, obj) {
    if (!_allStateManagers.has(name)) {
        const _object = new obj();
        _object.serialize();
        _allStateManagers.set(name, _object);
        return _object;
    }
    return _allStateManagers.get(name);
}
export default class SM {
    _containersOfProps = new Map();
    _containersDescription = new Map();
    constructor() { }
    fetch(url, options) {
        return fetchPreProc(url, options);
    }
    storage(name, defaultValue) {
        return storagePreProc(name, defaultValue);
    }
    webSoket(url, protocols) {
        return webSocketPreProc(url, protocols);
    }
    static(value) {
        return {
            'of': ETypeRender.STATIC,
            'value': value
        };
    }
    raw(name) {
        return this._containersOfProps.get(name);
    }
    rawIs(name) {
        const element = this._containersDescription.get(name);
        if (element)
            return element.type;
        return ETypeRender.EMPTY;
    }
    serialize() {
        const proto = Object.getPrototypeOf(this);
        const names = Object.getOwnPropertyNames(this);
        const funcNames = Object.getOwnPropertyNames(proto);
        for (const name of names) {
            const container = this[name];
            if (typeof container == 'object' && 'of' in container) {
                if (container.of == ETypeRender.STATIC) {
                    this._setStatic(name, container.value);
                }
            }
            else {
                if (name[0] != '_') {
                    console.log(name);
                    this._setDefaultRef(name, container);
                }
            }
        }
        for (const name of funcNames) {
            const isDescript = typeof this[name] !== 'function';
            if (isDescript) {
                const descript = Object.getOwnPropertyDescriptor(proto, name);
                this._setDescriptor(name, descript);
            }
        }
    }
    _setDescriptor(name, descript) {
        let finalGetter = descript.get;
        let finalSetter = descript.set;
        if (descript.get) {
            const myObject = computed(() => descript.get?.call(this));
            this._containersOfProps.set(name, myObject);
            finalGetter = () => myObject.value;
        }
        Object.defineProperty(this, name, {
            get: finalGetter,
            set: finalSetter
        });
    }
    _setDefaultRef(name, value) {
        const myObject = ref(value);
        this._containersOfProps.set(name, myObject);
        this._containersDescription.set(name, {
            type: ETypeRender.REACTIVE
        });
        Object.defineProperty(this, name, {
            get() {
                return myObject.value;
            },
            set(v) {
                myObject.value = v;
            }
        });
    }
    _setStatic(name, value) {
        const staticType = {
            value: value
        };
        this._containersDescription.set(name, {
            type: ETypeRender.STATIC
        });
        Object.defineProperty(this, name, {
            get() {
                return staticType.value;
            },
            set(v) {
                staticType.value = v;
            }
        });
    }
}
export * from './ref.js';
