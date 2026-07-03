import * as THREE from 'three';
import { sphericalLerp } from '../camera/GodViewTransition';
import { EARTH_ROTATION_SPEED } from '../scene/Earth';
import { TOUR_COUNTRIES, latLonToWorld } from './countries';
import { easeInOutCubic } from './tween';

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

export interface JourneyCallbacks {
  /** Fires as each phase begins (including the first, on the first update). */
  onPhase?: (phase: JourneyPhase) => void;
  onComplete?: () => void;
}

// Frame-driven playback: call update(dt) each frame and copy the returned
// position onto the camera. Null once the journey is over or stopped.
export class JourneyPlayer {
  private phaseIndex = -1;
  private phaseElapsed = 0;
  private done = false;
  private readonly position = new THREE.Vector3();

  constructor(
    private readonly phases: JourneyPhase[],
    private readonly callbacks: JourneyCallbacks = {},
  ) {}

  get active(): boolean {
    return !this.done;
  }

  update(dt: number): THREE.Vector3 | null {
    if (this.done) return null;
    if (this.phaseIndex === -1) this.enterPhase(0);

    this.phaseElapsed += dt;
    while (this.phaseElapsed >= this.phases[this.phaseIndex].duration) {
      if (this.phaseIndex === this.phases.length - 1) {
        this.position.copy(this.phases[this.phaseIndex].to);
        this.done = true;
        this.callbacks.onComplete?.();
        return this.position;
      }
      this.phaseElapsed -= this.phases[this.phaseIndex].duration;
      this.enterPhase(this.phaseIndex + 1);
    }

    const phase = this.phases[this.phaseIndex];
    const t = phase.duration === 0 ? 1 : this.phaseElapsed / phase.duration;
    this.position.copy(sphericalLerp(phase.from, phase.to, easeInOutCubic(t)));
    return this.position;
  }

  /** User exit: abandon playback (the return flight is flown elsewhere). */
  stop(): void {
    this.done = true;
  }

  private enterPhase(index: number): void {
    this.phaseIndex = index;
    this.callbacks.onPhase?.(this.phases[index]);
  }
}
