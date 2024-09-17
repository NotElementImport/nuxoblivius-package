import { Ref } from "vue"

export function toRefRaw(object: Ref<any>) {
    const raw = object.value ?? undefined;
    if(typeof raw === 'undefined')
        throw new Error('raw is empty');
    const proto = Object.getPrototypeOf(raw);
    proto.raw = () => object;
    return raw;
}

export async function resolveOrLater(data: Promise<any>|any, callback: Function) {
    if(data instanceof Promise) {
        data.then((value) => {
            callback(value)
        })

        return
    }

    callback(data)
}

export function refOrVar(value: any) {
    if(!value) return value

    if(typeof value == 'function') {
        value = value()
    }

    if(value == null) {
        return null
    }

    if(typeof value == 'object' && '_module_' in value) {
        return value.value
    }
    else if(typeof value == 'object' && (isRef(value) || value?.__v_isRef)) {
        return value.value
    }

    return value
}

export function isRef(value: any) {
    return typeof value == 'object' && '_module_' in value
}

export function storeToQuery(object: any) {
    const unpacked = object.value

    if(typeof unpacked != "object") {
        return {}
    }

    const result: {[key: string]: any} = {}

    for(const [name, value] of Object.entries(unpacked)) {
        if(name.length == 0) continue;

        if(name[0] != '_') {
            const value = unpacked[name]
            result[name] = value
        }
    }

    for(const [name, _] of Object.entries(Object.getOwnPropertyDescriptors(unpacked))) {
        if(name.length == 0) continue;

        if(name[0] != '_') {
            const value = unpacked[name]

            if(typeof value != "undefined" && typeof value != "object" && typeof value != "function") {
                if(value != null) {
                    result[name] = value
                }
            }
        }
    }
    
    return result
}

export function urlPathParams(url: string, params: Record<string, any>) {
    for (const [name, value] of Object.entries(params)) {
        const unpacked = refOrVar(value)

        if(typeof unpacked == 'undefined' || (typeof unpacked == 'object' && unpacked == null)) {
            url = url.replaceAll(`{${name}}`, "")
        }
        else {
            url = url.replaceAll(`{${name}}`, unpacked)
        }
    }
    return url
}

export function queryToUrl(query: Record<string, any>) {
    let _result = ''
    
    if(Object.keys(query).length > 0) {
        const nameTact = (name: string, add: string) => {
            if(name.length > 0) {
                return `${name}[${add}]`
            }
            return add
        }

        const result: Record<string, any> = {}

        const recursiveRead = (layer:Record<string, any>, layerName: string) => {
            for (const [name, value] of Object.entries(layer)) {
                const nameOfCurrentLayer = nameTact(layerName, name)
                const unpacked = refOrVar(value) ?? ''

                if(typeof unpacked == 'object') {
                    result[nameOfCurrentLayer] = recursiveRead(unpacked, nameOfCurrentLayer)
                }
                else {
                    if(typeof unpacked != 'number' && !unpacked)
                        continue

                    result[nameOfCurrentLayer] = unpacked
                }
            }
        }

        recursiveRead(query, '')

        _result = '?' + Object.entries(result).map((value) => `${value[0]}=${value[1]}`).join('&')
    }
    return _result
}

export function appendMerge(...objects: object[]) {
    const result = {}

    const recursive = (value: object, to: object) => {
        for (const [nameRec, valueRec] of Object.entries(value)) {
            if(valueRec == null) continue
            if(typeof valueRec == 'object' && !('_module_' in valueRec)) {
                if(!(nameRec in to)) {
                    (to as any)[nameRec] = {}
                }
                recursive((to as any)[nameRec], valueRec)
            }
            else {
                (to as any)[nameRec] = valueRec
            }
        }
    } 

    for (const local of objects) {
        recursive(local, result)
    }

    return result
}