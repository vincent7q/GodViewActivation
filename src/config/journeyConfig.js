// src/config/journeyConfig.js
import * as THREE from 'three'

/**
 * Key camera waypoints for the journey
 * Distances are in kilometers from Earth center
 * Earth radius = 6,371 km
 */
export const JOURNEY_WAYPOINTS = {
  // Earth surface (sea level)
  SURFACE: new THREE.Vector3(0, 6371, 0),

  // Low Earth orbit (ISS altitude ~400 km)
  LOW_ORBIT: new THREE.Vector3(0, 6371 + 400, 0),

  // Higher orbit for transition (2,000 km altitude)
  TRANSITION: new THREE.Vector3(0, 0, 6371 + 2000),

  // Geostationary orbit distance for contemplation (~35,000 km)
  CONTEMPLATION: new THREE.Vector3(35000, 0, 0),

  // "Pale blue dot" view (very far, ~150 million km)
  PALE_BLUE_DOT: new THREE.Vector3(0, 0, 150000),

  // Return to closer orbit for ending
  CLOSE_ORBIT: new THREE.Vector3(0, 15000, 15000)
}

/**
 * Phase-specific camera configuration
 */
export const PHASE_CONFIG = [
  {
    name: 'Ascent',
    duration: 120000, // 2 minutes
    cameraStart: JOURNEY_WAYPOINTS.SURFACE,
    cameraEnd: JOURNEY_WAYPOINTS.LOW_ORBIT,
    description: 'Rising from Earth surface to low orbit'
  },
  {
    name: 'Transition',
    duration: 120000, // 2 minutes
    cameraStart: JOURNEY_WAYPOINTS.LOW_ORBIT,
    cameraEnd: JOURNEY_WAYPOINTS.TRANSITION,
    description: 'Breaking into space, Earth becomes whole'
  },
  {
    name: 'Contemplation',
    duration: 180000, // 3 minutes
    cameraStart: JOURNEY_WAYPOINTS.TRANSITION,
    cameraEnd: JOURNEY_WAYPOINTS.CONTEMPLATION,
    description: 'Slow orbit around borderless Earth'
  },
  {
    name: 'Integration',
    duration: 180000, // 3 minutes
    cameraStart: JOURNEY_WAYPOINTS.CONTEMPLATION,
    cameraEnd: JOURNEY_WAYPOINTS.PALE_BLUE_DOT,
    description: 'Zoom to pale blue dot, then return'
  }
]

/**
 * Narration timestamps (in milliseconds from journey start)
 */
export const NARRATION_TIMESTAMPS = [
  {
    time: 150000, // 2:30
    text: "The Earth is a fragile oasis in the vastness of space.",
    key: 'narration-1'
  },
  {
    time: 240000, // 4:00
    text: "There are no borders or boundaries on our planet except those we create in our minds.",
    key: 'narration-2'
  },
  {
    time: 360000, // 6:00
    text: "We are all astronauts on Spaceship Earth.",
    key: 'narration-3'
  },
  {
    time: 510000, // 8:30
    text: "Look again at that dot. That's here. That's home. That's us.",
    key: 'narration-4'
  }
]

/**
 * Stillness moments (camera locks)
 */
export const STILLNESS_MOMENTS = [
  {
    time: 120000, // 2:00 (end of Ascent)
    duration: 30000 // 30 seconds
  },
  {
    time: 300000, // 5:00 (mid Contemplation)
    duration: 30000 // 30 seconds
  }
]
