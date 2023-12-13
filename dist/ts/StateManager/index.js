import { StateComposition } from "../compiler.js";
export const _instances = new Map();
const _earlyInstances = [];
export default class StateManager {
    _nameInstance = "";
    _isServer = false;
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
    getParams(name) {
        return this._paramsObjects.get(name);
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
                    if (dataContains.__obbsv != 2) {
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
                        this._paramsObjects.set(name, dataContains);
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
