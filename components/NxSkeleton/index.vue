<script setup lang="ts">
import { Component, defineProps } from 'vue';
const props = defineProps<{
    isLoading: boolean,
    template: Component
}>()
</script>
<template>
    <div v-if="!isLoading">
        <slot />
    </div>
    <div v-if="isLoading">
        <component :is="template" />
    </div>
</template>