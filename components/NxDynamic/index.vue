<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { __me } from '../../dynamic/index'

const props = defineProps<{
    tag?: string
    ssr?: boolean
    morph?: boolean 
}>()
const orig = ref()
const morp = ref()
const getSsr = () => {
    if(props.ssr) {
        return props.ssr
    }
    return false
}
const getMorph = () => {
    if(props.morph) {
        return props.morph
    }
    return false
}
onMounted(() => {
    if(props.tag) {
        __me[props.tag] = orig.value
        setTimeout(() => {
            if(typeof morp.value != 'undefined') {
                __me[props.tag+"_morph"] = morp.value
            }
        }, 50)
    }
})
</script>
<template>
    <div v-if="getSsr()" ref="orig">
        <slot />
        <div ref="morp" class="morph" v-if="getMorph()">
            <slot />
        </div>
    </div>
    <div ref="orig" v-else>
        <client-only >
            <slot />
            <div ref="morp" class="morph" v-if="getMorph()">
                <slot />
            </div>
        </client-only>
    </div>
</template>
<style scoped>
.morph {
    display: none !important;
}
</style>