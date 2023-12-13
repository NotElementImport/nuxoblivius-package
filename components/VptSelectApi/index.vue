<script setup lang="ts">
import { ref } from 'vue';
import { IStateApiMany, IStateApiOne } from '../../index.js'

const props = defineProps<{
    currentIndex?: number,
    item: IStateApiOne<any>|IStateApiMany<any>
}>()

const enabled = ref(false)


</script>
<template>
    <div class="vp-full" :class="!enabled && 'vp-hidden'">
        <div class="vp-content">

        </div>
    </div>
</template>
<style scoped>
.vp-full {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0%;
    left: 0%;
    width: 100%;
    height: 100%;
    background: #0000003b;
}
.vp-content {

}
.vp-hidden {
    display: none;
}
</style>../../__index.js