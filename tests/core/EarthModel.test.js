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
