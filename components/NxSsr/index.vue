<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { checkForRobots, setIsServer } from '../../dist/ts/config.js'
setIsServer(false)
const isRobot = checkForRobots()
const show = ref(false)
if(isRobot) {
    setIsServer(true)
}
onMounted(() => {
    show.value = true
})
</script>
<template>
    <div v-if="isRobot">
        <slot/>
    </div>
    <client-only v-if="!isRobot && show">
        <slot/>
    </client-only>
</template>