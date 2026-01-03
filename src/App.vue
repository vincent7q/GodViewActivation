<template>
  <div id="godview-app">
    <h1>GodViewActivation</h1>
    <p>Overview Effect Journey - Coming Soon</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

onMounted(() => {
  console.log('GodViewActivation initialized')
})
</script>

<style scoped>
#godview-app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, #000000, #0a0a1a);
  color: #e0e0e0;
}
</style>
