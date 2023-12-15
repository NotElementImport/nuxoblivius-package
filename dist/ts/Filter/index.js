import { ref } from "vue";
const instancesFilters = new Map();
// export const registerFilter = (name: string, filter: typeof Filter) => {
//     instancesFilters.set(
//         name, new filter({
//             'name': name,
//             '__special': 1
//         })
//     )
// }
export default class Filter {
    static globalName = '';
    __values = new Map();
    __types = new Map();
    __fully = new Map();
    __pStart = '';
    __pEnd = '';
    setup() { }
    constructor(config = {}) {
        if (!('__special' in config)) {
            throw "Filters cannot be created outside";
        }
        this.setup();
    }
    createFilter(items) {
        for (const [key, value] of Object.entries(items)) {
            this.__types.set(key, value[0]);
            this.__fully.set(key, !value[1]);
            switch (value[0]) {
                case 0: // Number
                    this.__values.set(key, ref(null));
                    break;
                case 1: // Array
                    this.__values.set(key, ref([]));
                    break;
                case 2: // String
                    this.__values.set(key, ref(''));
                    break;
                case 3: // Boolean
                    this.__values.set(key, ref(false));
                    break;
                case 4: // Binary
                    this.__values.set(key, ref(0));
                    break;
            }
        }
        return this;
    }
    static ref() {
        if (this.globalName != '') {
            if (!instancesFilters.has(this.globalName)) {
                instancesFilters.set(this.globalName, new this({
                    '__special': 1
                }));
            }
            return this.globalName;
        }
        throw 'static.globalName is not sets: Filter.ref(), ' + this.name;
    }
    static toolbox() {
        if (this.globalName == '') {
            throw 'static.globalName is not sets: toolbox(), ' + this.name + ', name: ' + this.globalName;
        }
        if (!instancesFilters.has(this.globalName)) {
            instancesFilters.set(this.globalName, new this({
                '__special': 1
            }));
        }
        const instance = instancesFilters.get(this.globalName);
        const toolbox = {};
        for (const [key, value] of instance.__types.entries()) {
            const valueRef = instance?.__values.get(key);
            if (value == 1) {
                const arrayToolbox = {
                    toggle(value, state = null) {
                        if (state == null) {
                            const index = valueRef.value.findIndex((subvalue) => subvalue == value);
                            if (index == -1) {
                                valueRef.value.push(value);
                            }
                            else if (index != -1) {
                                valueRef.value.splice(index, 1);
                            }
                        }
                        else {
                            const index = valueRef.value.findIndex((subvalue) => subvalue == value);
                            if (state && index == -1) {
                                valueRef.value.push(value);
                            }
                            else if (state == false && index != -1) {
                                valueRef.value.splice(index, 1);
                            }
                        }
                    },
                };
                Object.defineProperty(toolbox, key, {
                    get() {
                        return arrayToolbox;
                    }
                });
            }
            else {
                Object.defineProperty(toolbox, key, {
                    get() {
                        if (value == 4) {
                            return valueRef.value == 1;
                        }
                        return valueRef.value;
                    },
                    set(v) {
                        if (value == 4 && typeof v == 'boolean') {
                            valueRef.value = v ? 1 : 0;
                        }
                        valueRef.value = v;
                    },
                });
            }
        }
        return toolbox;
    }
    static filter(path) {
        const delimetr = path.split('.');
        if (instancesFilters.has(delimetr[0])) {
            const instance = instancesFilters.get(delimetr[0]);
            if (delimetr.length == 2) {
                return instance?.__values.get(delimetr[1]).value;
            }
            else {
                return instance?.query;
            }
        }
        else {
            throw `Filter ${delimetr[0]} not registered. Use '<FilterClass>.ref()' to register in function. ` + this.name;
        }
    }
    setPrefix(start, end) {
        this.__pStart = start;
        this.__pEnd = end;
        return this;
    }
    setDefault(_) {
        for (const [key, value] of Object.entries(_)) {
            this.__values.get(key).value = value;
        }
    }
    get query() {
        let _query = {};
        for (const [key, value] of this.__values.entries()) {
            const nameData = this.__pStart + key + this.__pEnd;
            const _type = this.__types.get(key);
            if (this.__fully.get(key) == true) {
                if (_type == 3 && value.value) {
                    _query[nameData] = value.value;
                }
                else if (_type == 0 && value.value != 0) {
                    _query[nameData] = value.value;
                }
                else if (_type == 1 && value.value.length > 0) {
                    _query[nameData] = value.value.join(',');
                }
                else if (_type == 2 && value.value.length > 0) {
                    _query[nameData] = value.value;
                }
                else if (_type == 4 && value.value != 0) {
                    _query[nameData] = value.value;
                }
            }
            else {
                if (_type != 1) {
                    _query[nameData] = value.value;
                }
                else if (_type == 1) {
                    _query[nameData] = value.value.join(',');
                }
            }
        }
        return _query;
    }
    get type() {
        const type = {
            _notEmpty: false,
            number() {
                return [0, this._notEmpty];
            },
            array() {
                return [1, this._notEmpty];
            },
            string() {
                return [2, this._notEmpty];
            },
            boolean() {
                return [3, this._notEmpty];
            },
            binary() {
                return [4, this._notEmpty];
            },
            notEmpty() {
                this._notEmpty = true;
                return this;
            }
        };
        return type;
    }
}
