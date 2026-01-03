<!-- src/App.vue -->
<template>
  <div id="godview-app">
    <PrimingScreen
      v-if="showPriming"
      @ready="handlePrimingComplete"
    />
    <JourneyScene v-else />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PrimingScreen from './components/PrimingScreen.vue'
import JourneyScene from './components/JourneyScene.vue'

const showPriming = ref(true)

const handlePrimingComplete = () => {
  showPriming.value = false
}
</script>

<style>
#godview-app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.journey-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  color: #fff;
}
</style>
