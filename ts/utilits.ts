import { config } from "./config.js"
import { PatternsApi } from "./interfaces.js"

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

export const buildUrl =  (path: string, query: any, pagiantion: any, template: PatternsApi) => {
    let fullURL = path
    if(query == null) {
        query = {}
    }
    if(pagiantion.size > 0) {
        if(template == 'yii2-data-provider') {
            query['number'] = pagiantion.offset + 1
            query['page[number]'] = pagiantion.offset + 1
            query['page[size]'] = pagiantion.size
        }
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

export const queryToApi = async (url: string, params: RequestInit, template: PatternsApi, composition: any): Promise<any> => {
    let raw = await config.request(url, params) as any

    let dry = JSON.parse(raw) as {[name: string]: any}

    if(template == 'yii2-data-provider') {
        if('meta' in dry) {
            composition.api.pagination.maxOffset = dry['meta']['page-count']
        }
        else {
            composition.api.pagination.maxOffset = 1
        }

        if('data' in dry) {
            if(Array.isArray(dry.data)) {
                return dry.data.map((value) => value.attributes)
            }
            return dry.data.attributes
        }
    }
    return dry
}

export const addToPath = (url: string, data: string) => {
    if(url[url.length - 1] == '/') {
        return url + data
    }
    return url + '/' + data
}
