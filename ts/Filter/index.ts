import { ref, watch } from "vue"

const instancesFilters: Map<string, Filter> = new Map()

// export const registerFilter = (name: string, filter: typeof Filter) => {
//     instancesFilters.set(
//         name, new filter({
//             'name': name,
//             '__special': 1
//         })
//     )
// }

export default class Filter {
    protected static globalName: string = ''

    private __values: Map<string, any> = new Map()
    private __types: Map<string, any> = new Map()
    private __fully: Map<string, any> = new Map()
    private __pStart = ''
    private __pEnd = ''
    private __subs: Function[] = []

    protected setup() {}

    constructor(config:{[name: string]: any} = {}) {
        if(!('__special' in config)) {
            throw "Filters cannot be created outside"
        }
        this.setup()
    }

    private callSubs() {
        this.__subs.forEach((value) => {
            value()
        })
    }

    public on(func: Function) {
        if(this.__subs.some((value) => value == func) == false) {
            console.log('test')
            this.__subs.push(func)
        }
    }

    protected createFilter(items: {[name: string]: any[]}) {
        for (const [key, value] of Object.entries(items)) {
            this.__types.set(key, value[0])
            this.__fully.set(key, !value[1])
            switch(value[0]) {
                case 0: {// Number
                    const valueRef = ref(null)
                    // watch(valueRef, (nw,ov) => {
                    //     if(nw != ov) this.callSubs()
                    // })
                    this.__values.set(key, valueRef)
                }break
                case 1:{ // Array
                    const valueRef = ref([])
                    // watch(valueRef, (nw,ov) => {
                    //     if(nw != ov) this.callSubs()
                    // })
                    this.__values.set(key, valueRef)
                }break
                case 2:{ // String
                    const valueRef = ref('')
                    // watch(valueRef, (nw,ov) => {
                    //     if(nw != ov) this.callSubs()
                    // })
                    this.__values.set(key, valueRef)
                }break
                case 3:{ // Boolean
                    const valueRef = ref(false)
                    // watch(valueRef, (nw,ov) => {
                    //     if(nw != ov) this.callSubs()
                    // })
                    this.__values.set(key, valueRef)
                }break
                case 4:{ // Binary
                    const valueRef = ref(0)
                    // watch(valueRef, (nw,ov) => {
                    //     if(nw != ov) this.callSubs()
                    // })
                    this.__values.set(key, valueRef)
                }break
            }
        }
        return this
    }

    public static ref() {
        if(this.globalName != '') {
            if(!instancesFilters.has(this.globalName)) {
                instancesFilters.set(
                    this.globalName,
                    new this({
                        '__special': 1
                    })
                )
            }
            return this.globalName
        }
        throw 'static.globalName is not sets: Filter.ref(), ' + this.name
    }

    public static toolbox() {
        if(this.globalName == '') {
            throw 'static.globalName is not sets: toolbox(), ' + this.name + ', name: ' + this.globalName
        }

        if(!instancesFilters.has(this.globalName)) {
            instancesFilters.set(this.globalName, new this({
                    '__special': 1
                })
            )
        }

        const instance = instancesFilters.get(this.globalName)
            const toolbox:{[name: string]: any} = {}
            for (const [key, value] of (instance as any).__types.entries()) {
                const valueRef = instance?.__values.get(key)

                if(value == 1) {
                    const arrayToolbox = {
                        toggle(value: any, state: boolean|null = null) {
                            if(state == null) {
                                const index = valueRef.value.findIndex((subvalue: any) => subvalue == value)
                                if(index == -1) { valueRef.value.push(value) }
                                else if(index != -1) { valueRef.value.splice(index, 1) }
                            }
                            else {
                                const index = valueRef.value.findIndex((subvalue: any) => subvalue == value)
                                if(state && index == -1) { valueRef.value.push(value) }
                                else if(state == false && index != -1) { valueRef.value.splice(index, 1) }
                            }
                        },
                    }
                    Object.defineProperty(toolbox, key, {
                        get() {
                            return arrayToolbox
                        }
                    })
                }
                else {
                    let lockForAwake = false
                    Object.defineProperty(toolbox, key, {
                        get() {
                            if(value == 4) {
                                return valueRef.value == 1
                            }
                            return valueRef.value
                        },
                        set(v) {
                            if(value == 4 && typeof v == 'boolean') {
                                valueRef.value = v ? 1 : 0
                            }
                            valueRef.value = v
                            instance?.callSubs()
                        },
                    })
                }
            }

            return toolbox
    }

    public resolve(value: any): boolean { return true }

    protected get getValues() {
        let result:{[name: string]: any} = {}
        for (const [key, value] of this.__values.entries()) {
            result[key] = value.value
        }
        return result
    }

    public static filter(path: string) {
        const delimetr = path.split('.')
        if(instancesFilters.has(delimetr[0])) {
            const instance = instancesFilters.get(delimetr[0])
            if(delimetr.length == 2) {
                return instance?.__values.get(delimetr[1]).value
            }
            else {
                return instance?.query
            }
        }
        else {
            throw `Filter ${delimetr[0]} not registered. Use '<FilterClass>.ref()' to register in function. ` + this.name
        }
    }

    public static instance(name: string): Filter {
        return instancesFilters.get(name) as Filter
    }

    protected setPrefix(start: string, end: string) {
        this.__pStart = start
        this.__pEnd = end
        return this
    }

    protected setDefault(_: {[name: string]: any}) {
        for (const [key, value] of Object.entries(_)) {
            this.__values.get(key).value = value
        }
    }

    public get query() {
        let _query: any = {}
        for (const [key, value] of this.__values.entries()) {
            const nameData = this.__pStart + key + this.__pEnd
            const _type = this.__types.get(key)
            if(this.__fully.get(key) == true) {
                if(_type == 3 && value.value) {
                    _query[nameData] = value.value
                }
                else if(_type == 0 && value.value != 0) {
                    _query[nameData] = value.value
                }
                else if(_type == 1 && value.value.length > 0) {
                    _query[nameData] = value.value.join(',')
                }
                else if(_type == 2 && value.value.length > 0) {
                    _query[nameData] = value.value
                }
                else if(_type == 4 && value.value != 0) {
                    _query[nameData] = value.value
                }
            }
            else {
                if(_type != 1) {
                    _query[nameData] = value.value
                }
                else if(_type == 1) {
                    _query[nameData] = value.value.join(',')
                }
            }
        }
        return _query
    }

    protected get type() {
        const type = {
            _notEmpty: false,
            number() {
                return [0, this._notEmpty]
            },
            array() {
                return [1, this._notEmpty]
            },
            string() {
                return [2, this._notEmpty]
            },
            boolean() {
                return [3, this._notEmpty]
            },
            binary() {
                return [4, this._notEmpty]
            },
            notEmpty() {
                this._notEmpty = true
                return this
            }
        }
        return type
    }
}