import { Ref, ref } from 'vue'
import { instruction, karg_exist, urlParamDecode } from './utillits.js'

interface IFetchLogic {
    url: {
        path: string
        startQuery: {[name: string]: any}
        query: {[name: string]: any}
    }
    startOptions: RequestInit
    pagination: {
        size: number,
        offset: number
    }
}

export const preProcces = <T>(url: any, options: any): any  => {
    return instruction(1, [url, options])
}

export const renderProcces = (object: any, name: string, logic: any) => {
    const instructions = logic._inst
    const _root: IFetchLogic = {
        url: {
            path: '',
            startQuery: {},
            query: {}
        },
        pagination: {
            size: 0,
            offset: 1
        },
        startOptions: {}
    }

    let final = null as any

    const builder = {
        start(...args: any[]) {
            // Step 1
            const [url, query] = urlParamDecode(args[0])
            _root.url.path = url
            _root.url.startQuery = query
            
            // Step 2 if set
            if(karg_exist(args, 1)) {
                _root.startOptions = args[1]
            }
        },
        pagination(...args: any[]) {
            _root.pagination.size = args[0]
        },
        one() {
            final = new Network(_root, {});
        },
        many() {
            final = new Network(_root, []);
        }
    }

    for (const model of instructions) {
        const name = model[0]
        const kargs = model[1] as any[]

        if(name in builder) {
            (builder as any)[name](...kargs)
        }
        else {
            console.warn(`In builder not exist command "${name}"`)
        }
    }

    Object.defineProperty(object, name, {
        get() {
            return final
        }
    })
}

class Network {
    private _info: IFetchLogic
    private _value: Ref<any>
    private _isFetching: Ref<boolean> = ref(false)
    private _isAbort: Ref<boolean> = ref(false)
    private _isFinished: Ref<boolean> = ref(false)

    constructor(info: IFetchLogic, value: any) {
        this._info = info
        this._value = ref(value)
    }

    public get value() {
        return this._value.value
    }
    
    public set value(v) {
        this._value.value = v
    }
}