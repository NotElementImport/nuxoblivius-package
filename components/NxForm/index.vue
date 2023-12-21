<script setup lang="ts">
import VptInput from './NxInput/index.vue'
import FormModel from '../../dist/ts/FormModel/index.js'

const props = defineProps<{
    model: FormModel,
    classInput?: string 
}>()
function updateInput(index: string) {
    props.model.localValidate(index as string)
}
function getClass() {
    if('classInput' in props) {
        return props.classInput
    }
    return undefined
}
</script>
<template>
    <div class="vpt-form">
        <client-only>
            <div v-for="info, index in (model.form as any)">
                <vpt-input 
                    :type="info.type" 
                    :title="info.title" 
                    :value="info.value" 
                    :name="index"
                    :class="getClass()"
                    :options="info.options"
                    @vpt-update="() => updateInput(index as any as string)"/>
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