import { StateComposition } from "../compiler.js";
export const _instances = new Map();
const _globalInstances = [];
export default class StateManager {
    _nameInstance = "";
    _isServer = false;
    static globalName = "";
    _paramsObjects = new Map();
    constructor(name = null) {
        this._nameInstance = this.constructor.name;
        if (name != null) {
            this._nameInstance = name;
        }
        if (_instances.has(this._nameInstance) == false) {
            _instances.set(this._nameInstance, null);
            const server = new this.constructor();
            _instances.set(this._nameInstance, server);
        }
        this._isServer = _instances.get(this._nameInstance) == null;
    }
    static manager(name) {
        return _instances.get(name);
    }
    static set(variable, value) {
        if (this.globalName != '') {
            let server = null;
            if (!_instances.has(this.globalName)) {
                _instances.set(this.globalName, null);
                server = new this();
                _instances.set(this.globalName, server);
            }
            else {
                server = _instances.get(this.globalName);
            }
            server[variable] = value;
            return;
        }
        throw "static.globalName not set: SM.set(), " + this.name + ", name: " + this.globalName;
    }
    static get(variable) {
        if (this.globalName != '') {
            let server = null;
            if (!_instances.has(this.globalName)) {
                _instances.set(this.globalName, null);
                // console.log(this.constructor as any)
                server = new this();
                _instances.set(this.globalName, server);
            }
            else {
                server = _instances.get(this.globalName);
            }
            return server[variable];
        }
        throw "static.globalName not set: SM.get(), " + this.name + ", name: " + this.globalName;
    }
    static ref(variable) {
        if (this.globalName != '') {
            let server = null;
            if (!_instances.has(this.globalName)) {
                _instances.set(this.globalName, null);
                server = new this();
                _instances.set(this.globalName, server);
            }
            return this.globalName + '.' + variable;
        }
        throw "static.globalName not set: SM.ref(), " + this.name + ", name: " + this.globalName;
    }
    getParams(name) {
        return _instances.get(this._nameInstance)?._paramsObjects.get(name);
    }
    debugParams() {
        return _instances.get(this._nameInstance)?._paramsObjects.entries();
    }
    watch(name, func) {
        _instances.get(this._nameInstance)?.getParams(name).subs.push(func);
    }
    catchOnce(name, func) {
        _instances.get(this._nameInstance)?.getParams(name).onceSubs.push(func);
    }
    static globalWatch(name, func) {
        if (this.globalName) {
            _instances.get(this.globalName)?.getParams(name).subs.push(func);
            return;
        }
        throw "static.globalName not set: SM.ref(), " + this.name + ", name: " + this.globalName;
    }
    manage() {
        const names = Object.getOwnPropertyNames(this);
        const getServer = _instances.get(this._nameInstance);
        for (const name of names) {
            if (this._isServer) {
                const objectGet = this[name];
                if (typeof objectGet == 'object' && '__wrt' in objectGet) {
                    const stateBuilder = new StateComposition();
                    const dataContains = stateBuilder.compile(objectGet);
                    dataContains.buxt = this;
                    dataContains.buxtName = name;
                    if (dataContains.__obbsv != 2) {
                        if (dataContains.__obbsv == 1) {
                            dataContains.cache.safe();
                        }
                        Object.defineProperty(this, name, {
                            get() {
                                return dataContains.get();
                            },
                            set(v) {
                                dataContains.set(v);
                            }
                        });
                        if (dataContains.type == 2) {
                            dataContains.get();
                        }
                        this._paramsObjects.set(name, dataContains);
                    }
                    else {
                        Object.defineProperty(this, name, {
                            get() {
                                return dataContains;
                            }
                        });
                        console.log(objectGet.__ref);
                        objectGet.__ref.buxt = this;
                        objectGet.__ref.buxtName = name;
                        this._paramsObjects.set(name, objectGet.__ref);
                    }
                }
            }
            else {
                const objectGet = this[name];
                if (typeof objectGet == 'object' && '__wrt' in objectGet) {
                    Object.defineProperty(this, name, {
                        get() {
                            return getServer[name];
                        },
                        set(v) {
                            getServer[name] = v;
                        }
                    });
                }
            }
        }
    }
    name() {
        return this._nameInstance;
    }
}
