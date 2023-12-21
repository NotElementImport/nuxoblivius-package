<script setup lang="ts">
    import { onMounted, ref, watch } from 'vue';
    import type { Ref } from 'vue';
    const props = defineProps<{
        hold?: boolean
        done?: boolean
    }>()
    const emity = defineEmits<{
        (name: 'reach'): void
    }>()
    let holdOn = false
    let done = false
    let taskExecute = false 

    if(props.hold) {
        holdOn = props.hold
        watch(props, (newValue, oldValue) => {
            if(newValue.hold == false) {
                if(taskExecute == true) {
                    if(newValue.done == false) {
                        emity('reach')
                    }
                    taskExecute = false
                }
            }
            done = newValue.done;
            holdOn = newValue.hold;
        })
    }

    const observeObject = ref() as Ref<HTMLElement>
    
    onMounted(() => {
        const detect = () => {
            if(done == false) {
                if(holdOn) {
                    taskExecute = true
                }
                else {
                    emity('reach')
                }
            }
        }
        let observer = new IntersectionObserver(detect, {
            rootMargin: "0px",
            threshold: 1.0
        });
        observer.observe(observeObject.value)
    })
</script>
<template>
    <div ref="observeObject"></div>
</template>