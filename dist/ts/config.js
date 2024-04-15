import { onConfigured } from "./index.js";
export const options = {
    http: async (url, options, isblob) => {
        const response = await fetch(url, options);
        if (isblob)
            return response.blob();
        return response.json();
    },
    cookie: { get: (name) => '', set: (name, value) => null },
    router: {},
    isServer: false,
    apiRoot: ''
};
export const settings = {
    httpClient(client) {
        options.http = client;
        return this;
    },
    cookieWorker(logic) {
        options.cookie = logic;
        return this;
    },
    router(logic) {
        options.router = logic;
        return this;
    },
    isServer(value = false) {
        options.isServer = value;
        return this;
    },
    apiRoot(root) {
        options.apiRoot = root;
        return this;
    },
    feedbackCallbacks() {
        onConfigured();
    }
};
