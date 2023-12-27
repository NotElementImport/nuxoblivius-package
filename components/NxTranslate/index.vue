<script setup lang="ts">
import translate from '../../dist/ts/Translate/index'
import { defineProps } from 'vue';

const props = defineProps<{
    path: string
}>()

const data = translate.c(props.path) as any

</script>
<template>
    {{ data.value }}
</template>
