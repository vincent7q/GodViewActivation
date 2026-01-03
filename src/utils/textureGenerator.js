// src/utils/textureGenerator.js
import * as THREE from 'three'

/**
 * Generate placeholder Earth texture using canvas
 * Production: Replace with NASA Blue Marble 8K texture
 */
export function generatePlaceholderEarthTexture(resolution = 1024) {
  const canvas = document.createElement('canvas')
  canvas.width = resolution
  canvas.height = resolution / 2
  const ctx = canvas.getContext('2d')

  // Create ocean with gradient (darker deep ocean)
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  oceanGradient.addColorStop(0, '#1a4d6d')
  oceanGradient.addColorStop(0.5, '#2563a0')
  oceanGradient.addColorStop(1, '#1a4d6d')
  ctx.fillStyle = oceanGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Add subtle ocean texture
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const radius = Math.random() * 3
    ctx.fillStyle = `rgba(30, 80, 120, ${Math.random() * 0.3})`
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  // Draw continents with more realistic shapes and colors
  ctx.fillStyle = '#2d5a1e' // Forest green

  // Africa/Europe (large central landmass)
  ctx.beginPath()
  ctx.ellipse(resolution * 0.52, resolution * 0.23, resolution * 0.09, resolution * 0.15, -0.2, 0, Math.PI * 2)
  ctx.fill()

  // Asia (large eastern landmass)
  ctx.beginPath()
  ctx.ellipse(resolution * 0.72, resolution * 0.22, resolution * 0.14, resolution * 0.1, 0.3, 0, Math.PI * 2)
  ctx.fill()

  // North America
  ctx.beginPath()
  ctx.ellipse(resolution * 0.18, resolution * 0.2, resolution * 0.08, resolution * 0.12, -0.4, 0, Math.PI * 2)
  ctx.fill()

  // South America
  ctx.beginPath()
  ctx.ellipse(resolution * 0.24, resolution * 0.38, resolution * 0.05, resolution * 0.08, 0.1, 0, Math.PI * 2)
  ctx.fill()

  // Australia
  ctx.beginPath()
  ctx.ellipse(resolution * 0.82, resolution * 0.42, resolution * 0.045, resolution * 0.035, 0, 0, Math.PI * 2)
  ctx.fill()

  // Add mountain ranges (darker green)
  ctx.fillStyle = '#1d3d12'
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const radius = Math.random() * 8 + 3
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true

  return texture
}

/**
 * Generate placeholder cloud texture with more realistic appearance
 * Production: Replace with NASA cloud layer 4K
 */
export function generatePlaceholderCloudTexture(resolution = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = resolution
  canvas.height = resolution / 2
  const ctx = canvas.getContext('2d')

  // Transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Create wispy, realistic-looking clouds using multiple overlapping circles
  for (let i = 0; i < 25; i++) {
    const centerX = Math.random() * canvas.width
    const centerY = Math.random() * canvas.height
    const clusterSize = Math.random() * 5 + 3 // Number of circles in cluster

    // Create cloud cluster
    for (let j = 0; j < clusterSize; j++) {
      const offsetX = (Math.random() - 0.5) * 60
      const offsetY = (Math.random() - 0.5) * 60
      const radius = Math.random() * 30 + 15
      const opacity = Math.random() * 0.4 + 0.3 // Varied opacity for depth

      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
      ctx.beginPath()
      ctx.arc(centerX + offsetX, centerY + offsetY, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Add subtle blur effect for softer clouds
  ctx.filter = 'blur(2px)'
  ctx.globalCompositeOperation = 'source-over'
  ctx.drawImage(canvas, 0, 0)
  ctx.filter = 'none'

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true

  return texture
}
