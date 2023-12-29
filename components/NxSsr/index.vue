<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { checkForRobots, setIsServer } from '../../dist/ts/config.js'
setIsServer(true)
const isRobot = checkForRobots()
const show = ref(false)
if(!isRobot) {
    setIsServer(false)
}
onMounted(() => {
    setIsServer(false)
    show.value = true
})
</script>
<template>
    <div v-if="isRobot">
        <slot/>
    </div>
    <client-only v-if="!isRobot">
        <slot/>
    </client-only>
</template>