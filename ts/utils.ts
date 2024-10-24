import { isRef } from "vue";
import { TemplateHandle, TemplateInit, TemplateResponse } from "../types.js";
import { libTemplate } from "./config.js";

export const useTemplate = <T extends object|any[]>(template: TemplateInit<T>, raw: T): TemplateResponse<T> => {
    if(typeof template == 'function')
        return template(raw) ?? { response: raw } as TemplateResponse<T>
    else if(typeof template == 'string' && template in libTemplate)
        return libTemplate[template](raw) as TemplateResponse<T> ?? { response: raw } as TemplateResponse<T>

    throw `Use Template: Template in libary not found: "${template}"`
}

export const defineTemplate = <T extends object|any[]>(name: string, handle: TemplateHandle<T>, config: { extends?: string } = {}): void => {
    if(config.extends) {
        const fromExtends = config.extends
        if(!libTemplate[fromExtends])
            throw `Extends Template: Template in libary not found: "${fromExtends}"`
    
        const unpack = libTemplate[fromExtends]
    
        return (libTemplate[name] = (raw: T) => {
            const response = unpack(raw)
            if(!response)
                return
    
            const mainResponse = handle(response.response)
            if(!mainResponse)
                return response
    
            return {
                ...response,
                ...mainResponse,
                response: mainResponse.response
            }
        }, void 0)
    }

    libTemplate[name] = handle

    return void 0
}

const charTable = 'qwertyuiopasdfghjklzxcvbnm1234567890@$&'

export const hash = () => {
    let res = ''
    for(let i = 0; i < 10; i++)
        res += charTable.charAt(
            Math.round(Math.random() * (charTable.length - 1))
        );
    return res
}

export const isPrimitive = (item: any) => {
    if(typeof item == 'function') return false
    return (typeof item != 'object') ||
        (typeof item == 'object' && (Object.getPrototypeOf(item).__proto__ == null || Array.isArray(item)))
}

export const toRaw = (item: unknown, $default?: any) => {
    if(typeof item == 'function')
        item = item() ?? $default

    if(isRef(item))
        return item.value

    return item
}

export const objectMergeRecursive = (...args: any) => {
    const result = {}

    const recursive = (a: object, b: Record<string, any>) => {
        Object.entries(a).forEach(([key, value]) => {
            if(typeof value == 'object' && value != null && !isRef(value)) {
                if(!(key in b))
                    b[key] = {}
                return recursive(value, b[key])
            }
            b[key] = value
        })
    }

    for (const item of args) {
        recursive(item, result)
    }

    return result
}