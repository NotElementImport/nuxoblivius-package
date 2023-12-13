<script setup lang="ts">
import VptInput from './VptInput/index.vue'
import { FormModel } from '../../index.js'

const props = defineProps<{
    model: FormModel,
}>()
function updateInput(index: string) {
    props.model.localValidate(index as string)
}
</script>
<template>
    <div class="vpt-form">
        <client-only>
            <div v-for="info, index in model.form">
                <vpt-input 
                    :type="info.type" 
                    :title="info.title" 
                    :value="info.value" 
                    :name="index" 
                    :options="info.options"
                    @vpt-update="() => updateInput(index as string)"/>
            </div>
        </client-only>
    </div>
</template>
<style scoped>
.vpt-form {
    display: flex;
    gap: 1em;
    flex-direction: column;
}
</style>../../__index.js