<!-- src/components/JourneyScene.vue -->
<template>
  <div ref="sceneContainer" class="journey-scene"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SceneManager from '@/core/SceneManager.js'
import EarthModel from '@/core/EarthModel.js'
import * as THREE from 'three'

const sceneContainer = ref(null)
let sceneManager = null
let earthModel = null
let animationFrameId = null
let clock = null

onMounted(() => {
  initScene()
  animate()
})

onUnmounted(() => {
  cleanup()
})

const initScene = () => {
  // Initialize scene manager
  sceneManager = new SceneManager(sceneContainer.value)

  // Create Earth model
  earthModel = new EarthModel()
  sceneManager.scene.add(earthModel.getGroup())

  // Add lighting
  addLighting()

  // Position camera for initial view
  sceneManager.camera.position.set(0, 0, 20000) // 20,000 km from Earth
  sceneManager.camera.lookAt(0, 0, 0)

  // Initialize clock for animations
  clock = new THREE.Clock()
}

const addLighting = () => {
  // Ambient light (slight blue for space)
  const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3)
  sceneManager.scene.add(ambientLight)

  // Directional sun light (golden hour)
  const sunLight = new THREE.DirectionalLight(0xffd580, 1.5)
  sunLight.position.set(1, 0.3, 0.5).normalize()
  sceneManager.scene.add(sunLight)

  // Rim light for Earth edge
  const rimLight = new THREE.DirectionalLight(0x8ba6ff, 0.4)
  rimLight.position.set(-1, 0, -0.5).normalize()
  sceneManager.scene.add(rimLight)
}

const animate = () => {
  animationFrameId = requestAnimationFrame(animate)

  const deltaTime = clock.getDelta()

  // Update Earth (cloud rotation)
  if (earthModel) {
    earthModel.update(deltaTime)
  }

  // Render scene
  if (sceneManager) {
    sceneManager.render()
  }
}

const cleanup = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  if (earthModel) {
    earthModel.dispose()
  }

  if (sceneManager) {
    sceneManager.dispose()
  }
}
</script>

<style scoped>
.journey-scene {
  width: 100vw;
  height: 100vh;
  position: relative;
}
</style>
