import * as THREE from 'three';
import { sphericalLerp } from '../camera/GodViewTransition';
import { EARTH_ROTATION_SPEED } from '../scene/Earth';
import { SUN_DIRECTION } from '../scene/Lighting';
import { COSMIC_STAGES } from './cosmicStages';
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
export const HOLD_SECONDS = 8;
export const REVEAL_RADIUS = 250;
const REVEAL_LOOK_LANDSCAPE = 120;
const REVEAL_LOOK_PORTRAIT = 35;
const UP = new THREE.Vector3(0, 1, 0);

export type JourneyPhaseKind =
  | 'descend'
  | 'dwell'
  | 'leg'
  | 'ascend'
  | 'ascend-quote'
  | 'hold'
  | 'cosmic';

export interface JourneyPhase {
  kind: JourneyPhaseKind;
  /** Set on dwell phases: the caption to show. */
  country?: string;
  /** Set on cosmic phases: which zoom-out stage this is (COSMIC_STAGES key). */
  stage?: string;
  duration: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
  /** Optional: the camera's look target eases here during this phase
   *  (default: keep looking at the origin). */
  lookTo?: THREE.Vector3;
}

// Side-on vantage, slightly lifted: Earth low-center, sun glare off-axis,
// the planet arc strung between them.
export function computeRevealPosition(): THREE.Vector3 {
  return new THREE.Vector3()
    .crossVectors(SUN_DIRECTION, UP)
    .normalize()
    .addScaledVector(UP, 0.18)
    .normalize()
    .multiplyScalar(REVEAL_RADIUS);
}

// Landscape frames Earth AND the sun; portrait can't fit both (half-hfov
// ~13°), so it stays near Earth and lets the sun's glow bleed in.
export function computeRevealLook(aspect: number): THREE.Vector3 {
  const distance = aspect >= 1 ? REVEAL_LOOK_LANDSCAPE : REVEAL_LOOK_PORTRAIT;
  return SUN_DIRECTION.clone().multiplyScalar(distance);
}

// The outbound timeline: descend → country flyover → ascend → dot hold.
// The return home stays with GodViewTransition.flyTo, as before.
// Country waypoints use the surface rotation predicted for their arrival
// time, so the camera meets each country as the globe turns beneath it.
export function buildJourney(
  startPosition: THREE.Vector3,
  surfaceRotationY: number,
  aspect: number,
): JourneyPhase[] {
  const phases: JourneyPhase[] = [];
  let elapsed = 0;
  let cursor = startPosition.clone();

  const add = (
    kind: JourneyPhaseKind,
    duration: number,
    to: THREE.Vector3,
    extras: { country?: string; stage?: string; lookTo?: THREE.Vector3 } = {},
  ): void => {
    const phase: JourneyPhase = { kind, duration, from: cursor.clone(), to: to.clone() };
    if (extras.country !== undefined) phase.country = extras.country;
    if (extras.stage !== undefined) phase.stage = extras.stage;
    if (extras.lookTo !== undefined) phase.lookTo = extras.lookTo.clone();
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
    add('dwell', DWELL_SECONDS, waypoint, { country: name });
  }

  const outward = cursor.clone().normalize();
  add('ascend', ASCEND_SILENT_SECONDS, outward.clone().multiplyScalar(ASCEND_MIDPOINT_RADIUS));
  add('ascend-quote', ASCEND_QUOTE_SECONDS, outward.clone().multiplyScalar(DOT_RADIUS));
  add('hold', HOLD_SECONDS, outward.clone().multiplyScalar(DOT_RADIUS));

  // Cosmic zoom-out: one flight to the reveal vantage, then the camera
  // parks — the scenery (stage crossfades) performs the zoom.
  const revealPosition = computeRevealPosition();
  COSMIC_STAGES.forEach((stage, i) => {
    add('cosmic', stage.duration, revealPosition, {
      stage: stage.key,
      lookTo: i === 0 ? computeRevealLook(aspect) : undefined,
    });
  });

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
  private readonly look = new THREE.Vector3(0, 0, 0);
  private readonly lookStart = new THREE.Vector3(0, 0, 0);

  constructor(
    private readonly phases: JourneyPhase[],
    private readonly callbacks: JourneyCallbacks = {},
  ) {}

  get active(): boolean {
    return !this.done;
  }

  /** Where the camera should look this frame (origin except look-to phases). */
  get lookTarget(): THREE.Vector3 {
    return this.look;
  }

  update(dt: number): THREE.Vector3 | null {
    if (this.done) return null;
    if (this.phaseIndex === -1) this.enterPhase(0);

    this.phaseElapsed += dt;
    while (this.phaseElapsed >= this.phases[this.phaseIndex].duration) {
      if (this.phaseIndex === this.phases.length - 1) {
        const last = this.phases[this.phaseIndex];
        this.position.copy(last.to);
        if (last.lookTo) this.look.copy(last.lookTo);
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
    if (phase.lookTo) this.look.lerpVectors(this.lookStart, phase.lookTo, easeInOutCubic(t));
    return this.position;
  }

  /** User exit: abandon playback (the return flight is flown elsewhere). */
  stop(): void {
    this.done = true;
  }

  private enterPhase(index: number): void {
    this.lookStart.copy(this.look);
    this.phaseIndex = index;
    this.callbacks.onPhase?.(this.phases[index]);
  }
}
