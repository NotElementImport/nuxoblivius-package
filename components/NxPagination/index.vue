<script setup lang="ts">
import { ref } from 'vue';
import NxEmpty from '../NxEmpty/index.vue'
const emit = defineEmits<{
    next: [],
    prev: [],
    page: [index: number]
}>()
const props = defineProps<{
    current: number,
    max: number,
    countOnSide?:number
}>()
const cos = ref(props.countOnSide ? props.countOnSide : 2)
</script>
<template>
    <NxEmpty>
        <button @click="()=>{emit('prev')}" class="pagination" :class="current < 2 && 'deactivate'">
            ⮜
        </button>
        <NxEmpty v-for="index of (cos * 2 + 1)" :key="current">
            <button @click="()=>{emit('page', (current - 1 + index - cos))}" 
                class="pagination" 
                :class="(current - 1 + index - cos) == current && 'active'" 
                v-if="(current - 1 + index - cos) >= 1 && (current - 1 + index - cos) <= max">
                {{ current - 1 + index - cos }}
            </button>
        </NxEmpty>
        <button @click="()=>{emit('next')}" class="pagination" :class="current > max - 1 && 'deactivate'">
            ⮞
        </button>
    </NxEmpty>
</template>
<style scoped>
.pagination {
    border: 1px solid gray;
    padding: 0.3em;
    display: block;
    padding-inline: 0.5em;
    aspect-ratio: 1/1;
    color: gray;
    background: transparent;
    border-left: none;
    border-right: none;
    cursor: pointer;
    border-right: 1px solid gray;
    opacity: 1;
    transition: opacity 0.2s ease-in-out;
    &.active {
        background: #3d8ee088;
    }
    &.deactivate {
        pointer-events: none;
        opacity: 0.5;
    }
    &:hover {
        background: rgba(211, 211, 211, 0.507);
    }
    &:first-child {
        border-top-left-radius: 9px;
        border-bottom-left-radius: 9px;
        border-right: 1px solid gray;
        border-left: 1px solid gray;
    }
    &:last-child {
        border-top-right-radius: 9px;
        border-bottom-right-radius: 9px;
        border-right: 1px solid gray;
    }
    &[hidden] {
        display: none;
    }
}
</style>