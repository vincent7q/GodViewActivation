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
