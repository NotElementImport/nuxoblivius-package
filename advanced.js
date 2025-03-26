import { ref } from "vue";
import { Record } from "./index.js";
import { SetDefaultHeader } from "./index.js";

export const useJWT = (config = {}) => {
    const { login: loginConfig, refresh: refreshConfig } = config;

    const recordLogin = Record.new(loginConfig.url, {})
        .header('Content-Type', 'application/json')
        .onFailure(() => undefined)
        .oneRequestAtTime();

    const recordRefresh = Record.new(refreshConfig.url, {})
        .onFailure(() => undefined)
        .oneRequestAtTime();

    const setter = config.setter ?? ((access, refresh) => {
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);
    });

    const getter = config.getter ?? (name => {
        return localStorage.getItem(name);
    });

    SetDefaultHeader('Authorization', () => Record.Bearer(getter('access')));

    const refreshRequestBody = refreshConfig.requestBody ?? 'string';
    const isAuthorized = ref(getter('access') ? true : false);

    let request = null;
    const doRefresh = async () => {
        if(request)
            return request;

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
                recordRefresh.header("Content-Type", "application/json");
                body = { [refreshRequestBody]: refreshToken };
            }
    
            await recordRefresh[refreshConfig.method ?? 'post'](body);
    
            if(recordRefresh.error)
                resolve(refreshFailed());

            const accessKey  = refreshConfig.response?.access  ?? 'access';
            const refreshKey = refreshConfig.response?.refresh ?? 'refresh';

            setter(
                recordRefresh.response[accessKey],
                recordRefresh.response[refreshKey]
            );

            setTimeout(() => resolve(), 2000);
        }).then(e => {
            request = null;
        })

        return request;
    };

    const onFailure = async (reason, retry) => {
        if(reason.code == 401) {
            await doRefresh();
            return retry();
        }
    };

    const login = async body => {
        await recordLogin[loginConfig.method ?? 'post'](body)

        if(recordLogin.error) {
            isAuthorized.value = false;
            return { ok: false, response: recordLogin.response };
        }

        const accessKey  = loginConfig.response?.access  ?? 'access'
        const refreshKey = loginConfig.response?.refresh ?? 'refresh'

        setter(
            recordLogin.response[accessKey],
            recordLogin.response[refreshKey]
        );

        isAuthorized.value = true;
        return { ok: true, response: recordLogin.response };
    };

    const logout = async () => {
        setter('access',  null);
        setter('refresh', null);
        isAuthorized.value = false;
    };

    return { 
        get authorized() { return isAuthorized.value },
        get loading() { return recordLogin.loading },
        login,
        logout,
        onFailure
    };
};