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
