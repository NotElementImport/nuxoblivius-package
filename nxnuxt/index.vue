<script setup lang="ts">
import { onMounted } from 'vue';
import { settings } from '../dist/ts/Config.js'
import { onMountedApp } from '../dist/ts/index.js'

const props = defineProps<{
    apiRoot: string
}>()

settings.apiRoot(props.apiRoot)
settings.httpClient(async (url: string, options: any) => { 
    const result = await useLazyFetch(url, options)

    return result.data
})
settings.cookieWorker({
    get(name: string) {
        console.log(useCookie(name).value);
        return useCookie(name).value
    }, 
    set(name: string, value: any) {
        useCookie(name).value = value
    }
})
settings.isServer(true)
settings.feedbackCallbacks()

console.log('started')

onMounted(() => {
    onMountedApp()
    settings.isServer(false)
})
</script>
<template><slot /></template>