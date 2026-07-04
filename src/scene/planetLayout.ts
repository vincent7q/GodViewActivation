import * as THREE from 'three';
import { SUN_DIRECTION } from './Lighting';

export interface PlanetSpec {
  name: string;
  /** null → flat-color material (texture site was unavailable; drop a 2K
   *  map in and set the filename to upgrade). */
  texture: string | null;
  color: number;
  /** Visual radius — composed for visibility, not to scale. */
  radius: number;
  /** Circular heliocentric orbit radius. */
  orbitRadius: number;
  periodSeconds: number;
  initialAngle: number;
}

// Earth (the 9th planet) sits at the origin; everything else circles the
// sun. Orbit radii keep every body ≥100 units from Earth at closest
// approach; periods run minutes — "slow but visibly alive".
export const PLANETS: PlanetSpec[] = [
  { name: 'Mercury', texture: '2k_mercury.jpg', color: 0x9c8e82, radius: 1.5, orbitRadius: 70, periodSeconds: 180, initialAngle: 0.4 },
  { name: 'Venus', texture: '2k_venus_atmosphere.jpg', color: 0xd8b46a, radius: 2.5, orbitRadius: 130, periodSeconds: 300, initialAngle: 2.2 },
  { name: 'Mars', texture: '2k_mars.jpg', color: 0xb4562e, radius: 2.0, orbitRadius: 200, periodSeconds: 540, initialAngle: 4.4 },
  { name: 'Jupiter', texture: '2k_jupiter.jpg', color: 0xc4a17a, radius: 8.0, orbitRadius: 460, periodSeconds: 900, initialAngle: 1.1 },
  { name: 'Saturn', texture: '2k_saturn.jpg', color: 0xd9c08b, radius: 7.0, orbitRadius: 540, periodSeconds: 1200, initialAngle: 3.4 },
  { name: 'Uranus', texture: '2k_uranus.jpg', color: 0x9fd4d9, radius: 4.5, orbitRadius: 610, periodSeconds: 1500, initialAngle: 5.3 },
  { name: 'Neptune', texture: '2k_neptune.jpg', color: 0x4a6fd4, radius: 4.5, orbitRadius: 670, periodSeconds: 1800, initialAngle: 0.9 },
  { name: 'Pluto', texture: null, color: 0xb8a58f, radius: 1.2, orbitRadius: 720, periodSeconds: 2400, initialAngle: 2.8 },
];

export const SUN_DISTANCE = 350;
export const SUN_CORE_RADIUS = 12;

export const MOON_ORBIT_RADIUS = 5;
export const MOON_RADIUS = 0.27;
export const MOON_PERIOD_SECONDS = 240;
export const MOON_COLOR = 0xbfbdb8;

const UP = new THREE.Vector3(0, 1, 0);
// Ecliptic basis: the plane through the sun containing the Earth-sun line.
const E1 = SUN_DIRECTION.clone();
const E2 = new THREE.Vector3().crossVectors(SUN_DIRECTION, UP).normalize();

export function sunPosition(): THREE.Vector3 {
  return SUN_DIRECTION.clone().multiplyScalar(SUN_DISTANCE);
}

export function planetPosition(spec: PlanetSpec, elapsedSeconds: number): THREE.Vector3 {
  const angle = spec.initialAngle + (2 * Math.PI * elapsedSeconds) / spec.periodSeconds;
  return sunPosition()
    .addScaledVector(E1, Math.cos(angle) * spec.orbitRadius)
    .addScaledVector(E2, Math.sin(angle) * spec.orbitRadius);
}

export function moonPosition(elapsedSeconds: number): THREE.Vector3 {
  const angle = (2 * Math.PI * elapsedSeconds) / MOON_PERIOD_SECONDS;
  return new THREE.Vector3()
    .addScaledVector(E1, Math.cos(angle) * MOON_ORBIT_RADIUS)
    .addScaledVector(E2, Math.sin(angle) * MOON_ORBIT_RADIUS);
}
