import type { SetupObject } from "./index";

type TagDifinition<T extends PropertyKey> = `query:${T}`|`path:${T}`

/**
 * `🔧 Caching`\
 * `⚡ SPA`
 * 
 * Caching current tags and reuse `Response` if it needed
 * 
 * @param tags Example: `['path:test', 'query:lang']`
 */
export declare function useCached(tags?: TagDifinition[]): SetupObject

interface IArrayRemesh {
    cache: { [name: string]: any }
    cacheTag?: boolean
    cacheAccess?: 'simple'|'full'
    condition?: { [name: string]: any }
    pageCheck?: boolean
    page?: any
    exclude?: { [name: string]: any }
    exclude?: { [name: string]: any }
}

export declare function useArrayRemesh<T extends PropertyKey>(sizeTag: `query:${T}`|`path:${T}`, config?: IArrayRemesh): SetupObject