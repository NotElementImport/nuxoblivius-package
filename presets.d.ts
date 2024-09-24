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