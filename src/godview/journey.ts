import * as THREE from 'three';
import { EARTH_ROTATION_SPEED } from '../scene/Earth';
import { TOUR_COUNTRIES, latLonToWorld } from './countries';

export const SKIM_RADIUS = 1.3;
export const DOT_RADIUS = 55;
export const ASCEND_MIDPOINT_RADIUS = 8;
export const DESCEND_SECONDS = 10;
export const DWELL_SECONDS = 3;
export const LEG_SECONDS = 5;
export const ASCEND_SILENT_SECONDS = 12;
export const ASCEND_QUOTE_SECONDS = 18;
export const HOLD_SECONDS = 15;

export type JourneyPhaseKind = 'descend' | 'dwell' | 'leg' | 'ascend' | 'ascend-quote' | 'hold';

export interface JourneyPhase {
  kind: JourneyPhaseKind;
  /** Set on dwell phases: the caption to show. */
  country?: string;
  duration: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
}

// The outbound timeline: descend → country flyover → ascend → dot hold.
// The return home stays with GodViewTransition.flyTo, as before.
// Country waypoints use the surface rotation predicted for their arrival
// time, so the camera meets each country as the globe turns beneath it.
export function buildJourney(
  startPosition: THREE.Vector3,
  surfaceRotationY: number,
): JourneyPhase[] {
  const phases: JourneyPhase[] = [];
  let elapsed = 0;
  let cursor = startPosition.clone();

  const add = (
    kind: JourneyPhaseKind,
    duration: number,
    to: THREE.Vector3,
    country?: string,
  ): void => {
    const phase: JourneyPhase = { kind, duration, from: cursor.clone(), to: to.clone() };
    if (country !== undefined) phase.country = country;
    phases.push(phase);
    cursor = to.clone();
    elapsed += duration;
  };

  for (let i = 0; i < TOUR_COUNTRIES.length; i++) {
    const { name, lat, lon } = TOUR_COUNTRIES[i];
    const travel = i === 0 ? DESCEND_SECONDS : LEG_SECONDS;
    const arrivalRotation = surfaceRotationY + EARTH_ROTATION_SPEED * (elapsed + travel);
    const waypoint = latLonToWorld(lat, lon, arrivalRotation, SKIM_RADIUS);
    add(i === 0 ? 'descend' : 'leg', travel, waypoint);
    add('dwell', DWELL_SECONDS, waypoint, name);
  }

  const outward = cursor.clone().normalize();
  add('ascend', ASCEND_SILENT_SECONDS, outward.clone().multiplyScalar(ASCEND_MIDPOINT_RADIUS));
  add('ascend-quote', ASCEND_QUOTE_SECONDS, outward.clone().multiplyScalar(DOT_RADIUS));
  add('hold', HOLD_SECONDS, outward.clone().multiplyScalar(DOT_RADIUS));

  return phases;
}
