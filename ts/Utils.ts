import { Ref, isRef as isVueRef, isReactive } from "vue"

export function toRefRaw(object: Ref<any>) {
    const raw = object.value ?? undefined;
    if(typeof raw === 'undefined')
        throw new Error('raw is empty');
    const proto = Object.getPrototypeOf(raw);
    proto.raw = () => object;
    return raw;
}

export async function resolveOrLater(data: Promise<any>|any, callback: Function) {
    if(data instanceof Promise)
        return data.then((value) => {
            callback(value)
        })

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

    if(typeof value == 'object' && (isRef(value) || isVueRef(value) || value?.__v_isRef)) {
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

    for(const [name] of Object.entries(unpacked)) {
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

const test = (data: Record)

Record<>

export function urlPathParams(url: string, params: Record<string, any>) {
    Object.entries(params)
        .map(([param, value ]) => {
            value = value ?? ''
            url.replaceAll(
                `{${param}}`, 
                typeof value !== "number"
                    ? (value ? value : "")
                    : value
            )
        })

    return url
}

export function queryToUrl(query: Record<string, any>) {
    let flatObject = {} as Record<string, any>;
    const flat = (objectToFlat: object, prefix: string = '', suffix: string = ''): object => 
        Object.entries(objectToFlat)
            .map(([ name, value ]) =>
                typeof value == 'object'
                    ? flat(value, `${prefix+name+suffix}[`, ']')
                    :  flatObject[`${prefix}${name}${suffix}`] = refOrVar(value)
            )
    flat(query)
    if(Object.keys(flatObject).length == 0)
        return ``
    return `?${(new URLSearchParams(flatObject)).toString()}`
}

export function appendMerge(...objects: object[]) {
    const result = {}

    const recursive = (value: object, to: object) => {
        for (const [nameRec, valueRec] of Object.entries(value)) {
            if(valueRec == null) continue
            if(typeof valueRec == 'object' && !isRef(value) && !isVueRef(value) && !isReactive(value)) {
                if(!(nameRec in to))
                    (to as any)[nameRec] = {}
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