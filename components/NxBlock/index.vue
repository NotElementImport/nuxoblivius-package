<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
const props = defineProps<{
    observe?: {
        onScreen?: boolean
        grow?: boolean
    }
}>()
const origin = ref(null as any as HTMLElement)
const emit = defineEmits<{
    grow: []
    reach: []
    lostView: []
    lose: []
    focus: []
    up: []
    down: []
}>()
function loseEvent(event: FocusEvent) {
    if (!(event.currentTarget as any).contains(event.relatedTarget)) {
        emit('lose')
    }
}
function focusEvent(event: FocusEvent) {
    if ((event.currentTarget as any).contains(event.relatedTarget)) {
        emit('focus')
    }
}
onMounted(() => {
    if(props.observe && props.observe.grow) {
        let mutation = new MutationObserver(() => {
            emit('grow')
        })

        mutation.observe(origin.value, {
            childList: true,
            subtree: true
        })
    }
    if(props.observe && props.observe.onScreen) {
        let old = false
        const update = () => {
            let rect = origin.value.getBoundingClientRect();
            let viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
            let currentState = !(rect.bottom < 0 || rect.top - viewHeight >= 0);

            if(currentState != old) {
                if(currentState)
                    emit('reach')
                else
                    emit('lose')
            }
            
            old = currentState
            requestAnimationFrame(update)
        }
        update()
    }
    emit('up')
})
onUnmounted(() => {
    emit('down')
})
</script>
<template>
    <div ref="origin" tabindex="0" @focus="focusEvent" @blur="loseEvent">
        <slot />
    </div>
</template>