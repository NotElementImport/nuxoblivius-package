<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { checkForRobots, setIsServer } from '../../dist/ts/config.js'
setIsServer(true)
const isRobot = checkForRobots()
const show = ref(false)
if(isRobot) {
    show.value = true
}
onMounted(() => {
    setIsServer(false)  
    show.value = true
})
</script>
<template>
    <div v-if="show">
        <slot/>
    </div>
</template>