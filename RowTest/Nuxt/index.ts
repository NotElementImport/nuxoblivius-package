import { useCookie, useLazyFetch, useRouter } from 'nuxt/app'
import { config, __globas } from '../index.js'
import { ref } from 'vue'

export default (nuxtApp: any) => {
    config.get = (object_:any) => object_.value
    config.set = (object_:any, value: any) => { 
        object_.value = value 
    }

    config.saveCookie = (name: string, value: any, expr: number) => {
        let data = useCookie(name, {
            maxAge: expr
        })
        data.value = value
    }
    config.getCookie = (name: string) => {
        return useCookie(name).value
    }

    config.init = (value: any) => ref(value)

    config.request = async (link:any, param: any) => { 
        if(process.server) {
            const fetchData = await useLazyFetch(link, { credentials: 'include', responseType:'text', cache: 'no-cache', server: true, ...param})
            return fetchData.data.value
        }
        else {
            const fetchData = await fetch(link, param)
            return await fetchData.text()
        }
    }

    config.router = () => useRouter()

    nuxtApp.hook("app:beforeMount", () => {
        for(const classes of __globas()) {
            const instance = new (classes as any).constructor()
        }
    })
}