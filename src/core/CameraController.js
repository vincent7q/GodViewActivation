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
