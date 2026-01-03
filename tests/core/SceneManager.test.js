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
