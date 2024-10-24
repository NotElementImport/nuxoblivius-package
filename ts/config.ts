import type { ObliviusRecordOptions, TemplateHandle } from "../types.js"

export const libTemplate: globalThis.Record<string, TemplateHandle<any>> = {}

export let useFetch = async (url: string, options: ObliviusRecordOptions) => {
    const response = await fetch(url, options)

    const process = {
        'json': async () => {
            const text = await response.text()
            if(text[0] != '{' && text[0] != '[' && text[0] == '"' && text != 'false' && text != 'true' && text != 'null')
                return text
            return JSON.parse(text)
        },
        'text': () => response.text(),
        'blob': response.blob,
        'arrayBuffer': response.arrayBuffer
    }

    return {
        hasError: !response.ok,
        statusCode: response.status,
        statusText: response.statusText,
        response: await process[options.type ?? 'json'](),
        headers: Object.fromEntries(response.headers.entries()),
    }
}