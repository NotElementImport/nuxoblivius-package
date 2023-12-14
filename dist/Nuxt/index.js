import { useCookie, useLazyFetch, useRouter } from 'nuxt/app';
import { config } from '../ts/config.js';
import { ref } from 'vue';
export default (nuxtApp) => {
    config.get = (object_) => object_.value;
    config.set = (object_, value) => {
        object_.value = value;
    };
    config.saveCookie = (name, value, expr) => {
        let data = useCookie(name, {
            maxAge: expr
        });
        data.value = value;
    };
    config.getCookie = (name) => {
        return useCookie(name).value;
    };
    config.init = (value) => ref(value);
    config.request = async (link, param) => {
        if (process.server) {
            const fetchData = await useLazyFetch(link, { credentials: 'include', responseType: 'text', cache: 'no-cache', server: true, ...param });
            return fetchData.data.value;
        }
        else {
            const fetchData = await fetch(link, param);
            return await fetchData.text();
        }
    };
    config.router = () => useRouter();
    nuxtApp.hook("app:beforeMount", () => {
        // for(const classes of __globas()) {
        // const instance = new (classes as any).constructor()
        // }
    });
};
