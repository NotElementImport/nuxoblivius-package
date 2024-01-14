export function instruction(_of, defaultInstuction) {
    const agent = new Proxy({ of: _of, _inst: [] }, {
        get(target, p, receiver) {
            if (p == '_inst' || p == 'of') {
                return target[p];
            }
            else {
                return function (...kwargs) {
                    target._inst.push([p, kwargs]);
                    return agent;
                };
            }
        },
        set(target, p, newValue, receiver) {
            return true;
        },
    });
    if (defaultInstuction) {
        return agent.start(...defaultInstuction);
    }
    else {
        return agent;
    }
}
export function karg_exist(kargs, index) {
    return typeof kargs[index] !== 'undefined' && kargs[index] !== null;
}
export function urlParamDecode(url) {
    if (typeof url == 'object') {
        return [url.path, url.query];
    }
    return [url, {}];
}
