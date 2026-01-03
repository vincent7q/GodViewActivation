// src/core/JourneyPhase.js
export default class JourneyPhase {
  constructor(name, duration) {
    this.name = name
    this.duration = duration // in milliseconds
    this.elapsed = 0
    this.progress = 0 // 0 to 1
  }

  enter() {
    this.elapsed = 0
    this.progress = 0
    console.log(`Entering phase: ${this.name}`)
  }

  update(deltaTime) {
    this.elapsed += deltaTime
    this.progress = Math.min(this.elapsed / this.duration, 1)
  }

  isComplete() {
    return this.elapsed >= this.duration
  }

  exit() {
    console.log(`Exiting phase: ${this.name}`)
  }

  getProgress() {
    return this.progress
  }
}
