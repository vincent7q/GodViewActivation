// tests/config/journeyConfig.test.js
import { describe, it, expect } from 'vitest'
import { JOURNEY_WAYPOINTS, PHASE_CONFIG } from '@/config/journeyConfig.js'

describe('journeyConfig', () => {
  it('should define all required waypoints', () => {
    expect(JOURNEY_WAYPOINTS.CLOSE_VIEW).toBeDefined()
    expect(JOURNEY_WAYPOINTS.MEDIUM_VIEW).toBeDefined()
    expect(JOURNEY_WAYPOINTS.TRANSITION).toBeDefined()
    expect(JOURNEY_WAYPOINTS.DISTANT_VIEW).toBeDefined()
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
    const closeView = JOURNEY_WAYPOINTS.CLOSE_VIEW.length()
    const mediumView = JOURNEY_WAYPOINTS.MEDIUM_VIEW.length()
    const transition = JOURNEY_WAYPOINTS.TRANSITION.length()
    const distantView = JOURNEY_WAYPOINTS.DISTANT_VIEW.length()
    const paleBlueDot = JOURNEY_WAYPOINTS.PALE_BLUE_DOT.length()

    expect(mediumView).toBeGreaterThan(closeView)
    expect(transition).toBeGreaterThan(mediumView)
    expect(distantView).toBeGreaterThan(transition)
    expect(paleBlueDot).toBeGreaterThan(distantView)
  })
})
