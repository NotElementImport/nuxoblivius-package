interface IJWTConfig<T extends PropertyKey = PropertyKey> {
    login: {
        url: string
        /** @default method: 'post' */
        method?: 'put'|'post'
        /** @default response: { access: 'access', refresh: 'refresh' } */
        response?: { access: string, refresh: string }
        
    }
    refresh: {
        url: string
        /** @default method: 'post' */
        method?: 'put'|'post'
        /** @default requestBody: 'string' */
        requestBody: T&'string'
        /** @default response: { access: 'access', refresh: 'refresh' } */
        response?: { access: string, refresh: string }
    }
    /** @default getter: (name) => localStorage.getItem(name) */
    getter?: (name: 'access'|'refresh') => string
    /** @default getter: (access, refresh) => { localStorage.setItem('access', access); localStorage.setItem('refresh', refresh); } */
    setter?: (access: string, refresh: string) => void
    /** @default refreshFailed: null */
    refreshFailed?: () => void
}

export declare function useJWT<Body extends object>(config?: IJWTConfig): { 
    login: (body: Body) => Promise<boolean>
    logout: () => void
    onFailure: (reason: object, retry: Function) => any
};

const { login, logout } = useJWT({
    login: { url: '/api/test', response: { access: 'accessToken', refresh: 'refreshToken' } },
    refresh: { url: '/api/test/refresh', requestBody: 'string' },
    setter(access, refresh) {
        useCookie('access').value = access
        useCookie('refresh').value = access
    },
    getter(name) {
        return useCookie(name).value
    },
});