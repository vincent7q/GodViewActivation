# Technical Design Document
## GodViewActivation - Overview Effect Activation Platform

**Version:** 1.0
**Date:** January 2, 2026
**Primary Goal:** Reliably trigger the Overview Effect (cognitive shift) through web-based Earth-from-space experience

---

## 1. Executive Summary

### 1.1 Purpose

This document describes the technical architecture for GodViewActivation, a web-based psychological intervention platform designed to trigger the Overview Effect—a profound cognitive shift characterized by awe, interconnectedness, and environmental responsibility experienced when viewing Earth from space.

**Primary Design Lens:** Every technical decision is evaluated against the question: "Does this increase the likelihood of triggering the Overview Effect?"

### 1.2 Core Principle

Unlike a space simulator focused on exploration, this is a **psychological journey delivery system** that uses technology to create conditions for consciousness transformation.

### 1.3 Evidence-Based Design

Research on awe experiences and the Overview Effect indicates:
- **Minimum duration**: 4-7 minutes needed for cognitive shift (Keltner & Haidt, 2003)
- **Slow movement**: More effective than rapid motion for awe induction
- **Vastness + accommodation**: Must present something larger than current mental schemas
- **Reduced agency**: Surrendering control enhances awe (Allen et al., 2018)
- **Silence**: Processing time essential for integration

---

## 2. System Architecture

### 2.1 Architectural Philosophy

**Journey-Centric Architecture**: The system is structured around orchestrating a carefully timed psychological journey, not a free-form exploration platform.

**Three-Layer Architecture:**

```
┌─────────────────────────────────────────┐
│     Journey Orchestration Layer         │
│  (Controls psychological journey flow)  │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   Awe Activation Layer                  │
│  (Visuals, Audio, Timing, Stillness)    │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   Technical Foundation Layer            │
│  (Three.js, WebXR, Audio, Rendering)    │
└─────────────────────────────────────────┘
```

### 2.2 Core Modules

**Primary Modules (MVP):**
1. **JourneyOrchestrator**: Controls the 4-phase guided experience
2. **AweEngine**: Visual rendering optimized for awe triggers
3. **PsychoacousticAudio**: Binaural beats, strategic silence, narration
4. **StillnessController**: Manages mandatory contemplation moments
5. **MeasurementTracker**: Captures engagement and effectiveness metrics

**Secondary Modules (Post-MVP):**
6. **ExplorationMode**: Free movement after initial journey
7. **VRManager**: WebXR integration for deeper immersion
8. **ReflectionInterface**: Post-journey integration prompts

---

## 3. Journey Orchestration System

### 3.1 The Four-Phase Journey

The JourneyOrchestrator module controls a mandatory 7-10 minute first-time experience:

**Phase 1: Ascent (0-2 minutes)**
- Purpose: Build anticipation, establish connection to Earth
- Technical: Smooth camera animation from surface → low orbit
- Visual: Horizon gradually curves, atmosphere thins, borders disappear
- Audio: Rising ambient tones, binaural alpha waves begin (8-12 Hz)
- Camera: Locked (no user control), speed: 500m/s increasing to 2000m/s

**Phase 2: Transition (2-4 minutes)**
- Purpose: First moment of seeing Earth as whole object
- Technical: Camera breaks into space, moment of silence (3-second pause)
- Visual: Earth becomes spherical object in void, emphasis on fragile atmosphere
- Audio: Brief silence (3s), then single sustained note
- Camera: Locked, slow automatic rotation to show Earth as complete sphere

**Phase 3: Contemplation (4-7 minutes)**
- Purpose: Deep awe induction, borderless interconnection
- Technical: Orbital rotation around Earth at optimal distance (35,000 km)
- Visual: Day/night cycle visible, weather patterns, no political borders, golden hour lighting
- Audio: Astronaut narration (3 quotes, 30s apart), binaural beats continue
- Camera: Locked orbital path, 0.5 RPM rotation (120s per orbit)
- Stillness: 30-second complete pause at 5:00 mark

**Phase 4: Integration (7-10 minutes)**
- Purpose: Cosmic context, return preparation
- Technical: Zoom out to show Earth small in space, return to close orbit
- Visual: "Pale blue dot" moment, then return to closer view
- Audio: Final quote, music fades to silence
- Camera: Controlled zoom out/in, then unlock controls with subtle notification

### 3.2 Technical Implementation

**JourneyOrchestrator Class:**
```javascript
class JourneyOrchestrator {
  constructor(sceneManager, audioEngine, cameraController) {
    this.phases = [
      new AscentPhase(120000), // 2 min
      new TransitionPhase(120000), // 2 min
      new ContemplationPhase(180000), // 3 min
      new IntegrationPhase(180000) // 3 min
    ];
    this.currentPhase = 0;
    this.startTime = null;
    this.userCompletedJourney = localStorage.getItem('journeyCompleted');
  }

  start() {
    if (this.userCompletedJourney) {
      this.enterExplorationMode();
    } else {
      this.showPrimingScreen();
    }
  }

  showPrimingScreen() {
    // Display psychological priming message
    // Wait for user readiness signal
    // Begin Phase 1
  }

  update(deltaTime) {
    const currentPhase = this.phases[this.currentPhase];
    currentPhase.update(deltaTime);

    if (currentPhase.isComplete()) {
      this.transitionToNextPhase();
    }
  }

  transitionToNextPhase() {
    this.currentPhase++;
    if (this.currentPhase >= this.phases.length) {
      this.completeJourney();
    }
  }

  completeJourney() {
    localStorage.setItem('journeyCompleted', 'true');
    this.showReflectionScreen();
  }
}
```

**Phase Base Class:**
```javascript
class JourneyPhase {
  constructor(duration) {
    this.duration = duration;
    this.elapsed = 0;
    this.camera = null;
    this.audio = null;
  }

  enter() {
    // Setup phase-specific camera path
    // Trigger audio cues
    // Configure visual settings
  }

  update(deltaTime) {
    this.elapsed += deltaTime;
    this.updateCamera(this.elapsed / this.duration);
    this.updateAudio(this.elapsed / this.duration);
  }

  isComplete() {
    return this.elapsed >= this.duration;
  }

  exit() {
    // Cleanup
  }
}
```

### 3.3 Camera Path System

**Spline-Based Camera Animation:**
- Use `THREE.CatmullRomCurve3` for smooth camera paths
- Predefined waypoints for each phase
- Easing functions for natural acceleration/deceleration
- Look-at target always points toward Earth center

**Key Positions:**
```javascript
const JOURNEY_WAYPOINTS = {
  SURFACE: new THREE.Vector3(0, 6371000, 0), // Earth surface
  LOW_ORBIT: new THREE.Vector3(0, 6371000 + 400000, 0), // 400km
  TRANSITION: new THREE.Vector3(0, 6371000 + 2000000, 0), // 2000km
  CONTEMPLATION: new THREE.Vector3(35000000, 0, 0), // Geostationary orbit distance
  COSMIC: new THREE.Vector3(150000000, 0, 0), // Pale blue dot view
};
```

### 3.4 Stillness Controller

**Purpose:** Enforce mandatory contemplation moments where user cannot control camera

```javascript
class StillnessController {
  constructor(camera) {
    this.camera = camera;
    this.isLocked = false;
    this.stillnessMoments = [
      { time: 120000, duration: 30000 }, // 2:00 - 2:30
      { time: 300000, duration: 30000 }, // 5:00 - 5:30
    ];
  }

  update(journeyTime) {
    for (let moment of this.stillnessMoments) {
      if (journeyTime >= moment.time &&
          journeyTime < moment.time + moment.duration) {
        this.lock();
        this.showStillnessUI();
        return;
      }
    }
    this.unlock();
  }

  lock() {
    this.isLocked = true;
    // Disable all input handlers
    // Show subtle UI: "Allow yourself to simply observe"
  }

  unlock() {
    this.isLocked = false;
  }
}
```

---

## 4. Awe Engine - Visual Rendering System

### 4.1 Design Philosophy

**Awe Triggers in Visual Design:**
1. **Vastness**: Earth must feel overwhelmingly large yet comprehensible as whole
2. **Fragility**: Thin atmosphere line, delicate appearance against black void
3. **Beauty**: Golden hour lighting, perfect blue marble appearance
4. **Borderlessness**: No political boundaries, only natural features
5. **Living System**: Animated clouds, weather, city lights (Earth as organism)

### 4.2 Earth Rendering

**Three-Layer Earth Model:**

```javascript
class EarthModel {
  constructor() {
    // Layer 1: Solid Earth
    this.earthGeometry = new THREE.SphereGeometry(6371, 128, 128);
    this.earthMaterial = new THREE.MeshPhongMaterial({
      map: this.loadTexture('earth-day-8k.jpg'),
      bumpMap: this.loadTexture('earth-topology-8k.jpg'),
      bumpScale: 50,
      specularMap: this.loadTexture('earth-specular-2k.jpg'),
      specular: new THREE.Color(0x333333)
    });

    // Layer 2: Clouds (animated)
    this.cloudsGeometry = new THREE.SphereGeometry(6371.05, 128, 128);
    this.cloudsMaterial = new THREE.MeshPhongMaterial({
      map: this.loadTexture('earth-clouds-2k.png'),
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    });

    // Layer 3: Atmosphere Glow (awe trigger)
    this.atmosphereGeometry = new THREE.SphereGeometry(6371.1, 64, 64);
    this.atmosphereMaterial = this.createAtmosphereShader();
  }

  createAtmosphereShader() {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
  }
}
```

### 4.3 Lighting for Awe

**Golden Hour Lighting:**
- Sun positioned to create dramatic atmospheric glow
- Color temperature: 3500K (warm, awe-inducing)
- Intensity adjusted to emphasize thin atmosphere line

```javascript
class AweOptimizedLighting {
  constructor(scene) {
    // Primary sun light (golden hour)
    this.sunLight = new THREE.DirectionalLight(0xffd580, 1.5);
    this.sunLight.position.set(1, 0.3, 0.5).normalize();

    // Ambient light (slight blue for space)
    this.ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);

    // Rim light to emphasize Earth's edge (fragility trigger)
    this.rimLight = new THREE.DirectionalLight(0x8ba6ff, 0.4);
    this.rimLight.position.set(-1, 0, -0.5).normalize();

    scene.add(this.sunLight, this.ambientLight, this.rimLight);
  }
}
```

### 4.4 Starfield - Cosmic Context

**Procedural Starfield:**
```javascript
class StarField {
  constructor() {
    const starCount = 10000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // Distribute on sphere surface
      const radius = 5000000000; // 5 billion km
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Slight color variation (white to blue-white)
      colors[i * 3] = 0.8 + Math.random() * 0.2;
      colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
      colors[i * 3 + 2] = 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    this.stars = new THREE.Points(geometry, material);
  }
}
```

### 4.5 The Pale Blue Dot Moment

**Technical Implementation:**
```javascript
class PaleBlueDotMoment extends JourneyPhase {
  enter() {
    // Slowly zoom camera out to 150 million km
    this.targetDistance = 150000000;
    this.startDistance = this.camera.position.length();

    // Reduce Earth size perception
    // Add subtle UI text: "A pale blue dot, suspended in a sunbeam"
  }

  update(deltaTime) {
    super.update(deltaTime);
    const t = this.elapsed / this.duration;

    // Exponential zoom out
    const distance = this.startDistance +
      (this.targetDistance - this.startDistance) * Math.pow(t, 2);

    this.camera.position.setLength(distance);

    // At 80% through zoom, trigger narration
    if (t > 0.8 && !this.narrationTriggered) {
      this.audio.playNarration('pale-blue-dot');
      this.narrationTriggered = true;
    }
  }
}
```

---

## 5. Psychoacoustic Audio System

### 5.1 Three-Layer Audio Architecture

**Layer 1: Binaural Beats (Subconscious)**
- Alpha wave frequency (8-12 Hz) for meditative state
- Continuous throughout journey
- Subtle, barely perceptible

**Layer 2: Ambient Soundscape (Environmental)**
- Space "silence" (very low-frequency hum)
- Strategic sound events (phase transitions)
- Musical elements (minimal, ethereal)

**Layer 3: Narration (Cognitive)**
- Astronaut quotes at precise moments
- Timed to reinforce visual awe triggers
- Optional subtitles for accessibility

### 5.2 Technical Implementation

```javascript
class PsychoacousticAudio {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);

    this.binauralBeats = this.createBinauralBeats();
    this.ambientLayer = this.createAmbientLayer();
    this.narrationLayer = this.createNarrationLayer();
  }

  createBinauralBeats() {
    // Create two oscillators with slight frequency difference
    const leftOscillator = this.audioContext.createOscillator();
    const rightOscillator = this.audioContext.createOscillator();

    const baseFrequency = 200; // Carrier frequency
    const beatFrequency = 10; // Alpha wave (10 Hz)

    leftOscillator.frequency.value = baseFrequency;
    rightOscillator.frequency.value = baseFrequency + beatFrequency;

    // Create stereo panner
    const leftGain = this.audioContext.createGain();
    const rightGain = this.audioContext.createGain();
    leftGain.gain.value = 0.05; // Very subtle
    rightGain.gain.value = 0.05;

    const merger = this.audioContext.createChannelMerger(2);

    leftOscillator.connect(leftGain).connect(merger, 0, 0);
    rightOscillator.connect(rightGain).connect(merger, 0, 1);
    merger.connect(this.masterGain);

    leftOscillator.start();
    rightOscillator.start();

    return { left: leftOscillator, right: rightOscillator };
  }

  createAmbientLayer() {
    const ambientGain = this.audioContext.createGain();
    ambientGain.gain.value = 0.3;
    ambientGain.connect(this.masterGain);

    return {
      gain: ambientGain,
      currentTrack: null
    };
  }

  createNarrationLayer() {
    const narrationGain = this.audioContext.createGain();
    narrationGain.gain.value = 0.7;
    narrationGain.connect(this.masterGain);

    return {
      gain: narrationGain,
      queue: []
    };
  }

  playNarration(key) {
    const narrations = {
      'first-view': {
        text: "The Earth is a fragile oasis in the vastness of space.",
        audio: 'narration-1.mp3',
        duration: 8000
      },
      'no-borders': {
        text: "There are no borders or boundaries on our planet except those we create in our minds.",
        audio: 'narration-2.mp3',
        duration: 10000
      },
      'pale-blue-dot': {
        text: "Look again at that dot. That's here. That's home. That's us.",
        audio: 'narration-3.mp3',
        duration: 12000
      }
    };

    const narration = narrations[key];
    this.loadAndPlayAudio(narration.audio, this.narrationLayer.gain);
    this.showSubtitle(narration.text, narration.duration);
  }

  createSilenceMoment(duration) {
    // Fade out all audio except binaural beats
    this.ambientLayer.gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 2
    );

    setTimeout(() => {
      this.ambientLayer.gain.gain.exponentialRampToValueAtTime(
        0.3,
        this.audioContext.currentTime + 2
      );
    }, duration);
  }
}
```

### 5.3 Narration Script & Timing

**Curated Astronaut Quotes:**

| Time | Phase | Quote | Source |
|------|-------|-------|--------|
| 2:30 | Transition | "The Earth is a fragile oasis in the vastness of space." | NASA Astronaut |
| 4:00 | Contemplation | "There are no borders or boundaries except those we create in our minds." | Sultan bin Salman Al Saud |
| 6:00 | Contemplation | "We are all astronauts on Spaceship Earth." | Buckminster Fuller |
| 8:30 | Integration | "Look again at that dot. That's here. That's home. That's us." | Carl Sagan |

---

## 6. User Interface - Minimal & Reverent

### 6.1 Design Philosophy

**Less is More**: UI should enhance, not distract from the experience. Prioritize invisibility over feature richness.

### 6.2 Priming Screen

**Pre-Journey Interface:**
```html
<div class="priming-screen">
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

  <button class="begin-journey" aria-label="Begin the journey">
    I'm Ready
  </button>
</div>
```

**CSS Styling:**
```css
.priming-screen {
  background: linear-gradient(to bottom, #000000, #0a0a1a);
  color: #e0e0e0;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  text-align: center;
  padding: 20vh 10vw;
  animation: fadeIn 2s ease-in;
}

.priming-text {
  font-size: 1.2rem;
  line-height: 1.8;
  max-width: 600px;
  margin: 2rem auto;
  opacity: 0.9;
}

.begin-journey {
  margin-top: 3rem;
  padding: 1rem 3rem;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.begin-journey:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}
```

### 6.3 Journey HUD

**During Journey - Minimal Overlay:**
```javascript
class JourneyHUD {
  constructor() {
    this.elements = {
      phaseIndicator: document.getElementById('phase-indicator'),
      stillnessPrompt: document.getElementById('stillness-prompt'),
      subtitles: document.getElementById('subtitles')
    };
  }

  showPhase(phaseName) {
    // Subtle text at top: "Ascent" / "Contemplation" etc.
    this.elements.phaseIndicator.textContent = phaseName;
    this.elements.phaseIndicator.classList.add('fade-in');

    setTimeout(() => {
      this.elements.phaseIndicator.classList.remove('fade-in');
      this.elements.phaseIndicator.classList.add('fade-out');
    }, 3000);
  }

  showStillnessPrompt() {
    // During locked camera moments
    this.elements.stillnessPrompt.textContent =
      "Allow yourself to simply observe...";
    this.elements.stillnessPrompt.style.opacity = 1;
  }

  hideStillnessPrompt() {
    this.elements.stillnessPrompt.style.opacity = 0;
  }

  showSubtitle(text, duration) {
    this.elements.subtitles.textContent = text;
    this.elements.subtitles.style.opacity = 1;

    setTimeout(() => {
      this.elements.subtitles.style.opacity = 0;
    }, duration);
  }
}
```

### 6.4 Reflection Screen

**Post-Journey Interface:**
```html
<div class="reflection-screen">
  <h2>What did you notice?</h2>

  <div class="reflection-prompts">
    <div class="prompt">
      <label>What surprised you?</label>
      <textarea placeholder="Optional..." rows="3"></textarea>
    </div>

    <div class="prompt">
      <label>What did you feel?</label>
      <textarea placeholder="Optional..." rows="3"></textarea>
    </div>

    <div class="prompt">
      <label>What does this change for you?</label>
      <textarea placeholder="Optional..." rows="3"></textarea>
    </div>
  </div>

  <div class="actions">
    <button class="skip">Continue to Exploration</button>
    <button class="save-reflection">Save My Reflections</button>
  </div>
</div>
```

**Data Handling:**
```javascript
class ReflectionInterface {
  saveReflection(data) {
    // Store locally only (privacy-first)
    const reflection = {
      timestamp: Date.now(),
      responses: data,
      journeyCompleted: true
    };

    localStorage.setItem('godview-reflection', JSON.stringify(reflection));

    // Optional: Anonymous analytics (opt-in only)
    if (userConsent) {
      this.sendAnonymousMetrics({
        completedJourney: true,
        reflectionProvided: data.length > 0
      });
    }
  }
}
```

---

## 7. Measurement & Analytics

### 7.1 Effectiveness Metrics

**Primary Success Metric:** Percentage of users reporting Overview Effect

**Measurement Approach:**
```javascript
class EffectivenessTracker {
  constructor() {
    this.metrics = {
      journeyStarted: false,
      journeyCompleted: false,
      completionTime: null,
      stillnessMomentsObserved: 0,
      reflectionProvided: false,
      returnVisits: 0
    };
  }

  trackJourneyStart() {
    this.metrics.journeyStarted = true;
    this.metrics.startTime = Date.now();
  }

  trackStillnessMoment(momentId) {
    this.metrics.stillnessMomentsObserved++;
  }

  trackJourneyComplete() {
    this.metrics.journeyCompleted = true;
    this.metrics.completionTime = Date.now() - this.metrics.startTime;

    // Send anonymous metric
    this.sendMetric({
      event: 'journey_completed',
      duration: this.metrics.completionTime,
      stillnessMoments: this.metrics.stillnessMomentsObserved
    });
  }

  trackReflection(responses) {
    this.metrics.reflectionProvided = responses.length > 0;

    // Analyze sentiment (client-side only)
    const sentimentScore = this.analyzeSentiment(responses);

    this.sendMetric({
      event: 'reflection_completed',
      provided: this.metrics.reflectionProvided,
      positiveIndicators: sentimentScore
    });
  }

  analyzeSentiment(text) {
    // Simple keyword analysis for awe indicators
    const aweKeywords = [
      'beautiful', 'awe', 'amazing', 'profound', 'connected',
      'perspective', 'fragile', 'wonder', 'humbling', 'overwhelming'
    ];

    let score = 0;
    aweKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) score++;
    });

    return score;
  }
}
```

### 7.2 Performance Metrics

**Technical Performance Tracking:**
- FPS monitoring (target: 60 FPS)
- Asset load times
- Memory usage
- Journey completion rate
- Browser/device distribution

### 7.3 Privacy-First Analytics

**Data Collection Principles:**
- No personally identifiable information
- All metrics anonymous
- Opt-in only for any tracking
- Client-side sentiment analysis only
- Clear disclosure of what's measured

---

## 8. Input & Control System

### 8.1 Journey Mode (MVP)

**During Guided Journey:**
- **No user control** of camera (locked path)
- **Allowed actions:**
  - Pause/resume journey (ESC key)
  - Adjust audio volume
  - Toggle subtitles
  - Exit experience (with confirmation)

### 8.2 Exploration Mode (Post-Journey)

**After completing initial journey:**
- Unlock mouse/keyboard controls
- Same control scheme as originally planned (WASD, mouse drag, etc.)
- Add "Restart Journey" option
- Include meditation mode (slow, automated flight)

```javascript
class InputManager {
  constructor(journeyOrchestrator) {
    this.journeyActive = true;
    this.orchestrator = journeyOrchestrator;

    // Listen for journey completion
    this.orchestrator.on('journey:complete', () => {
      this.unlockControls();
    });
  }

  unlockControls() {
    this.journeyActive = false;
    this.enableMouseControls();
    this.enableKeyboardControls();
    this.showControlsHint();
  }

  handleInput(event) {
    if (this.journeyActive) {
      // Only allow pause/volume/exit during journey
      if (event.key === 'Escape') {
        this.pauseJourney();
      }
      return; // Block all other inputs
    }

    // Full control in exploration mode
    this.processExplorationInput(event);
  }
}
```

---

## 9. Technical Stack & Dependencies

### 9.1 Core Technologies

**Required:**
- **Three.js** (r150+): 3D rendering, camera, geometry
- **Web Audio API**: Psychoacoustic audio, binaural beats
- **Vanilla JavaScript/TypeScript**: Core application logic
- **HTML5/CSS3**: UI, responsive design

**Optional (Post-MVP):**
- **WebXR API**: VR mode support
- **Tone.js**: Advanced audio synthesis (if Web Audio API insufficient)

### 9.2 Asset Requirements

**Textures:**
- Earth day texture: 8K (NASA Blue Marble)
- Earth night texture: 8K (city lights)
- Earth clouds: 4K with alpha
- Earth topology/bump: 4K
- Earth specular: 2K

**Audio:**
- Binaural beats: Generated via code
- Ambient soundscape: 3-5 minute loop, royalty-free
- Narration: 4 clips, professional voice recording
- Background music: Optional, minimal, ethereal

**3D Models (Optional):**
- Moon sphere (4K texture)
- Sun glow effect

### 9.3 Browser Compatibility

**Target Support:**
- Chrome 90+ (primary)
- Firefox 90+
- Safari 15+
- Edge 90+

**Fallback Strategy:**
- WebGL detection → Canvas 2D fallback
- Web Audio API → HTML5 audio fallback
- Modern JavaScript → Babel transpilation for older browsers

---

## 10. Performance Optimization

### 10.1 Performance Targets

| Metric | Desktop | Mobile |
|--------|---------|--------|
| FPS | 60 | 30+ |
| Load Time | <3s | <5s |
| Memory | <500MB | <200MB |
| Journey Smoothness | 0 dropped frames | Minimal drops acceptable |

### 10.2 Optimization Strategies

**Progressive Loading:**
```javascript
class AssetLoader {
  async loadCriticalAssets() {
    // Phase 1: Minimum viable scene (2s load target)
    await Promise.all([
      this.loadTexture('earth-low-res-1k.jpg'),
      this.loadAudio('ambient-base.mp3'),
      this.initializeRenderer()
    ]);

    // Show scene, begin journey
    this.startJourney();

    // Phase 2: High-res assets (background loading)
    this.loadHighResAssets();
  }

  async loadHighResAssets() {
    const highResTextures = [
      this.loadTexture('earth-day-8k.jpg'),
      this.loadTexture('earth-night-8k.jpg'),
      this.loadTexture('earth-clouds-4k.png')
    ];

    for (let texturePromise of highResTextures) {
      const texture = await texturePromise;
      this.swapTexture(texture);
    }
  }
}
```

**Level of Detail (LOD):**
- Earth geometry: 128 segments desktop, 64 segments mobile
- Texture resolution: 8K desktop, 4K tablet, 2K mobile
- Starfield density: 10,000 stars desktop, 5,000 mobile

**Memory Management:**
```javascript
class ResourceManager {
  disposeUnusedAssets() {
    // After journey completes and user in exploration mode
    // Dispose of unused high-res textures if memory constrained

    if (this.getMemoryUsage() > this.memoryThreshold) {
      this.downgradeTextures();
    }
  }

  downgradeTextures() {
    // Swap 8K → 4K if needed
    this.earthMaterial.map = this.earthTexture4K;
    this.earthTexture8K.dispose();
  }
}
```

---

## 11. Error Handling & Graceful Degradation

### 11.1 Critical Failure Scenarios

**WebGL Unavailable:**
```javascript
class Renderer {
  initialize() {
    if (!this.detectWebGL()) {
      this.showFallbackMessage();
      this.initializeCanvasFallback();
    }
  }

  detectWebGL() {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  }

  showFallbackMessage() {
    alert('Your browser doesn\'t support 3D graphics. Showing simplified experience.');
  }

  initializeCanvasFallback() {
    // 2D canvas with pre-rendered Earth rotation sprite sheets
    // Limited experience but still conveys core message
  }
}
```

**Asset Loading Failure:**
```javascript
class AssetLoader {
  async loadTexture(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.fetchTexture(url);
      } catch (error) {
        if (i === retries - 1) {
          console.error(`Failed to load ${url} after ${retries} attempts`);
          return this.getPlaceholderTexture();
        }
        await this.delay(1000 * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
}
```

**Low Performance Auto-Downgrade:**
```javascript
class PerformanceMonitor {
  constructor() {
    this.fpsHistory = [];
    this.checkInterval = 5000; // Check every 5 seconds
  }

  update(fps) {
    this.fpsHistory.push(fps);

    if (this.fpsHistory.length > 10) {
      const avgFPS = this.fpsHistory.reduce((a, b) => a + b) / this.fpsHistory.length;

      if (avgFPS < 30) {
        this.autoDowngrade();
      }

      this.fpsHistory = [];
    }
  }

  autoDowngrade() {
    console.log('Performance degraded, reducing quality');
    this.reduceTextureResolution();
    this.reduceGeometryDetail();
    this.disablePostProcessing();
  }
}
```

---

## 12. Testing Strategy

### 12.1 Automated Testing

**Unit Tests (Jest):**
```javascript
describe('JourneyOrchestrator', () => {
  test('should start with priming screen for first-time users', () => {
    localStorage.removeItem('journeyCompleted');
    const orchestrator = new JourneyOrchestrator();
    expect(orchestrator.shouldShowPriming()).toBe(true);
  });

  test('should skip to exploration mode for returning users', () => {
    localStorage.setItem('journeyCompleted', 'true');
    const orchestrator = new JourneyOrchestrator();
    expect(orchestrator.shouldShowPriming()).toBe(false);
  });

  test('should progress through all 4 phases in correct order', () => {
    const orchestrator = new JourneyOrchestrator();
    expect(orchestrator.phases.length).toBe(4);
    expect(orchestrator.phases[0].name).toBe('Ascent');
  });
});
```

**Integration Tests (Playwright):**
- Complete journey flow (start → 4 phases → reflection)
- Audio playback at correct times
- Camera path smoothness
- UI state transitions

### 12.2 Manual Testing

**Psychological Effectiveness Testing:**
- User interviews (n=20 minimum)
- Pre/post questionnaire measuring awe, connectedness
- Think-aloud protocol during experience
- Physiological measures (optional): heart rate variability, skin conductance

**Cross-Browser Testing:**
- Visual consistency across Chrome, Firefox, Safari, Edge
- Audio synchronization accuracy
- Performance benchmarks on different devices

**Accessibility Testing:**
- Keyboard navigation
- Screen reader compatibility (for UI, not 3D scene)
- Subtitle readability
- Color contrast (WCAG AA)

---

## 13. Deployment Architecture

### 13.1 Static Hosting

**Recommended Platforms:**
- **Vercel** (preferred): Automatic HTTPS, global CDN, preview deployments
- **Netlify**: Similar features, easy setup
- **GitHub Pages**: Free, simple, HTTPS included

**Build Process:**
```bash
# package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "deploy": "vite build && vercel --prod"
  }
}
```

### 13.2 CDN Strategy

**Asset Distribution:**
- Static assets (textures, audio) served from CDN
- Code bundles from hosting platform CDN
- Geographic distribution for global users

**Cache Headers:**
```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 13.3 Monitoring

**Error Tracking:**
- Sentry for JavaScript errors
- Custom logging for journey completion failures

**Performance Monitoring:**
- Web Vitals tracking
- Custom FPS metrics
- Asset load time monitoring

**Analytics (Privacy-First):**
- Plausible Analytics (GDPR-compliant, no cookies)
- Custom events: journey_started, journey_completed, reflection_provided

---

## 14. Future Enhancements (Post-MVP)

### 14.1 VR Mode

**WebXR Integration:**
- Deeper immersion through stereoscopic rendering
- Head tracking for natural viewing
- Controller-free experience (gaze-based)

**Technical Considerations:**
- Requires HTTPS
- Performance critical (90 FPS minimum for VR)
- Motion sickness prevention (smooth movements only)

### 14.2 Multi-Language Support

**Narration Translations:**
- Spanish, French, German, Japanese, Chinese
- Culturally appropriate astronaut quotes

### 14.3 Educator Mode

**Features:**
- Pause at any point in journey
- Annotations explaining phenomena
- Discussion prompts for classroom use

### 14.4 Meditation Mode

**Extended Contemplation:**
- 20-minute slow orbital flight
- Extended binaural beats session
- Minimal narration
- Breathing cues (optional)

---

## 15. Conclusion

This Technical Design Document outlines a system architecture optimized for triggering the Overview Effect rather than simply displaying Earth from space. Every technical decision—from locked camera paths to psychoacoustic audio to mandatory stillness moments—is designed to create the conditions for a cognitive shift toward awe, interconnectedness, and global responsibility.

**Key Differentiators:**
1. **Journey-First Architecture**: Orchestrated experience over free exploration
2. **Psychological Timing**: Evidence-based duration and pacing
3. **Awe-Optimized Rendering**: Visual design specifically for emotional impact
4. **Psychoacoustic Audio**: Binaural beats and strategic silence
5. **Measurement Focus**: Track effectiveness, not just engagement

**Development Priority:**
Build the core 7-10 minute guided journey first. All other features (VR, exploration mode, educational overlays) are secondary to reliably delivering the Overview Effect.

---

**Document Version:** 1.0
**Last Updated:** January 2, 2026
**Next Review:** After MVP user testing
