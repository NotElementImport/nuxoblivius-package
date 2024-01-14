export function instruction(_of: number, defaultInstuction?: any[]) {
    const agent = new Proxy({of: _of, _inst: [] as any[]}, {
        get(target, p, receiver) {
            if(p == '_inst' || p == 'of') {
                return target[p]
            }
            else { return function (...kwargs: any[]) {
                target._inst.push([p, kwargs])
                return agent
        }}},
        set(target, p, newValue, receiver) {
            return true
        },})
    if(defaultInstuction) {
        return (agent as any).start(...defaultInstuction)
    }
    else {
        return agent as any
    }
}

export function karg_exist(kargs: any[], index: number) {
    return typeof kargs[index] !== 'undefined' && kargs[index] !== null
}

export function urlParamDecode(url: any) {
    if(typeof url == 'object') {
        return [url.path, url.query]
    }
    return [url, {}]
}

export const validateObject = (data: any): boolean => {
    if(typeof data == 'boolean') return true
    if(Array.isArray(data) && data.length > 0) {
        return true
    }
    else if(typeof data == 'object') {
        if('__wrt' in data) {
            return validateObject(data.__ref.get())
        }
        else {
            if(Object.keys(data).length > 0) return true
        }
    }
    else if(typeof data == 'string') {
        if(data.trim().length > 0) return true
    }
    else if(typeof data == 'undefined') {
        return false
    }
    else if(typeof data == 'number') {
        return !Number.isNaN(data)
    }

    return false
}

export const buildUrl =  (path: string, query: any, pagiantion: any) => {
    let fullURL = path
    if(query == null) {
        query = {}
    }
    if(pagiantion.size > 0) {
        // if(template == 'yii2-data-provider') {
        //     query['number'] = pagiantion.offset + 1
        //     query['page[number]'] = pagiantion.offset + 1
        //     query['page[size]'] = pagiantion.size
        // }
    }

    fullURL += '?'
    const compileName = (names: string[]) => {
        let result = ''
        let index = 0
        for(const value of names) {
            if(index == 0) {
                result = value
                index += 1
            } else {
                result += `[${value}]`
            }
        }
        return result
    }
    const proval = (inner: any, names: string[]): any => {
        let mapOfQueryInne = []
        for(const [key, value] of Object.entries(inner)) {
            names.push(key)
            if(validateObject(value) == false) continue;
            if(typeof value == 'object') {
                if('__wrt' in (value as any)) {
                    mapOfQueryInne.push(`${compileName(names)}=${(value as any).__ref.get()}`)
                }
                else {
                    mapOfQueryInne.push(proval(value, names))
                }
            }
            else {
                mapOfQueryInne.push(`${compileName(names)}=${value}`)
            }
        }
        return mapOfQueryInne.join('&')
    }
    const mapOfQuery = []
    for(const [key, value] of Object.entries(query)) {
        if(validateObject(value) == false) continue;
        if(typeof value == 'object') {
            if('__wrt' in (value as any)) {
                mapOfQuery.push(`${key}=${(value as any).__ref.get()}`)
            }
            else {
                mapOfQuery.push(proval(value, [key]))
            }
        }
        else {
            mapOfQuery.push(`${key}=${value}`)
        }
    }
    fullURL += mapOfQuery.join('&')
    return fullURL
}