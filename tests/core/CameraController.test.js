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
