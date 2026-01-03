# GodViewActivation MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web-based psychological intervention platform that triggers the Overview Effect through a guided 7-10 minute journey with photorealistic Earth visualization, psychoacoustic audio, and evidence-based pacing.

**Architecture:** Vue.js 3 (Composition API) frontend with Three.js for 3D rendering, Express.js backend for Node.js server deployment on Ubuntu Linux. Journey-centric architecture with orchestrated camera paths, phase-based progression, and locked controls during the guided experience.

**Tech Stack:**
- Frontend: Vue.js 3, Three.js, Vite
- Backend: Node.js, Express.js
- Testing: Vitest
- Deployment: Ubuntu Linux with Node.js server

---

## Phase 0: Project Setup & Foundation

### Task 1: Initialize Vue.js + Vite Project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `.gitignore`
- Create: `index.html`

**Step 1: Initialize npm project**

Run: `npm init -y`
Expected: package.json created

**Step 2: Install core dependencies**

```bash
npm install vue@3 three@0.160.0
npm install -D vite@5 @vitejs/plugin-vue vitest
```

Expected: Dependencies installed, package.json updated

**Step 3: Create vite.config.js**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
```

**Step 4: Create .gitignore**

```
node_modules/
dist/
.DS_Store
*.log
.env
.vscode/
```

**Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GodViewActivation - Overview Effect Experience</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

**Step 6: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

**Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.js .gitignore index.html
git commit -m "feat: initialize Vue.js + Vite project with Three.js"
```

---

### Task 2: Create Basic Vue.js Application Structure

**Files:**
- Create: `src/main.js`
- Create: `src/App.vue`
- Create: `src/assets/styles/global.css`

**Step 1: Create src/main.js**

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/global.css'

createApp(App).mount('#app')
```

**Step 2: Create src/App.vue**

```vue
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
```

**Step 3: Create src/assets/styles/global.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
}

#app {
  width: 100%;
  height: 100%;
}
```

**Step 4: Test application runs**

Run: `npm run dev`
Expected: App runs on http://localhost:3000, shows "GodViewActivation" heading

**Step 5: Commit**

```bash
git add src/
git commit -m "feat: create basic Vue.js application structure"
```

---

### Task 3: Set Up Express.js Server for Ubuntu Deployment

**Files:**
- Create: `server/index.js`
- Create: `server/package.json`
- Create: `.env.example`

**Step 1: Create server directory and package.json**

```bash
mkdir server
cd server
npm init -y
npm install express compression helmet dotenv
cd ..
```

**Step 2: Create server/index.js**

```javascript
const express = require('express')
const path = require('path')
const compression = require('compression')
const helmet = require('helmet')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}))

// Compression middleware
app.use(compression())

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '../dist')))

// Handle all routes - send index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

// Start server
app.listen(PORT, () => {
  console.log(`GodViewActivation server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  process.exit(0)
})
```

**Step 3: Create .env.example**

```
PORT=3000
NODE_ENV=production
```

**Step 4: Update root package.json with server scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "server:dev": "NODE_ENV=development node server/index.js",
    "server:prod": "NODE_ENV=production node server/index.js",
    "deploy": "npm run build && npm run server:prod"
  }
}
```

**Step 5: Test production build**

Run: `npm run build && npm run server:dev`
Expected: Server starts, serves built files

**Step 6: Commit**

```bash
git add server/ .env.example package.json
git commit -m "feat: add Express.js server for Ubuntu deployment"
```

---

### Task 4: Create Asset Directory Structure with Placeholders

**Files:**
- Create: `src/assets/textures/README.md`
- Create: `src/assets/audio/README.md`
- Create: `public/README.md`

**Step 1: Create directory structure**

```bash
mkdir -p src/assets/textures
mkdir -p src/assets/audio
mkdir -p public
```

**Step 2: Create src/assets/textures/README.md**

```markdown
# Earth Textures

## Current Status: PLACEHOLDER ASSETS

**Production Requirements:**
- Earth Day Texture: 8K resolution (8192x4096 pixels)
- Earth Night Texture: 8K resolution (8192x4096 pixels)
- Earth Clouds: 4K resolution (4096x2048 pixels) with alpha channel
- Earth Topology/Bump Map: 4K resolution
- Earth Specular Map: 2K resolution (2048x1024 pixels)

## Source: NASA Public Domain

**Blue Marble Collection:**
- https://visibleearth.nasa.gov/collection/1484/blue-marble
- Download "Blue Marble Next Generation" - 8K resolution
- License: Public Domain (NASA)

**Night Lights (Black Marble):**
- https://earthobservatory.nasa.gov/features/NightLights
- Download "Earth at Night" composite
- License: Public Domain (NASA)

**Cloud Cover:**
- https://visibleearth.nasa.gov/images/57747/blue-marble-clouds
- Download cloud layer with transparency
- License: Public Domain (NASA)

## Placeholder Assets (Development)

For initial development, using:
- 1K low-res placeholder textures
- Generated via canvas or solid colors
- Will be replaced with NASA textures for production
```

**Step 3: Create src/assets/audio/README.md**

```markdown
# Audio Assets

## Current Status: TEXT PLACEHOLDERS

**Production Requirements:**
- Format: MP3 (primary), OGG (fallback)
- Narration clips: Professional voiceover recording
- Ambient soundscape: 3-5 minute seamless loop
- Binaural beats: Generated programmatically (Web Audio API)

## Narration Script (Text Placeholders)

**Narration 1 (2:30 mark - Transition Phase):**
Text: "The Earth is a fragile oasis in the vastness of space."
Duration: ~8 seconds
Voice: Professional female voiceover (recommended)

**Narration 2 (4:00 mark - Contemplation Phase):**
Text: "There are no borders or boundaries on our planet except those we create in our minds."
Duration: ~10 seconds
Source: Sultan bin Salman Al Saud (adapted)

**Narration 3 (6:00 mark - Contemplation Phase):**
Text: "We are all astronauts on Spaceship Earth."
Duration: ~8 seconds
Source: Buckminster Fuller

**Narration 4 (8:30 mark - Integration Phase):**
Text: "Look again at that dot. That's here. That's home. That's us."
Duration: ~12 seconds
Source: Carl Sagan

## Ambient Soundscape Requirements

- Style: Ethereal, minimal, space-like "silence"
- Tempo: Very slow, drone-like
- Mood: Contemplative, vast, peaceful
- Loop: Seamless 3-5 minute loop
- Sources: Royalty-free music libraries (FreeMusicArchive, AudioJungle)

## Production Notes

- Record narration with professional voice actor ($200-500 budget)
- Ensure clear pronunciation and emotional resonance
- Add subtle reverb for "space" feel
- Master at -14 LUFS for consistent volume
```

**Step 4: Create public/README.md**

```markdown
# Public Assets

Static assets served directly (favicon, meta images, etc.)

- favicon.ico
- og-image.png (for social sharing)
- robots.txt
```

**Step 5: Commit**

```bash
git add src/assets/ public/
git commit -m "docs: create asset directory structure with placeholder documentation"
```

---

## Phase 1: Priming Screen (Vertical Slice)

### Task 5: Create PrimingScreen Component (Test-First)

**Files:**
- Create: `src/components/PrimingScreen.vue`
- Create: `tests/components/PrimingScreen.test.js`

**Step 1: Write the failing test**

```javascript
// tests/components/PrimingScreen.test.js
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimingScreen from '@/components/PrimingScreen.vue'

describe('PrimingScreen', () => {
  it('should render priming message', () => {
    const wrapper = mount(PrimingScreen)
    expect(wrapper.text()).toContain('You are about to see Earth as astronauts see it')
  })

  it('should emit "ready" event when button clicked', async () => {
    const wrapper = mount(PrimingScreen)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('ready')
  })

  it('should have "I\'m Ready" button', () => {
    const wrapper = mount(PrimingScreen)
    expect(wrapper.find('button').text()).toBe("I'm Ready")
  })
})
```

**Step 2: Install test dependencies**

```bash
npm install -D @vue/test-utils jsdom
```

**Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module '@/components/PrimingScreen.vue'"

**Step 4: Write minimal implementation**

```vue
<!-- src/components/PrimingScreen.vue -->
<template>
  <div class="priming-screen">
    <div class="priming-content">
      <h1>You are about to see Earth as astronauts see it.</h1>

      <p class="priming-text">
        Many who witness this view report a profound shift in perspective—
        a sense of awe, interconnectedness, and responsibility for our shared home.
      </p>

      <p class="priming-instruction">
        Take a deep breath.<br>
        Allow yourself to be fully present.<br>
        What you're about to witness may change how you see our world.
      </p>

      <button
        class="begin-journey"
        @click="handleReady"
        aria-label="Begin the journey"
      >
        I'm Ready
      </button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['ready'])

const handleReady = () => {
  emit('ready')
}
</script>

<style scoped>
.priming-screen {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, #000000, #0a0a1a);
  color: #e0e0e0;
  animation: fadeIn 2s ease-in;
}

.priming-content {
  max-width: 600px;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 2rem;
  line-height: 1.3;
}

.priming-text {
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.priming-instruction {
  font-size: 1rem;
  line-height: 2;
  margin-bottom: 3rem;
  opacity: 0.8;
  font-style: italic;
}

.begin-journey {
  padding: 1rem 3rem;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 4px;
}

.begin-journey:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
```

**Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS - All 3 tests pass

**Step 6: Commit**

```bash
git add src/components/PrimingScreen.vue tests/
git commit -m "feat: add PrimingScreen component with tests"
```

---

### Task 6: Integrate PrimingScreen into App

**Files:**
- Modify: `src/App.vue`
- Create: `tests/App.test.js`

**Step 1: Write the failing test**

```javascript
// tests/App.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App', () => {
  it('should show priming screen initially', () => {
    const wrapper = mount(App)
    expect(wrapper.html()).toContain('You are about to see Earth')
  })

  it('should hide priming screen when ready event emitted', async () => {
    const wrapper = mount(App)
    await wrapper.findComponent({ name: 'PrimingScreen' }).vm.$emit('ready')
    // Will fail initially - no state management yet
    expect(wrapper.findComponent({ name: 'PrimingScreen' }).exists()).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - Second test fails (no state management)

**Step 3: Implement state management in App.vue**

```vue
<!-- src/App.vue -->
<template>
  <div id="godview-app">
    <PrimingScreen
      v-if="showPriming"
      @ready="handlePrimingComplete"
    />
    <div v-else class="journey-placeholder">
      <p>Journey will start here...</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PrimingScreen from './components/PrimingScreen.vue'

const showPriming = ref(true)

const handlePrimingComplete = () => {
  showPriming.value = false
  console.log('Priming complete, starting journey...')
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
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS - Both tests pass

**Step 5: Manual test in browser**

Run: `npm run dev`
Actions:
1. Navigate to http://localhost:3000
2. Verify priming screen displays
3. Click "I'm Ready" button
4. Verify screen transitions to journey placeholder

Expected: All interactions work smoothly

**Step 6: Commit**

```bash
git add src/App.vue tests/App.test.js
git commit -m "feat: integrate PrimingScreen with state management"
```

---

## Phase 2: Three.js Scene Setup

### Task 7: Create ThreeJS Scene Manager (Test-First)

**Files:**
- Create: `src/core/SceneManager.js`
- Create: `tests/core/SceneManager.test.js`

**Step 1: Write the failing test**

```javascript
// tests/core/SceneManager.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as THREE from 'three'
import SceneManager from '@/core/SceneManager.js'

describe('SceneManager', () => {
  let container
  let sceneManager

  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (sceneManager) {
      sceneManager.dispose()
    }
    document.body.removeChild(container)
  })

  it('should initialize scene, camera, and renderer', () => {
    sceneManager = new SceneManager(container)
    expect(sceneManager.scene).toBeInstanceOf(THREE.Scene)
    expect(sceneManager.camera).toBeInstanceOf(THREE.PerspectiveCamera)
    expect(sceneManager.renderer).toBeInstanceOf(THREE.WebGLRenderer)
  })

  it('should set camera aspect ratio based on container', () => {
    sceneManager = new SceneManager(container)
    expect(sceneManager.camera.aspect).toBe(800 / 600)
  })

  it('should append canvas to container', () => {
    sceneManager = new SceneManager(container)
    expect(container.querySelector('canvas')).not.toBeNull()
  })

  it('should have render method', () => {
    sceneManager = new SceneManager(container)
    expect(typeof sceneManager.render).toBe('function')
  })

  it('should have dispose method for cleanup', () => {
    sceneManager = new SceneManager(container)
    expect(typeof sceneManager.dispose).toBe('function')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module '@/core/SceneManager.js'"

**Step 3: Create directory and minimal implementation**

```bash
mkdir -p src/core
```

```javascript
// src/core/SceneManager.js
import * as THREE from 'three'

export default class SceneManager {
  constructor(container) {
    this.container = container
    this.scene = null
    this.camera = null
    this.renderer = null

    this.init()
  }

  init() {
    // Create scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000000)

    // Create camera
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      width / height, // Aspect ratio
      0.1, // Near plane
      1000000000 // Far plane (1 billion km for space)
    )
    this.camera.position.set(0, 0, 10000) // Start 10,000 km from origin

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Append to container
    this.container.appendChild(this.renderer.domElement)

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this))
  }

  handleResize() {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    window.removeEventListener('resize', this.handleResize.bind(this))

    if (this.renderer) {
      this.renderer.dispose()
      if (this.container && this.renderer.domElement) {
        this.container.removeChild(this.renderer.domElement)
      }
    }

    // Clean up scene
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose()
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
    }
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS - All SceneManager tests pass

**Step 5: Commit**

```bash
git add src/core/SceneManager.js tests/core/
git commit -m "feat: add SceneManager for Three.js scene initialization"
```

---

### Task 8: Create Earth Model with Placeholder Texture

**Files:**
- Create: `src/core/EarthModel.js`
- Create: `tests/core/EarthModel.test.js`
- Create: `src/utils/textureGenerator.js`

**Step 1: Create placeholder texture generator**

```javascript
// src/utils/textureGenerator.js
import * as THREE from 'three'

/**
 * Generate placeholder Earth texture using canvas
 * Production: Replace with NASA Blue Marble 8K texture
 */
export function generatePlaceholderEarthTexture(resolution = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = resolution
  canvas.height = resolution / 2
  const ctx = canvas.getContext('2d')

  // Blue ocean background
  ctx.fillStyle = '#1e3a5f'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Green continents (simplified blobs)
  ctx.fillStyle = '#2d5016'

  // North America
  ctx.beginPath()
  ctx.arc(resolution * 0.2, resolution * 0.2, resolution * 0.08, 0, Math.PI * 2)
  ctx.fill()

  // South America
  ctx.beginPath()
  ctx.arc(resolution * 0.25, resolution * 0.35, resolution * 0.05, 0, Math.PI * 2)
  ctx.fill()

  // Europe/Africa
  ctx.beginPath()
  ctx.arc(resolution * 0.5, resolution * 0.25, resolution * 0.1, 0, Math.PI * 2)
  ctx.fill()

  // Asia
  ctx.beginPath()
  ctx.arc(resolution * 0.7, resolution * 0.2, resolution * 0.12, 0, Math.PI * 2)
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true

  return texture
}

/**
 * Generate placeholder cloud texture
 * Production: Replace with NASA cloud layer 4K
 */
export function generatePlaceholderCloudTexture(resolution = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = resolution
  canvas.height = resolution / 2
  const ctx = canvas.getContext('2d')

  // Transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // White clouds with alpha
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'

  for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const radius = Math.random() * 30 + 10

    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true

  return texture
}
```

**Step 2: Write the failing test**

```javascript
// tests/core/EarthModel.test.js
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import EarthModel from '@/core/EarthModel.js'

describe('EarthModel', () => {
  it('should create Earth mesh with sphere geometry', () => {
    const earthModel = new EarthModel()
    expect(earthModel.earthMesh).toBeInstanceOf(THREE.Mesh)
    expect(earthModel.earthMesh.geometry).toBeInstanceOf(THREE.SphereGeometry)
  })

  it('should have correct Earth radius (6371 km)', () => {
    const earthModel = new EarthModel()
    const geometry = earthModel.earthMesh.geometry
    expect(geometry.parameters.radius).toBe(6371)
  })

  it('should create clouds layer mesh', () => {
    const earthModel = new EarthModel()
    expect(earthModel.cloudsMesh).toBeInstanceOf(THREE.Mesh)
  })

  it('should have clouds layer slightly above Earth surface', () => {
    const earthModel = new EarthModel()
    const cloudsRadius = earthModel.cloudsMesh.geometry.parameters.radius
    const earthRadius = earthModel.earthMesh.geometry.parameters.radius
    expect(cloudsRadius).toBeGreaterThan(earthRadius)
  })

  it('should return group containing both meshes', () => {
    const earthModel = new EarthModel()
    expect(earthModel.getGroup()).toBeInstanceOf(THREE.Group)
    expect(earthModel.getGroup().children).toHaveLength(2)
  })
})
```

**Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module '@/core/EarthModel.js'"

**Step 4: Implement EarthModel**

```javascript
// src/core/EarthModel.js
import * as THREE from 'three'
import {
  generatePlaceholderEarthTexture,
  generatePlaceholderCloudTexture
} from '@/utils/textureGenerator.js'

export default class EarthModel {
  constructor(options = {}) {
    this.earthMesh = null
    this.cloudsMesh = null
    this.group = new THREE.Group()

    // Device detection for LOD
    this.isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent)
    this.segments = this.isMobile ? 64 : 128

    this.init()
  }

  init() {
    this.createEarthMesh()
    this.createCloudsMesh()

    this.group.add(this.earthMesh)
    this.group.add(this.cloudsMesh)
  }

  createEarthMesh() {
    // Earth geometry: radius in km
    const geometry = new THREE.SphereGeometry(
      6371, // Earth radius in km
      this.segments, // Width segments
      this.segments  // Height segments
    )

    // Placeholder texture (will be replaced with NASA 8K)
    const texture = generatePlaceholderEarthTexture(1024)

    // Material
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 5
    })

    this.earthMesh = new THREE.Mesh(geometry, material)
    this.earthMesh.rotation.y = -Math.PI / 2 // Rotate to show continents
  }

  createCloudsMesh() {
    // Clouds slightly above Earth surface
    const geometry = new THREE.SphereGeometry(
      6371 + 50, // 50 km above surface
      this.segments,
      this.segments
    )

    const texture = generatePlaceholderCloudTexture(512)

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    })

    this.cloudsMesh = new THREE.Mesh(geometry, material)
  }

  update(deltaTime) {
    // Slow cloud rotation for subtle animation
    if (this.cloudsMesh) {
      this.cloudsMesh.rotation.y += deltaTime * 0.00005
    }
  }

  getGroup() {
    return this.group
  }

  dispose() {
    // Clean up geometries and materials
    if (this.earthMesh) {
      this.earthMesh.geometry.dispose()
      this.earthMesh.material.dispose()
    }
    if (this.cloudsMesh) {
      this.cloudsMesh.geometry.dispose()
      this.cloudsMesh.material.dispose()
    }
  }
}
```

**Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS - All EarthModel tests pass

**Step 6: Commit**

```bash
git add src/core/EarthModel.js src/utils/textureGenerator.js tests/
git commit -m "feat: add EarthModel with placeholder textures"
```

---

### Task 9: Create JourneyScene Component

**Files:**
- Create: `src/components/JourneyScene.vue`
- Modify: `src/App.vue`

**Step 1: Create JourneyScene.vue**

```vue
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
```

**Step 2: Update App.vue to show JourneyScene**

```vue
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
</style>
```

**Step 3: Manual test in browser**

Run: `npm run dev`
Actions:
1. Navigate to http://localhost:3000
2. Click "I'm Ready" on priming screen
3. Verify Earth renders with rotating clouds
4. Verify lighting creates atmospheric effect

Expected: Earth visible with placeholder texture, clouds rotating slowly

**Step 4: Commit**

```bash
git add src/components/JourneyScene.vue src/App.vue
git commit -m "feat: add JourneyScene component with Earth rendering"
```

---

## Phase 3: Journey Orchestration System

### Task 10: Create JourneyOrchestrator (Test-First)

**Files:**
- Create: `src/core/JourneyOrchestrator.js`
- Create: `tests/core/JourneyOrchestrator.test.js`

**Step 1: Write the failing test**

```javascript
// tests/core/JourneyOrchestrator.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import JourneyOrchestrator from '@/core/JourneyOrchestrator.js'

describe('JourneyOrchestrator', () => {
  let orchestrator

  beforeEach(() => {
    orchestrator = new JourneyOrchestrator()
  })

  it('should initialize with 4 phases', () => {
    expect(orchestrator.phases).toHaveLength(4)
  })

  it('should start at phase 0 (Ascent)', () => {
    expect(orchestrator.currentPhaseIndex).toBe(0)
    expect(orchestrator.getCurrentPhase().name).toBe('Ascent')
  })

  it('should have total journey duration of 7-10 minutes', () => {
    const totalDuration = orchestrator.phases.reduce(
      (sum, phase) => sum + phase.duration,
      0
    )
    expect(totalDuration).toBeGreaterThanOrEqual(420000) // 7 min
    expect(totalDuration).toBeLessThanOrEqual(600000) // 10 min
  })

  it('should start journey and set isActive to true', () => {
    orchestrator.start()
    expect(orchestrator.isActive).toBe(true)
  })

  it('should emit phase-change event on transition', () => {
    const callback = vi.fn()
    orchestrator.on('phase-change', callback)

    orchestrator.start()
    orchestrator.update(121000) // 2:01 - trigger transition

    expect(callback).toHaveBeenCalled()
  })

  it('should complete journey after all phases', () => {
    const callback = vi.fn()
    orchestrator.on('journey-complete', callback)

    orchestrator.start()
    orchestrator.update(600000) // 10 minutes

    expect(callback).toHaveBeenCalled()
    expect(orchestrator.isActive).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module '@/core/JourneyOrchestrator.js'"

**Step 3: Create JourneyPhase class**

```javascript
// src/core/JourneyPhase.js
export default class JourneyPhase {
  constructor(name, duration) {
    this.name = name
    this.duration = duration // in milliseconds
    this.elapsed = 0
    this.progress = 0 // 0 to 1
  }

  enter() {
    this.elapsed = 0
    this.progress = 0
    console.log(`Entering phase: ${this.name}`)
  }

  update(deltaTime) {
    this.elapsed += deltaTime
    this.progress = Math.min(this.elapsed / this.duration, 1)
  }

  isComplete() {
    return this.elapsed >= this.duration
  }

  exit() {
    console.log(`Exiting phase: ${this.name}`)
  }

  getProgress() {
    return this.progress
  }
}
```

**Step 4: Implement JourneyOrchestrator**

```javascript
// src/core/JourneyOrchestrator.js
import JourneyPhase from './JourneyPhase.js'

export default class JourneyOrchestrator {
  constructor() {
    this.phases = [
      new JourneyPhase('Ascent', 120000),        // 2 minutes
      new JourneyPhase('Transition', 120000),    // 2 minutes
      new JourneyPhase('Contemplation', 180000), // 3 minutes
      new JourneyPhase('Integration', 180000)    // 3 minutes
    ]

    this.currentPhaseIndex = 0
    this.isActive = false
    this.totalElapsed = 0
    this.eventListeners = {}
  }

  start() {
    this.isActive = true
    this.totalElapsed = 0
    this.currentPhaseIndex = 0
    this.getCurrentPhase().enter()
    this.emit('journey-start')
  }

  update(deltaTime) {
    if (!this.isActive) return

    this.totalElapsed += deltaTime

    const currentPhase = this.getCurrentPhase()
    currentPhase.update(deltaTime)

    if (currentPhase.isComplete()) {
      this.transitionToNextPhase()
    }
  }

  transitionToNextPhase() {
    const currentPhase = this.getCurrentPhase()
    currentPhase.exit()

    this.currentPhaseIndex++

    if (this.currentPhaseIndex >= this.phases.length) {
      this.completeJourney()
    } else {
      const nextPhase = this.getCurrentPhase()
      nextPhase.enter()
      this.emit('phase-change', {
        previousPhase: currentPhase.name,
        currentPhase: nextPhase.name,
        phaseIndex: this.currentPhaseIndex
      })
    }
  }

  completeJourney() {
    this.isActive = false
    this.emit('journey-complete', {
      totalDuration: this.totalElapsed
    })
  }

  getCurrentPhase() {
    return this.phases[this.currentPhaseIndex]
  }

  // Simple event emitter
  on(eventName, callback) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = []
    }
    this.eventListeners[eventName].push(callback)
  }

  emit(eventName, data) {
    if (this.eventListeners[eventName]) {
      this.eventListeners[eventName].forEach(callback => {
        callback(data)
      })
    }
  }

  dispose() {
    this.isActive = false
    this.eventListeners = {}
  }
}
```

**Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS - All JourneyOrchestrator tests pass

**Step 6: Commit**

```bash
git add src/core/JourneyOrchestrator.js src/core/JourneyPhase.js tests/
git commit -m "feat: add JourneyOrchestrator with 4-phase system"
```

---

### Task 11: Integrate JourneyOrchestrator into JourneyScene

**Files:**
- Modify: `src/components/JourneyScene.vue`
- Create: `src/components/JourneyHUD.vue`

**Step 1: Create JourneyHUD component**

```vue
<!-- src/components/JourneyHUD.vue -->
<template>
  <div class="journey-hud">
    <div v-if="showPhaseIndicator" class="phase-indicator">
      {{ currentPhaseName }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  currentPhase: {
    type: String,
    default: ''
  }
})

const showPhaseIndicator = ref(false)
const currentPhaseName = ref('')
let hideTimeout = null

watch(() => props.currentPhase, (newPhase) => {
  if (newPhase) {
    currentPhaseName.value = newPhase
    showPhaseIndicator.value = true

    // Hide after 3 seconds
    clearTimeout(hideTimeout)
    hideTimeout = setTimeout(() => {
      showPhaseIndicator.value = false
    }, 3000)
  }
})
</script>

<style scoped>
.journey-hud {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.phase-indicator {
  position: absolute;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.5rem;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  animation: fadeIn 1s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
```

**Step 2: Update JourneyScene.vue with orchestrator**

```vue
<!-- src/components/JourneyScene.vue -->
<template>
  <div ref="sceneContainer" class="journey-scene">
    <JourneyHUD :current-phase="currentPhase" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SceneManager from '@/core/SceneManager.js'
import EarthModel from '@/core/EarthModel.js'
import JourneyOrchestrator from '@/core/JourneyOrchestrator.js'
import JourneyHUD from './JourneyHUD.vue'
import * as THREE from 'three'

const sceneContainer = ref(null)
const currentPhase = ref('')

let sceneManager = null
let earthModel = null
let orchestrator = null
let animationFrameId = null
let clock = null

onMounted(() => {
  initScene()
  initOrchestrator()
  animate()
})

onUnmounted(() => {
  cleanup()
})

const initScene = () => {
  sceneManager = new SceneManager(sceneContainer.value)
  earthModel = new EarthModel()
  sceneManager.scene.add(earthModel.getGroup())
  addLighting()

  // Initial camera position
  sceneManager.camera.position.set(0, 0, 20000)
  sceneManager.camera.lookAt(0, 0, 0)

  clock = new THREE.Clock()
}

const initOrchestrator = () => {
  orchestrator = new JourneyOrchestrator()

  // Listen to phase changes
  orchestrator.on('phase-change', (data) => {
    currentPhase.value = data.currentPhase
    console.log(`Phase changed to: ${data.currentPhase}`)
  })

  // Listen to journey completion
  orchestrator.on('journey-complete', (data) => {
    console.log(`Journey complete! Duration: ${data.totalDuration}ms`)
  })

  // Start the journey
  orchestrator.start()
  currentPhase.value = orchestrator.getCurrentPhase().name
}

const addLighting = () => {
  const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3)
  sceneManager.scene.add(ambientLight)

  const sunLight = new THREE.DirectionalLight(0xffd580, 1.5)
  sunLight.position.set(1, 0.3, 0.5).normalize()
  sceneManager.scene.add(sunLight)

  const rimLight = new THREE.DirectionalLight(0x8ba6ff, 0.4)
  rimLight.position.set(-1, 0, -0.5).normalize()
  sceneManager.scene.add(rimLight)
}

const animate = () => {
  animationFrameId = requestAnimationFrame(animate)

  const deltaTime = clock.getDelta() * 1000 // Convert to milliseconds

  // Update orchestrator
  if (orchestrator) {
    orchestrator.update(deltaTime)
  }

  // Update Earth
  if (earthModel) {
    earthModel.update(deltaTime / 1000) // EarthModel expects seconds
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
</style>
```

**Step 3: Manual test in browser**

Run: `npm run dev`
Actions:
1. Click "I'm Ready" on priming screen
2. Verify "ASCENT" appears at top of screen
3. Wait 2 minutes, verify "TRANSITION" appears
4. Check console for phase change logs

Expected: Phase indicator shows and fades, phases progress automatically

**Step 4: Commit**

```bash
git add src/components/JourneyScene.vue src/components/JourneyHUD.vue
git commit -m "feat: integrate JourneyOrchestrator with HUD phase indicator"
```

---

## Phase 4: Camera Animation System

### Task 12: Create CameraController (Test-First)

**Files:**
- Create: `src/core/CameraController.js`
- Create: `tests/core/CameraController.test.js`

**Step 1: Write the failing test**

```javascript
// tests/core/CameraController.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import CameraController from '@/core/CameraController.js'

describe('CameraController', () => {
  let camera
  let controller

  beforeEach(() => {
    camera = new THREE.PerspectiveCamera(75, 16/9, 0.1, 1000000)
    camera.position.set(0, 0, 20000)
    controller = new CameraController(camera)
  })

  it('should initialize with camera', () => {
    expect(controller.camera).toBe(camera)
  })

  it('should have isLocked property defaulting to true', () => {
    expect(controller.isLocked).toBe(true)
  })

  it('should move camera to target position over time', () => {
    const startPos = camera.position.clone()
    const targetPos = new THREE.Vector3(10000, 5000, 15000)

    controller.moveTo(targetPos, 2000) // 2 seconds
    controller.update(1000) // Update 1 second

    // Camera should be halfway to target
    expect(camera.position.distanceTo(startPos)).toBeGreaterThan(0)
    expect(camera.position.distanceTo(targetPos)).toBeGreaterThan(0)
  })

  it('should reach target position after duration', () => {
    const targetPos = new THREE.Vector3(10000, 5000, 15000)

    controller.moveTo(targetPos, 2000)
    controller.update(2000) // Complete the movement

    expect(camera.position.distanceTo(targetPos)).toBeLessThan(1)
  })

  it('should support easing functions', () => {
    expect(typeof controller.easeInOut).toBe('function')
    expect(controller.easeInOut(0)).toBe(0)
    expect(controller.easeInOut(1)).toBe(1)
    expect(controller.easeInOut(0.5)).toBeGreaterThan(0.4)
    expect(controller.easeInOut(0.5)).toBeLessThan(0.6)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module '@/core/CameraController.js'"

**Step 3: Implement CameraController**

```javascript
// src/core/CameraController.js
import * as THREE from 'three'

export default class CameraController {
  constructor(camera) {
    this.camera = camera
    this.isLocked = true // Camera locked during guided journey

    // Animation state
    this.isAnimating = false
    this.startPosition = new THREE.Vector3()
    this.targetPosition = new THREE.Vector3()
    this.animationDuration = 0
    this.animationElapsed = 0

    // Look-at target (always Earth center for journey)
    this.lookAtTarget = new THREE.Vector3(0, 0, 0)
  }

  /**
   * Animate camera to target position over duration
   * @param {THREE.Vector3} targetPos - Target position
   * @param {number} duration - Duration in milliseconds
   */
  moveTo(targetPos, duration = 1000) {
    this.startPosition.copy(this.camera.position)
    this.targetPosition.copy(targetPos)
    this.animationDuration = duration
    this.animationElapsed = 0
    this.isAnimating = true
  }

  /**
   * Update camera animation
   * @param {number} deltaTime - Time delta in milliseconds
   */
  update(deltaTime) {
    if (!this.isAnimating) return

    this.animationElapsed += deltaTime
    const progress = Math.min(this.animationElapsed / this.animationDuration, 1)

    // Apply easing
    const easedProgress = this.easeInOut(progress)

    // Interpolate position
    this.camera.position.lerpVectors(
      this.startPosition,
      this.targetPosition,
      easedProgress
    )

    // Always look at Earth center during journey
    this.camera.lookAt(this.lookAtTarget)

    // Complete animation
    if (progress >= 1) {
      this.isAnimating = false
    }
  }

  /**
   * Smooth ease-in-out function
   * @param {number} t - Progress 0 to 1
   * @returns {number} Eased progress
   */
  easeInOut(t) {
    return t < 0.5
      ? 2 * t * t
      : -1 + (4 - 2 * t) * t
  }

  /**
   * Set camera position immediately (no animation)
   */
  setPosition(position) {
    this.camera.position.copy(position)
    this.camera.lookAt(this.lookAtTarget)
  }

  /**
   * Lock/unlock camera for user control
   */
  lock() {
    this.isLocked = true
  }

  unlock() {
    this.isLocked = false
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS - All CameraController tests pass

**Step 5: Commit**

```bash
git add src/core/CameraController.js tests/core/CameraController.test.js
git commit -m "feat: add CameraController for animated camera movements"
```

---

### Task 13: Define Camera Waypoints for Each Phase

**Files:**
- Create: `src/config/journeyConfig.js`
- Create: `tests/config/journeyConfig.test.js`

**Step 1: Write the failing test**

```javascript
// tests/config/journeyConfig.test.js
import { describe, it, expect } from 'vitest'
import { JOURNEY_WAYPOINTS, PHASE_CONFIG } from '@/config/journeyConfig.js'

describe('journeyConfig', () => {
  it('should define all required waypoints', () => {
    expect(JOURNEY_WAYPOINTS.SURFACE).toBeDefined()
    expect(JOURNEY_WAYPOINTS.LOW_ORBIT).toBeDefined()
    expect(JOURNEY_WAYPOINTS.TRANSITION).toBeDefined()
    expect(JOURNEY_WAYPOINTS.CONTEMPLATION).toBeDefined()
    expect(JOURNEY_WAYPOINTS.PALE_BLUE_DOT).toBeDefined()
  })

  it('should have phase config for all 4 phases', () => {
    expect(PHASE_CONFIG).toHaveLength(4)
    expect(PHASE_CONFIG[0].name).toBe('Ascent')
    expect(PHASE_CONFIG[1].name).toBe('Transition')
    expect(PHASE_CONFIG[2].name).toBe('Contemplation')
    expect(PHASE_CONFIG[3].name).toBe('Integration')
  })

  it('should define camera start and end positions for each phase', () => {
    PHASE_CONFIG.forEach(phase => {
      expect(phase.cameraStart).toBeDefined()
      expect(phase.cameraEnd).toBeDefined()
    })
  })

  it('should have waypoints at increasing distances from Earth', () => {
    const surface = JOURNEY_WAYPOINTS.SURFACE.length()
    const lowOrbit = JOURNEY_WAYPOINTS.LOW_ORBIT.length()
    const transition = JOURNEY_WAYPOINTS.TRANSITION.length()
    const contemplation = JOURNEY_WAYPOINTS.CONTEMPLATION.length()

    expect(lowOrbit).toBeGreaterThan(surface)
    expect(transition).toBeGreaterThan(lowOrbit)
    expect(contemplation).toBeGreaterThan(transition)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module '@/config/journeyConfig.js'"

**Step 3: Create journey configuration**

```javascript
// src/config/journeyConfig.js
import * as THREE from 'three'

/**
 * Key camera waypoints for the journey
 * Distances are in kilometers from Earth center
 * Earth radius = 6,371 km
 */
export const JOURNEY_WAYPOINTS = {
  // Earth surface (sea level)
  SURFACE: new THREE.Vector3(0, 6371, 0),

  // Low Earth orbit (ISS altitude ~400 km)
  LOW_ORBIT: new THREE.Vector3(0, 6371 + 400, 0),

  // Higher orbit for transition (2,000 km altitude)
  TRANSITION: new THREE.Vector3(0, 0, 6371 + 2000),

  // Geostationary orbit distance for contemplation (~35,000 km)
  CONTEMPLATION: new THREE.Vector3(35000, 0, 0),

  // "Pale blue dot" view (very far, ~150 million km)
  PALE_BLUE_DOT: new THREE.Vector3(0, 0, 150000),

  // Return to closer orbit for ending
  CLOSE_ORBIT: new THREE.Vector3(0, 15000, 15000)
}

/**
 * Phase-specific camera configuration
 */
export const PHASE_CONFIG = [
  {
    name: 'Ascent',
    duration: 120000, // 2 minutes
    cameraStart: JOURNEY_WAYPOINTS.SURFACE,
    cameraEnd: JOURNEY_WAYPOINTS.LOW_ORBIT,
    description: 'Rising from Earth surface to low orbit'
  },
  {
    name: 'Transition',
    duration: 120000, // 2 minutes
    cameraStart: JOURNEY_WAYPOINTS.LOW_ORBIT,
    cameraEnd: JOURNEY_WAYPOINTS.TRANSITION,
    description: 'Breaking into space, Earth becomes whole'
  },
  {
    name: 'Contemplation',
    duration: 180000, // 3 minutes
    cameraStart: JOURNEY_WAYPOINTS.TRANSITION,
    cameraEnd: JOURNEY_WAYPOINTS.CONTEMPLATION,
    description: 'Slow orbit around borderless Earth'
  },
  {
    name: 'Integration',
    duration: 180000, // 3 minutes
    cameraStart: JOURNEY_WAYPOINTS.CONTEMPLATION,
    cameraEnd: JOURNEY_WAYPOINTS.PALE_BLUE_DOT,
    description: 'Zoom to pale blue dot, then return'
  }
]

/**
 * Narration timestamps (in milliseconds from journey start)
 */
export const NARRATION_TIMESTAMPS = [
  {
    time: 150000, // 2:30
    text: "The Earth is a fragile oasis in the vastness of space.",
    key: 'narration-1'
  },
  {
    time: 240000, // 4:00
    text: "There are no borders or boundaries on our planet except those we create in our minds.",
    key: 'narration-2'
  },
  {
    time: 360000, // 6:00
    text: "We are all astronauts on Spaceship Earth.",
    key: 'narration-3'
  },
  {
    time: 510000, // 8:30
    text: "Look again at that dot. That's here. That's home. That's us.",
    key: 'narration-4'
  }
]

/**
 * Stillness moments (camera locks)
 */
export const STILLNESS_MOMENTS = [
  {
    time: 120000, // 2:00 (end of Ascent)
    duration: 30000 // 30 seconds
  },
  {
    time: 300000, // 5:00 (mid Contemplation)
    duration: 30000 // 30 seconds
  }
]
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS - All journeyConfig tests pass

**Step 5: Commit**

```bash
git add src/config/journeyConfig.js tests/config/journeyConfig.test.js
git commit -m "feat: define camera waypoints and phase configuration"
```

---

## Phase 5: Audio System Foundation

### Task 14: Create PsychoacousticAudio Manager (Test-First)

**Files:**
- Create: `src/core/PsychoacousticAudio.js`
- Create: `tests/core/PsychoacousticAudio.test.js`

**Step 1: Write the failing test**

```javascript
// tests/core/PsychoacousticAudio.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import PsychoacousticAudio from '@/core/PsychoacousticAudio.js'

describe('PsychoacousticAudio', () => {
  let audio

  beforeEach(() => {
    audio = new PsychoacousticAudio()
  })

  afterEach(() => {
    if (audio) {
      audio.dispose()
    }
  })

  it('should initialize Web Audio API context', () => {
    expect(audio.audioContext).toBeDefined()
    expect(audio.audioContext.state).toBe('suspended') // Suspended until user interaction
  })

  it('should create master gain node', () => {
    expect(audio.masterGain).toBeDefined()
  })

  it('should have createBinauralBeats method', () => {
    expect(typeof audio.createBinauralBeats).toBe('function')
  })

  it('should create binaural beats with correct frequency', () => {
    const beatFrequency = 10 // Alpha wave
    audio.createBinauralBeats(beatFrequency)

    expect(audio.binauralBeats).toBeDefined()
    expect(audio.binauralBeats.leftOscillator).toBeDefined()
    expect(audio.binauralBeats.rightOscillator).toBeDefined()
  })

  it('should have playNarration method', () => {
    expect(typeof audio.playNarration).toBe('function')
  })

  it('should have start and stop methods', () => {
    expect(typeof audio.start).toBe('function')
    expect(typeof audio.stop).toBe('function')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module '@/core/PsychoacousticAudio.js'"

**Step 3: Implement PsychoacousticAudio**

```javascript
// src/core/PsychoacousticAudio.js
export default class PsychoacousticAudio {
  constructor() {
    this.audioContext = null
    this.masterGain = null
    this.binauralBeats = null
    this.narrationQueue = []

    this.init()
  }

  init() {
    // Create Web Audio API context
    const AudioContext = window.AudioContext || window.webkitAudioContext
    this.audioContext = new AudioContext()

    // Create master gain
    this.masterGain = this.audioContext.createGain()
    this.masterGain.gain.value = 0.7
    this.masterGain.connect(this.audioContext.destination)
  }

  /**
   * Create binaural beats for alpha wave induction
   * @param {number} beatFrequency - Desired beat frequency (8-12 Hz for alpha)
   */
  createBinauralBeats(beatFrequency = 10) {
    const baseFrequency = 200 // Carrier frequency in Hz

    // Create two oscillators with slight frequency difference
    const leftOscillator = this.audioContext.createOscillator()
    const rightOscillator = this.audioContext.createOscillator()

    leftOscillator.frequency.value = baseFrequency
    rightOscillator.frequency.value = baseFrequency + beatFrequency

    // Create stereo channels
    const leftGain = this.audioContext.createGain()
    const rightGain = this.audioContext.createGain()

    // Very subtle volume (5% of master)
    leftGain.gain.value = 0.05
    rightGain.gain.value = 0.05

    // Create channel merger for stereo
    const merger = this.audioContext.createChannelMerger(2)

    // Connect left to left channel
    leftOscillator.connect(leftGain)
    leftGain.connect(merger, 0, 0)

    // Connect right to right channel
    rightOscillator.connect(rightGain)
    rightGain.connect(merger, 0, 1)

    // Connect to master
    merger.connect(this.masterGain)

    this.binauralBeats = {
      leftOscillator,
      rightOscillator,
      leftGain,
      rightGain
    }

    return this.binauralBeats
  }

  /**
   * Start all audio (must be called after user interaction)
   */
  async start() {
    // Resume audio context (required for browser autoplay policies)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }

    // Start binaural beats if created
    if (this.binauralBeats) {
      this.binauralBeats.leftOscillator.start()
      this.binauralBeats.rightOscillator.start()
    }
  }

  /**
   * Stop all audio
   */
  stop() {
    if (this.binauralBeats) {
      this.binauralBeats.leftOscillator.stop()
      this.binauralBeats.rightOscillator.stop()
    }
  }

  /**
   * Play narration text (placeholder - will use actual audio in production)
   * @param {string} text - Narration text
   */
  playNarration(text) {
    // For MVP: Just log the text (will be replaced with actual audio)
    console.log(`[NARRATION]: ${text}`)

    // TODO: Load and play actual audio file
    // const audio = new Audio(`/audio/${key}.mp3`)
    // audio.play()
  }

  /**
   * Clean up audio resources
   */
  dispose() {
    this.stop()

    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS - All PsychoacousticAudio tests pass

**Step 5: Commit**

```bash
git add src/core/PsychoacousticAudio.js tests/core/PsychoacousticAudio.test.js
git commit -m "feat: add PsychoacousticAudio with binaural beats generation"
```

---

## Phase 6: Reflection Screen

### Task 15: Create ReflectionScreen Component

**Files:**
- Create: `src/components/ReflectionScreen.vue`
- Create: `tests/components/ReflectionScreen.test.js`

**Step 1: Write the failing test**

```javascript
// tests/components/ReflectionScreen.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReflectionScreen from '@/components/ReflectionScreen.vue'

describe('ReflectionScreen', () => {
  it('should render three reflection prompts', () => {
    const wrapper = mount(ReflectionScreen)
    const textareas = wrapper.findAll('textarea')
    expect(textareas).toHaveLength(3)
  })

  it('should have "Skip" and "Save" buttons', () => {
    const wrapper = mount(ReflectionScreen)
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
  })

  it('should emit "skip" event when skip button clicked', async () => {
    const wrapper = mount(ReflectionScreen)
    await wrapper.find('.skip-button').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('skip')
  })

  it('should emit "save" event with data when save button clicked', async () => {
    const wrapper = mount(ReflectionScreen)

    const textareas = wrapper.findAll('textarea')
    await textareas[0].setValue('Surprised by the fragility')
    await textareas[1].setValue('Felt awe and wonder')

    await wrapper.find('.save-button').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('save')
    expect(wrapper.emitted('save')[0][0]).toHaveProperty('surprised')
    expect(wrapper.emitted('save')[0][0].surprised).toBe('Surprised by the fragility')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module '@/components/ReflectionScreen.vue'"

**Step 3: Implement ReflectionScreen**

```vue
<!-- src/components/ReflectionScreen.vue -->
<template>
  <div class="reflection-screen">
    <div class="reflection-content">
      <h2>What did you notice?</h2>

      <div class="reflection-prompts">
        <div class="prompt">
          <label>What surprised you?</label>
          <textarea
            v-model="reflections.surprised"
            placeholder="Optional..."
            rows="3"
          ></textarea>
        </div>

        <div class="prompt">
          <label>What did you feel?</label>
          <textarea
            v-model="reflections.felt"
            placeholder="Optional..."
            rows="3"
          ></textarea>
        </div>

        <div class="prompt">
          <label>What does this change for you?</label>
          <textarea
            v-model="reflections.change"
            placeholder="Optional..."
            rows="3"
          ></textarea>
        </div>
      </div>

      <div class="actions">
        <button class="skip-button" @click="handleSkip">
          Skip
        </button>
        <button class="save-button" @click="handleSave">
          Save My Reflections
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['skip', 'save'])

const reflections = ref({
  surprised: '',
  felt: '',
  change: ''
})

const handleSkip = () => {
  emit('skip')
}

const handleSave = () => {
  // Save to localStorage (privacy-first - never sent to server)
  const data = {
    timestamp: Date.now(),
    ...reflections.value
  }

  localStorage.setItem('godview-reflection', JSON.stringify(data))

  emit('save', data)
}
</script>

<style scoped>
.reflection-screen {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, #0a0a1a, #000000);
  color: #e0e0e0;
  animation: fadeIn 1.5s ease-in;
}

.reflection-content {
  max-width: 700px;
  padding: 2rem;
}

h2 {
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: 3rem;
  text-align: center;
}

.reflection-prompts {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3rem;
}

.prompt label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  opacity: 0.9;
}

.prompt textarea {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #e0e0e0;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.3s;
}

.prompt textarea:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.08);
}

.prompt textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

button {
  padding: 1rem 2.5rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.skip-button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.7);
}

.skip-button:hover {
  border-color: rgba(255, 255, 255, 0.5);
  color: rgba(255, 255, 255, 0.9);
}

.save-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
}

.save-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .reflection-content {
    padding: 1.5rem;
  }

  .actions {
    flex-direction: column;
  }

  button {
    width: 100%;
  }
}
</style>
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS - All ReflectionScreen tests pass

**Step 5: Commit**

```bash
git add src/components/ReflectionScreen.vue tests/components/ReflectionScreen.test.js
git commit -m "feat: add ReflectionScreen component for post-journey integration"
```

---

## Phase 7: Complete Integration & Testing

### Task 16: Wire Complete Journey Flow in App.vue

**Files:**
- Modify: `src/App.vue`
- Modify: `src/components/JourneyScene.vue`

**Step 1: Update JourneyScene to emit completion**

```vue
<!-- src/components/JourneyScene.vue - ADD to script -->
<script setup>
// ... existing imports ...

const emit = defineEmits(['journey-complete'])

// ... existing code ...

const initOrchestrator = () => {
  orchestrator = new JourneyOrchestrator()

  orchestrator.on('phase-change', (data) => {
    currentPhase.value = data.currentPhase
  })

  // NEW: Emit journey completion
  orchestrator.on('journey-complete', (data) => {
    console.log(`Journey complete! Duration: ${data.totalDuration}ms`)
    emit('journey-complete', data)
  })

  orchestrator.start()
  currentPhase.value = orchestrator.getCurrentPhase().name
}

// ... rest of code ...
</script>
```

**Step 2: Update App.vue with complete flow**

```vue
<!-- src/App.vue -->
<template>
  <div id="godview-app">
    <!-- Priming Screen -->
    <PrimingScreen
      v-if="currentScreen === 'priming'"
      @ready="startJourney"
    />

    <!-- Journey Scene -->
    <JourneyScene
      v-else-if="currentScreen === 'journey'"
      @journey-complete="handleJourneyComplete"
    />

    <!-- Reflection Screen -->
    <ReflectionScreen
      v-else-if="currentScreen === 'reflection'"
      @skip="handleReflectionComplete"
      @save="handleReflectionSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PrimingScreen from './components/PrimingScreen.vue'
import JourneyScene from './components/JourneyScene.vue'
import ReflectionScreen from './components/ReflectionScreen.vue'

const currentScreen = ref('priming')

onMounted(() => {
  // Check if user already completed journey
  const journeyCompleted = localStorage.getItem('godview-journey-completed')

  if (journeyCompleted) {
    console.log('Returning user - journey already completed')
    // For MVP: still show priming screen
    // Post-MVP: could skip to exploration mode
  }
})

const startJourney = () => {
  currentScreen.value = 'journey'
}

const handleJourneyComplete = (data) => {
  console.log('Journey completed, showing reflection screen')
  currentScreen.value = 'reflection'

  // Mark journey as completed
  localStorage.setItem('godview-journey-completed', 'true')
}

const handleReflectionComplete = () => {
  console.log('User skipped reflection')
  // For MVP: journey ends here
  // Post-MVP: transition to exploration mode
}

const handleReflectionSave = (reflectionData) => {
  console.log('User saved reflection:', reflectionData)
  // Reflection already saved to localStorage in ReflectionScreen
  // For MVP: journey ends here
  // Post-MVP: transition to exploration mode
}
</script>

<style>
#godview-app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
```

**Step 3: Manual integration test**

Run: `npm run dev`

Test Complete Flow:
1. Load app → See priming screen
2. Click "I'm Ready" → Journey starts
3. Verify "ASCENT" phase indicator appears
4. Fast-forward test: Modify phase durations to 5 seconds each in JourneyOrchestrator
5. Wait for all 4 phases to complete
6. Verify reflection screen appears
7. Fill in reflections, click "Save"
8. Check localStorage for saved data
9. Reload page → Verify priming screen still shows (MVP behavior)

Expected: Complete flow works end-to-end

**Step 4: Restore original phase durations**

```javascript
// src/core/JourneyOrchestrator.js
this.phases = [
  new JourneyPhase('Ascent', 120000),        // 2 minutes
  new JourneyPhase('Transition', 120000),    // 2 minutes
  new JourneyPhase('Contemplation', 180000), // 3 minutes
  new JourneyPhase('Integration', 180000)    // 3 minutes
]
```

**Step 5: Commit**

```bash
git add src/App.vue src/components/JourneyScene.vue
git commit -m "feat: wire complete journey flow from priming to reflection"
```

---

### Task 17: Create Deployment Documentation

**Files:**
- Create: `docs/DEPLOYMENT.md`
- Create: `.env.example`
- Update: `README.md`

**Step 1: Create deployment guide**

```markdown
<!-- docs/DEPLOYMENT.md -->
# GodViewActivation - Deployment Guide

## Ubuntu Linux Deployment with Node.js

### Prerequisites

- Ubuntu Server 20.04+ (or similar Linux distribution)
- Node.js 18+ and npm
- Nginx (for reverse proxy)
- PM2 (for process management)
- Domain name with DNS configured (optional but recommended for HTTPS)

---

## Step 1: Server Setup

### Install Node.js 18+

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Install Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Step 2: Deploy Application

### Clone Repository

```bash
# Create directory for app
sudo mkdir -p /var/www/godview
sudo chown $USER:$USER /var/www/godview

# Clone repository
cd /var/www
git clone https://github.com/yourusername/GodViewActivation.git godview
cd godview
```

### Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Build Production Assets

```bash
npm run build
```

This creates optimized files in `dist/` directory.

### Configure Environment Variables

```bash
# Create .env file in project root
cp .env.example .env
nano .env
```

```env
PORT=3000
NODE_ENV=production
```

---

## Step 3: Start Application with PM2

```bash
# Start server with PM2
pm2 start server/index.js --name godview

# Save PM2 process list
pm2 save

# Configure PM2 to start on system boot
pm2 startup
# Follow the instructions shown
```

### PM2 Useful Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs godview

# Restart app
pm2 restart godview

# Stop app
pm2 stop godview

# Monitor resources
pm2 monit
```

---

## Step 4: Configure Nginx Reverse Proxy

### Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/godview
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable Site and Restart Nginx

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/godview /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 5: SSL/HTTPS with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts to:
# - Enter email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)

# Verify auto-renewal
sudo certbot renew --dry-run
```

Certbot will automatically update Nginx config with SSL settings.

---

## Step 6: Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 7: Verify Deployment

1. Visit `http://your-domain.com` (or `https://` if SSL configured)
2. Verify priming screen loads
3. Complete journey to test full flow
4. Check PM2 logs for errors: `pm2 logs godview`
5. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

---

## Updating the Application

```bash
# Navigate to project directory
cd /var/www/godview

# Pull latest changes
git pull origin main

# Rebuild
npm run build

# Restart with PM2
pm2 restart godview
```

---

## Monitoring & Maintenance

### System Resource Monitoring

```bash
# CPU, Memory, Disk usage
htop

# Disk space
df -h

# PM2 monitoring
pm2 monit
```

### Log Management

```bash
# Application logs (PM2)
pm2 logs godview --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PM2 log rotation (automatic)
pm2 install pm2-logrotate
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs godview

# Common issues:
# - Port already in use: Change PORT in .env
# - Missing dependencies: Run npm install
# - Permission issues: Check file ownership
```

### Nginx 502 Bad Gateway

```bash
# Verify app is running
pm2 status

# Check if port matches in:
# - .env (PORT=3000)
# - Nginx config (proxy_pass http://localhost:3000)

# Restart both
pm2 restart godview
sudo systemctl restart nginx
```

### High Memory Usage

```bash
# Check memory
free -h

# Restart application
pm2 restart godview

# Limit PM2 instances if needed
pm2 delete godview
pm2 start server/index.js --name godview --max-memory-restart 500M
```

---

## Security Checklist

- [ ] SSL/HTTPS configured (Let's Encrypt)
- [ ] Firewall enabled (UFW)
- [ ] SSH key-based authentication (disable password login)
- [ ] Regular system updates: `sudo apt update && sudo apt upgrade`
- [ ] PM2 running as non-root user
- [ ] Environment variables secured in .env (not in git)
- [ ] Nginx security headers enabled (CSP, HSTS)
- [ ] Regular backups configured

---

## Performance Optimization

### Enable Nginx Caching

```nginx
# Add to Nginx server block
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=godview_cache:10m max_size=1g inactive=60m;
proxy_cache godview_cache;
proxy_cache_valid 200 1h;
```

### PM2 Cluster Mode (Multi-Core)

```bash
# Stop current instance
pm2 delete godview

# Start in cluster mode
pm2 start server/index.js --name godview -i max

# 'max' uses all CPU cores
```

---

**Deployment Status:** Ready for production
**Last Updated:** January 2, 2026
```

**Step 2: Update README.md with deployment info**

```markdown
<!-- Add to README.md after "Quick Start" section -->

## Deployment

### Ubuntu Linux Deployment

For detailed deployment instructions to Ubuntu server with Node.js, Nginx, and SSL, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

**Quick Deployment:**

```bash
# Build production assets
npm run build

# Start server
npm run server:prod

# Access at http://localhost:3000
```

For production, use PM2 and Nginx as described in deployment guide.
```

**Step 3: Commit**

```bash
git add docs/DEPLOYMENT.md README.md .env.example
git commit -m "docs: add Ubuntu deployment guide with Node.js and Nginx"
```

---

## Final Step: Update Project Documentation

### Task 18: Update Technical Documents

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`

**Step 1: Update README.md technology stack**

```markdown
<!-- README.md - Update "Technology Stack" section -->

## Technology Stack

**Frontend:**
- Vue.js 3 (Composition API)
- Three.js (3D rendering, camera, geometry)
- Vite (build tooling and development server)
- Web Audio API (binaural beats, spatial audio)

**Backend:**
- Node.js with Express.js
- Compression and security middleware (helmet, compression)

**Testing:**
- Vitest (unit and integration testing)
- @vue/test-utils (Vue component testing)

**Deployment:**
- Ubuntu Linux with Node.js server
- Nginx reverse proxy
- PM2 process manager
- HTTPS required (for WebXR API compatibility)

**No Database Required:**
- Fully client-side application
- localStorage for user data (privacy-preserving)
```

**Step 2: Update CLAUDE.md**

```markdown
<!-- CLAUDE.md - Update "Technology Stack" section -->

## Technology Stack

- **Frontend**: Vue.js 3 (Composition API), Three.js, Vite
- **Backend**: Node.js, Express.js (static file server)
- **Testing**: Vitest, @vue/test-utils
- **Deployment**: Ubuntu Linux, Node.js server, Nginx reverse proxy, PM2
```

**Step 3: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: update technology stack to reflect Vue.js + Node.js architecture"
```

---

## Plan Summary

**Total Implementation Time Estimate:** 8-12 weeks for MVP

**Phase Breakdown:**
1. ✅ **Project Setup** (1-2 days): Vue.js, Vite, Express, testing infrastructure
2. ✅ **Priming Screen** (1 day): Component with tests
3. ✅ **Three.js Foundation** (2-3 days): Scene, Earth model, lighting
4. ✅ **Journey System** (3-4 days): Orchestrator, phases, camera controller
5. ✅ **Audio System** (2-3 days): Binaural beats, narration placeholders
6. ✅ **Reflection Screen** (1 day): Post-journey integration
7. ✅ **Integration** (2-3 days): Complete flow, deployment docs

**What's NOT in MVP:**
- ❌ VR mode (WebXR)
- ❌ Exploration mode (free camera)
- ❌ Actual recorded narration (using text placeholders)
- ❌ NASA 8K textures (using generated placeholders)
- ❌ Advanced analytics

**Next Steps After MVP:**
1. Source and integrate NASA 8K Earth textures
2. Record professional narration
3. Implement camera animation for all 4 phases
4. Add atmosphere shader for awe effect
5. Integrate audio synchronization with journey phases
6. User testing for awe effectiveness (60%+ target)
7. Performance optimization (60 FPS desktop, 30 FPS mobile)

---

## Execution Options

Plan complete and saved to `docs/plans/2026-01-02-godview-mvp-implementation.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach would you prefer?**
