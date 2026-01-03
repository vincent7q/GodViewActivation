// tests/core/JourneyOrchestrator.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import JourneyOrchestrator from '@/core/JourneyOrchestrator.js'

describe('JourneyOrchestrator', () => {
  let orchestrator

  beforeEach(() => {
    orchestrator = new JourneyOrchestrator()
  })

  it('should initialize with 4 phases', () => {
    expect(orchestrator.phases).toHaveLength(4)
  })

  it('should start at phase 0 (Ascent)', () => {
    expect(orchestrator.currentPhaseIndex).toBe(0)
    expect(orchestrator.getCurrentPhase().name).toBe('Ascent')
  })

  it('should have total journey duration of 7-10 minutes', () => {
    const totalDuration = orchestrator.phases.reduce(
      (sum, phase) => sum + phase.duration,
      0
    )
    expect(totalDuration).toBeGreaterThanOrEqual(420000) // 7 min
    expect(totalDuration).toBeLessThanOrEqual(600000) // 10 min
  })

  it('should start journey and set isActive to true', () => {
    orchestrator.start()
    expect(orchestrator.isActive).toBe(true)
  })

  it('should emit phase-change event on transition', () => {
    const callback = vi.fn()
    orchestrator.on('phase-change', callback)

    orchestrator.start()
    orchestrator.update(121000) // 2:01 - trigger transition

    expect(callback).toHaveBeenCalled()
  })

  it('should complete journey after all phases', () => {
    const callback = vi.fn()
    orchestrator.on('journey-complete', callback)

    orchestrator.start()
    orchestrator.update(600000) // 10 minutes

    expect(callback).toHaveBeenCalled()
    expect(orchestrator.isActive).toBe(false)
  })
})
