<!-- src/components/JourneyScene.vue -->
<template>
  <div ref="sceneContainer" class="journey-scene">
    <!-- Phase Indicator -->
    <div class="phase-indicator" v-if="currentPhase">
      <div class="phase-name">{{ currentPhase }}</div>
      <div class="phase-progress">
        <div class="progress-bar" :style="{ width: phaseProgress + '%' }"></div>
      </div>
    </div>

    <!-- Journey Guide Overlay -->
    <div class="journey-guide" :class="{ 'fade-out': guideHidden }">
      <div class="guide-header">
        <h2>🌍 Guided Earth Journey</h2>
      </div>
      <div class="guide-content">
        <p class="guide-main">Sit back and experience the Overview Effect</p>
        <div class="guide-info">
          <div class="info-item">
            <span class="icon">🚀</span>
            <span>Automatic camera movement through 4 phases</span>
          </div>
          <div class="info-item">
            <span class="icon">⏱️</span>
            <span>~10 minute journey from Earth to space</span>
          </div>
          <div class="info-item">
            <span class="icon">🎧</span>
            <span>Best experienced with headphones</span>
          </div>
        </div>
        <button class="hide-guide-btn" @click="hideGuide">I understand</button>
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
const guideHidden = ref(false)

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

  // Add starfield background
  addStarfield()

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

const addStarfield = () => {
  // Create distant starfield background
  const starGeometry = new THREE.BufferGeometry()
  const starCount = 2000
  const positions = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount * 3; i += 3) {
    // Random positions in a large sphere around the scene
    positions[i] = (Math.random() - 0.5) * 500000
    positions[i + 1] = (Math.random() - 0.5) * 500000
    positions[i + 2] = (Math.random() - 0.5) * 500000
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 120,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8
  })

  const stars = new THREE.Points(starGeometry, starMaterial)
  sceneManager.scene.add(stars)
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

const hideGuide = () => {
  guideHidden.value = true
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

/* Journey Guide Overlay */
.journey-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  z-index: 100;
  color: white;
  opacity: 1;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}

.journey-guide.fade-out {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.guide-header {
  text-align: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 1rem;
}

.guide-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: 2px;
}

.guide-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.guide-main {
  text-align: center;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-style: italic;
}

.guide-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
}

.info-item .icon {
  font-size: 1.5rem;
  width: 2rem;
  text-align: center;
  flex-shrink: 0;
}

.hide-guide-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: center;
  margin-top: 0.5rem;
}

.hide-guide-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.hide-guide-btn:active {
  transform: translateY(0);
}
</style>
