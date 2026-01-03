// src/core/EarthModel.js
import * as THREE from 'three'

export default class EarthModel {
  constructor(options = {}) {
    this.earthMesh = null
    this.cloudsMesh = null
    this.atmosphereMesh = null
    this.group = new THREE.Group()

    // Device detection for LOD
    this.isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent)
    this.segments = this.isMobile ? 64 : 128

    this.textureLoader = new THREE.TextureLoader()

    this.init()
  }

  init() {
    this.createEarthMesh()
    this.createCloudsMesh()
    this.createAtmosphere()

    // Randomize Earth rotation for varied starting views
    this.randomizeRotation()

    this.group.add(this.earthMesh)
    this.group.add(this.cloudsMesh)
    this.group.add(this.atmosphereMesh)
  }

  randomizeRotation() {
    // Random longitude rotation (0 to 360 degrees)
    const randomLongitude = Math.random() * Math.PI * 2

    // Random latitude tilt (-30 to +30 degrees for better viewing angles)
    // Avoid extreme poles which look less interesting
    const randomLatitude = (Math.random() - 0.5) * Math.PI / 3

    // Apply random rotations to Earth
    this.earthMesh.rotation.y = randomLongitude
    this.earthMesh.rotation.x = randomLatitude

    // Apply same base rotation to clouds (they'll rotate independently during animation)
    this.cloudsMesh.rotation.y = randomLongitude
    this.cloudsMesh.rotation.x = randomLatitude

    console.log(`🌍 Random Earth view: longitude ${(randomLongitude * 180 / Math.PI).toFixed(1)}°, latitude ${(randomLatitude * 180 / Math.PI).toFixed(1)}°`)
  }

  createEarthMesh() {
    // Earth geometry: radius in km
    const geometry = new THREE.SphereGeometry(
      6371, // Earth radius in km
      this.segments, // Width segments
      this.segments  // Height segments
    )

    // Use real NASA Blue Marble texture from public CDN
    const earthTexture = this.textureLoader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/planets/earth_atmos_2048.jpg',
      () => {
        console.log('Earth texture loaded successfully')
      },
      undefined,
      (error) => {
        console.error('Error loading Earth texture:', error)
        // Fallback to simple blue sphere if texture fails
        this.earthMesh.material.color.setHex(0x2563a0)
      }
    )

    // Material with realistic properties
    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 10,
      specular: 0x333333
    })

    this.earthMesh = new THREE.Mesh(geometry, material)
    // Rotation will be randomized in randomizeRotation()
  }

  createCloudsMesh() {
    // Clouds slightly above Earth surface
    const geometry = new THREE.SphereGeometry(
      6371 + 50, // 50 km above surface
      this.segments,
      this.segments
    )

    // Load cloud texture
    const cloudTexture = this.textureLoader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/planets/earth_clouds_1024.png',
      () => {
        console.log('Cloud texture loaded successfully')
      },
      undefined,
      (error) => {
        console.warn('Cloud texture failed to load:', error)
      }
    )

    const material = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.3, // Reduced from 0.8 to 0.3 for subtle cloud layer
      depthWrite: false
    })

    this.cloudsMesh = new THREE.Mesh(geometry, material)
  }

  createAtmosphere() {
    // Create atmospheric glow
    const geometry = new THREE.SphereGeometry(
      6371 + 100, // Atmosphere extends 100km
      32,
      32
    )

    const material = new THREE.ShaderMaterial({
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
    })

    this.atmosphereMesh = new THREE.Mesh(geometry, material)
  }

  update(deltaTime) {
    // Slow cloud rotation for subtle animation
    if (this.cloudsMesh) {
      this.cloudsMesh.rotation.y += deltaTime * 0.05 // Much more visible rotation
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
      if (this.earthMesh.material.map) {
        this.earthMesh.material.map.dispose()
      }
    }
    if (this.cloudsMesh) {
      this.cloudsMesh.geometry.dispose()
      this.cloudsMesh.material.dispose()
      if (this.cloudsMesh.material.map) {
        this.cloudsMesh.material.map.dispose()
      }
    }
    if (this.atmosphereMesh) {
      this.atmosphereMesh.geometry.dispose()
      this.atmosphereMesh.material.dispose()
    }
  }
}
