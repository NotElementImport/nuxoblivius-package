export const config = {
    get: (object_) => object_,
    set: (object_, value) => object_ = value,
    init: (value) => value,
    request: async (url, params) => (await fetch(url, params)).text(),
    saveCookie: (name, value, expr) => { },
    getCookie: (name) => { },
    router: () => null
};
