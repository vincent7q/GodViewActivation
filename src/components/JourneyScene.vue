<!-- src/components/JourneyScene.vue -->
<template>
  <div ref="sceneContainer" class="journey-scene">
    <div class="phase-indicator" v-if="currentPhase">
      <div class="phase-name">{{ currentPhase }}</div>
      <div class="phase-progress">
        <div class="progress-bar" :style="{ width: phaseProgress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SceneManager from '@/core/SceneManager.js'
import EarthModel from '@/core/EarthModel.js'
import JourneyOrchestrator from '@/core/JourneyOrchestrator.js'
import * as THREE from 'three'

const sceneContainer = ref(null)
const currentPhase = ref('')
const phaseProgress = ref(0)

let sceneManager = null
let earthModel = null
let orchestrator = null
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

  // Initialize journey orchestrator
  orchestrator = new JourneyOrchestrator()

  // Listen to phase changes
  orchestrator.on('phase-change', (data) => {
    currentPhase.value = data.currentPhase
    console.log(`Phase changed to: ${data.currentPhase}`)
  })

  orchestrator.on('journey-complete', () => {
    console.log('Journey complete!')
  })

  // Start the journey
  orchestrator.start()
  currentPhase.value = orchestrator.getCurrentPhase().name
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
  const deltaTimeMs = deltaTime * 1000 // Convert to milliseconds

  // Update journey orchestrator
  if (orchestrator) {
    orchestrator.update(deltaTimeMs)
    // Update phase progress indicator
    const phase = orchestrator.getCurrentPhase()
    if (phase) {
      phaseProgress.value = phase.getProgress() * 100
    }
  }

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

  if (orchestrator) {
    orchestrator.dispose()
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

.phase-indicator {
  position: absolute;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  z-index: 10;
}

.phase-name {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.phase-progress {
  width: 200px;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  transition: width 0.3s ease;
}
</style>
