import { Record } from ".";
// import { DefaultFetchFailure } from ".";

export const useJWT = (config = {}) => {
    const { login: loginConfig, refresh: refreshConfig } = config;

    const recordLogin = Record.new(loginConfig.url, {})
        .header('Content-Type', 'application/json')
        .onFailure(() => undefined)
        .oneRequestAtTime();

    const recordRefresh = Record.new(refreshConfig.url, {})
        .onFailure(() => undefined)
        .oneRequestAtTime();

    const refreshRequestBody = refreshConfig.requestBody ?? 'string'
    let request = null;
    const doRefresh = async () => {
        if(request)
            return request

        request = new Promise(async resolve => {
            let body = '';
            const refreshFailed = (config.refreshFailed ?? (() => null));
            const refreshToken = getter('refresh');
    
            if(!refreshToken)
                resolve(refreshFailed())
    
            if(refreshRequestBody == 'string') {
                body = refreshToken;
            }
            else {
                body = { [refreshRequestBody]: refreshToken };
            }
    
            await recordRefresh[refreshConfig.method ?? 'post'](body);
    
            if(recordRefresh.error)
                resolve(refreshFailed())



        }).then(e => {
            request = null
        })

        return request
    };

    const setter = config.setter ?? ((access, refresh) => {
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);
    });

    const getter = config.getter ?? (name => {
        return localStorage.getItem(name);
    });

    const onFailure = async (reason, retry) => {
        if(reason.code == 401) {
            await doRefresh();
            return retry();
        }
    };

    const login = async body => {
        await recordLogin[loginConfig.method ?? 'post'](body)

        if(recordLogin.error) {
            return { ok: false, response: recordLogin.response };
        }

        return { ok: true, response: recordLogin.response };
    };

    const logout = async () => {
        setter('access',  null);
        setter('refresh', null);
    };

    return { 
        get loading() { return recordLogin.loading },
        get authorized() { return true },
        login,
        logout,
        onFailure
    };
};