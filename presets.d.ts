import type { SetupObject } from "./index";

type TagDifinition<T extends PropertyKey> = `query:${T}` | `path:${T}`

/**
 * `🔧 Caching`\
 * `⚡ SPA`
 * 
 * Caching current tags and reuse `Response` if it needed
 * 
 * @param tags Example: `['path:test', 'query:lang']`
 */
export declare function useCached(tags?: TagDifinition[], config?: { strict?: boolean, breakRule?: (q: { path: Record<string, any>, query: Record<string, any> }) => boolean | void }): SetupObject

interface IArrayRemesh {
    withTags?: string[];
    withPage?: { tag: PropertyKey | 'auto', value?: number };
}

export declare function useArrayRemesh<T extends PropertyKey>(sizeTag: `query:${T}` | `path:${T}`, config?: IArrayRemesh): SetupObject
