<script setup lang="ts">
import { ref, computed, defineProps } from 'vue'
import { IApiState } from '../../index'
const props = defineProps<{
    model: IApiState
}>()

const optimizedIteration = function* () {
    if(props.model.value.length != 0) {
        for (const iterator of props.model.value) {
            yield iterator
        }
    }
    return props.model.value
}
</script>
<template>
    <div v-for="item in optimizedIteration()">

    </div>
</template>