// src/config/journeyConfig.js
import * as THREE from 'three'

/**
 * Key camera waypoints for the journey
 * Distances are in kilometers from Earth center
 * Earth radius = 6,371 km
 *
 * Note: Camera positions must be far enough from Earth to see it properly
 * Starting at 21,000 km for a big beautiful Earth view
 */
export const JOURNEY_WAYPOINTS = {
  // Starting view - big Earth filling view (altitude: ~14,600 km)
  START_VIEW: new THREE.Vector3(0, 21000, 0),

  // Medium orbit - see full globe (altitude: ~23,600 km)
  MEDIUM_VIEW: new THREE.Vector3(0, 30000, 0),

  // Higher orbit for transition (altitude: ~42,600 km)
  TRANSITION: new THREE.Vector3(0, 0, 49000),

  // Distant view - Earth as sphere in space (altitude: ~73,600 km)
  DISTANT_VIEW: new THREE.Vector3(55000, 40000, 0),

  // "Pale blue dot" view (altitude: ~163,600 km)
  PALE_BLUE_DOT: new THREE.Vector3(0, 0, 170000),

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
    cameraStart: JOURNEY_WAYPOINTS.START_VIEW,
    cameraEnd: JOURNEY_WAYPOINTS.MEDIUM_VIEW,
    description: 'Rising above Earth - the planet comes into full view'
  },
  {
    name: 'Transition',
    duration: 120000, // 2 minutes
    cameraStart: JOURNEY_WAYPOINTS.MEDIUM_VIEW,
    cameraEnd: JOURNEY_WAYPOINTS.TRANSITION,
    description: 'Breaking into deep space - Earth becomes whole'
  },
  {
    name: 'Contemplation',
    duration: 180000, // 3 minutes
    cameraStart: JOURNEY_WAYPOINTS.TRANSITION,
    cameraEnd: JOURNEY_WAYPOINTS.DISTANT_VIEW,
    description: 'Distant orbit - Earth as a sphere in the vastness'
  },
  {
    name: 'Integration',
    duration: 180000, // 3 minutes
    cameraStart: JOURNEY_WAYPOINTS.DISTANT_VIEW,
    cameraEnd: JOURNEY_WAYPOINTS.PALE_BLUE_DOT,
    description: 'The pale blue dot - our fragile home in space'
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
