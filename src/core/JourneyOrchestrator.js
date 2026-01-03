// src/core/JourneyOrchestrator.js
import JourneyPhase from './JourneyPhase.js'

export default class JourneyOrchestrator {
  constructor() {
    this.phases = [
      new JourneyPhase('Ascent', 120000),        // 2 minutes
      new JourneyPhase('Transition', 120000),    // 2 minutes
      new JourneyPhase('Contemplation', 180000), // 3 minutes
      new JourneyPhase('Integration', 180000)    // 3 minutes
    ]

    this.currentPhaseIndex = 0
    this.isActive = false
    this.totalElapsed = 0
    this.eventListeners = {}
  }

  start() {
    this.isActive = true
    this.totalElapsed = 0
    this.currentPhaseIndex = 0
    this.getCurrentPhase().enter()
    this.emit('journey-start')
  }

  update(deltaTime) {
    if (!this.isActive) return

    this.totalElapsed += deltaTime
    let remainingTime = deltaTime

    // Process all phase transitions that should occur within this time delta
    while (remainingTime > 0 && this.isActive) {
      const currentPhase = this.getCurrentPhase()
      const timeToPhaseEnd = currentPhase.duration - currentPhase.elapsed

      if (remainingTime >= timeToPhaseEnd) {
        // Complete current phase and transition
        currentPhase.update(timeToPhaseEnd)
        remainingTime -= timeToPhaseEnd
        this.transitionToNextPhase()
      } else {
        // Partially advance current phase
        currentPhase.update(remainingTime)
        remainingTime = 0
      }
    }
  }

  transitionToNextPhase() {
    const currentPhase = this.getCurrentPhase()
    currentPhase.exit()

    this.currentPhaseIndex++

    if (this.currentPhaseIndex >= this.phases.length) {
      this.completeJourney()
    } else {
      const nextPhase = this.getCurrentPhase()
      nextPhase.enter()
      this.emit('phase-change', {
        previousPhase: currentPhase.name,
        currentPhase: nextPhase.name,
        phaseIndex: this.currentPhaseIndex
      })
    }
  }

  completeJourney() {
    this.isActive = false
    this.emit('journey-complete', {
      totalDuration: this.totalElapsed
    })
  }

  getCurrentPhase() {
    return this.phases[this.currentPhaseIndex]
  }

  // Simple event emitter
  on(eventName, callback) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = []
    }
    this.eventListeners[eventName].push(callback)
  }

  emit(eventName, data) {
    if (this.eventListeners[eventName]) {
      this.eventListeners[eventName].forEach(callback => {
        callback(data)
      })
    }
  }

  dispose() {
    this.isActive = false
    this.eventListeners = {}
  }
}
