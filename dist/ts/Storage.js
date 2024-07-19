// import { appendMerge, isRef, queryToUrl, refOrVar, resolveOrLater, storeToQuery, urlPathParams } from "./Utils.js"
import { options as ConfigOptions } from "./config.js";
import { reactive } from "vue";
import { later } from "./index.js";
export default class Storage {
    static COOKIE = 2;
    static LOCALSTORAGE = 4;
    _where = 0;
    _name = '';
    _watchers = [];
    _reactvieVariables = reactive({
        value: null
    });
    static client(name, value) {
        const storage = new Storage(value);
        storage._name = name;
        storage._where = this.LOCALSTORAGE;
        later(() => {
            storage.loadToStorage(localStorage.getItem(name));
        });
        return storage;
    }
    static server(name, value) {
        const storage = new Storage(value);
        storage._name = name;
        storage._where = this.COOKIE;
        storage.loadToStorage(ConfigOptions.cookie.get(name));
        return storage;
    }
    constructor(value) {
        this._reactvieVariables.value = value;
    }
    get value() {
        return this._reactvieVariables.value;
    }
    set value(value) {
        this._reactvieVariables.value = value;
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        else if (typeof value === "function") {
            value = JSON.stringify({ '__func': true, 'body': value.toString() });
        }
        this.saveToStorage(value);
        for (const func of this._watchers) {
            func();
        }
    }
    loadToStorage(value) {
        if (typeof value == 'undefined' || value == null) {
            return;
        }
        if (typeof value === "string") {
            if (value[0] == '{') {
                const json = JSON.parse(value);
                if ('__func' in json) {
                    this._reactvieVariables.value = new Function(json.body);
                    return;
                }
                this._reactvieVariables.value = json;
            }
            else if (value == 'true') {
                this._reactvieVariables.value = true;
            }
            else if (value == 'false') {
                this._reactvieVariables.value = false;
            }
            else {
                this._reactvieVariables.value = value;
            }
            return;
        }
        this._reactvieVariables.value = value;
    }
    async saveToStorage(value) {
        if ((this._where & Storage.LOCALSTORAGE) == Storage.LOCALSTORAGE) {
            localStorage.setItem(this._name, value);
        }
        if ((this._where & Storage.COOKIE) == Storage.COOKIE) {
            if (ConfigOptions.cookie != null) {
                ConfigOptions.cookie.set(this._name, value);
            }
        }
    }
    get ref() {
        const rThis = this;
        return {
            _module_: 'EX-STG',
            name: this._name,
            get value() {
                return rThis._reactvieVariables.value;
            },
            set value(value) {
                rThis.value = value;
            },
            get isEmpty() {
                const value = rThis.value;
                return typeof value == 'undefined' || value == null;
            },
            get isImportant() {
                return false;
            },
            watch(func) {
                rThis._watchers.push(func);
            }
        };
    }
}
