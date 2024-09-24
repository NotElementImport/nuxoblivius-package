interface IJWTConfig<T extends PropertyKey = PropertyKey> {
    login: {
        url: string
        /** @default method: 'post' */
        method?: 'put'|'post'
        /** @default response: { access: 'access', refresh: 'refresh' } */
        response?: { access: string, refresh: string }
        
    }
    refresh: {
        /** Refresh URL @example '/api/auth/login' */
        url: string
        /** Method request @default method: 'post' */
        method?: 'put'|'post'
        /** 
         * How send Refresh Token
         * Get name of param in JSON. Or write `string` send token without JSON  
         * @default requestBody: 'string'
         * */
        requestBody: 'string'
        requestBody: T
        /** Which parameters are responsible for access/refresh. @default response: { access: 'access', refresh: 'refresh' } */
        response?: { access: string, refresh: string }
    }
    /** @default getter: (name) => localStorage.getItem(name) */
    getter?: (name: 'access'|'refresh') => string
    /** @default getter: (access, refresh) => { localStorage.setItem('access', access); localStorage.setItem('refresh', refresh); } */
    setter?: (access: string, refresh: string) => void
    /** @default refreshFailed: null */
    refreshFailed?: () => void
}

interface IJWT<Body extends object> {
    /**
     * `⚡ Reactive`\
     * `🔧 Property`
     * 
     * Is authorized
     */
    readonly authorized: boolean
    /**
     * `⚡ Reactive`\
     * `🔧 Property`
     * 
     * On request login
     */
    readonly loading: boolean
    /**
     * `🛡️ Auth Method`
     * 
     * Login, and save access/regresh token
     */
    login(body: Body): Promise<{ ok: boolean, response: any }>
    /**
     * `🛡️ Auth Method`
     * 
     * Logout
     */
    logout(): Promise<void>
    /**
     * `⚡ Callable Event`
     * 
     * Calling on failure when Request if failed by auth issue
     * 
     * Example:
     * ```ts
     * const jwt = useJWT({})
     * 
     * Record.new('/test/')
     *   .onFailure(jwt.onFailure)
     * 
     * // Or
     * 
     * SetRequestFailure(jwt.onFailure)
     * ```
     */
    onFailure(reason: object, retry: Function): any
}

export declare function useJWT<Body extends object>(config?: IJWTConfig): IJWT<Body>;