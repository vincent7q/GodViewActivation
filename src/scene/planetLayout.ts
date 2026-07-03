import * as THREE from 'three';
import { SUN_DIRECTION } from './Lighting';

export interface PlanetSpec {
  name: string;
  texture: string;
  /** Visual radius — composed for the shot, not to scale. */
  radius: number;
  /** Distance from Earth along the sun axis. */
  distance: number;
  /** Sideways / vertical scatter so the arc doesn't read as a ruler. */
  lateral: number;
  vertical: number;
}

// Artistic lineup between Earth and the sun sprite — see the design doc.
export const PLANETS: PlanetSpec[] = [
  { name: 'Mercury', texture: '2k_mercury.jpg', radius: 1.2, distance: 60, lateral: -8, vertical: -3 },
  { name: 'Venus', texture: '2k_venus_atmosphere.jpg', radius: 2.0, distance: 95, lateral: 7, vertical: 2 },
  { name: 'Mars', texture: '2k_mars.jpg', radius: 1.6, distance: 130, lateral: -10, vertical: 4 },
  { name: 'Jupiter', texture: '2k_jupiter.jpg', radius: 6.5, distance: 170, lateral: 12, vertical: -5 },
  { name: 'Saturn', texture: '2k_saturn.jpg', radius: 5.5, distance: 210, lateral: -14, vertical: 6 },
  { name: 'Uranus', texture: '2k_uranus.jpg', radius: 3.0, distance: 250, lateral: 10, vertical: -6 },
  { name: 'Neptune', texture: '2k_neptune.jpg', radius: 3.0, distance: 290, lateral: -9, vertical: 3 },
];

export const SUN_DISTANCE = 350;
export const SUN_CORE_RADIUS = 12;

const UP = new THREE.Vector3(0, 1, 0);
const LATERAL = new THREE.Vector3().crossVectors(SUN_DIRECTION, UP).normalize();
const VERTICAL = new THREE.Vector3().crossVectors(LATERAL, SUN_DIRECTION).normalize();

export function planetPosition(spec: PlanetSpec): THREE.Vector3 {
  return SUN_DIRECTION.clone()
    .multiplyScalar(spec.distance)
    .addScaledVector(LATERAL, spec.lateral)
    .addScaledVector(VERTICAL, spec.vertical);
}
