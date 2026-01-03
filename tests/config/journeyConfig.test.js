// tests/config/journeyConfig.test.js
import { describe, it, expect } from 'vitest'
import { JOURNEY_WAYPOINTS, PHASE_CONFIG } from '@/config/journeyConfig.js'

describe('journeyConfig', () => {
  it('should define all required waypoints', () => {
    expect(JOURNEY_WAYPOINTS.SURFACE).toBeDefined()
    expect(JOURNEY_WAYPOINTS.LOW_ORBIT).toBeDefined()
    expect(JOURNEY_WAYPOINTS.TRANSITION).toBeDefined()
    expect(JOURNEY_WAYPOINTS.CONTEMPLATION).toBeDefined()
    expect(JOURNEY_WAYPOINTS.PALE_BLUE_DOT).toBeDefined()
  })

  it('should have phase config for all 4 phases', () => {
    expect(PHASE_CONFIG).toHaveLength(4)
    expect(PHASE_CONFIG[0].name).toBe('Ascent')
    expect(PHASE_CONFIG[1].name).toBe('Transition')
    expect(PHASE_CONFIG[2].name).toBe('Contemplation')
    expect(PHASE_CONFIG[3].name).toBe('Integration')
  })

  it('should define camera start and end positions for each phase', () => {
    PHASE_CONFIG.forEach(phase => {
      expect(phase.cameraStart).toBeDefined()
      expect(phase.cameraEnd).toBeDefined()
    })
  })

  it('should have waypoints at increasing distances from Earth', () => {
    const surface = JOURNEY_WAYPOINTS.SURFACE.length()
    const lowOrbit = JOURNEY_WAYPOINTS.LOW_ORBIT.length()
    const transition = JOURNEY_WAYPOINTS.TRANSITION.length()
    const contemplation = JOURNEY_WAYPOINTS.CONTEMPLATION.length()

    expect(lowOrbit).toBeGreaterThan(surface)
    expect(transition).toBeGreaterThan(lowOrbit)
    expect(contemplation).toBeGreaterThan(transition)
  })
})
