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
