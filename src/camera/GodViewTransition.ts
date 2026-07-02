import * as THREE from 'three';
import { Tween } from '../godview/tween';
import { SUN_DIRECTION } from '../scene/Lighting';

export const HERO_DISTANCE = 3.4;

// Interpolates around the globe, not through it: slerp the direction,
// lerp the radius.
export function sphericalLerp(from: THREE.Vector3, to: THREE.Vector3, t: number): THREE.Vector3 {
  const dirFrom = from.clone().normalize();
  const dirTo = to.clone().normalize();

  const dot = THREE.MathUtils.clamp(dirFrom.dot(dirTo), -1, 1);
  const angle = Math.acos(dot);

  let direction: THREE.Vector3;
  if (angle < 1e-6) {
    direction = dirFrom;
  } else {
    const sinAngle = Math.sin(angle);
    direction = dirFrom
      .multiplyScalar(Math.sin((1 - t) * angle) / sinAngle)
      .add(dirTo.multiplyScalar(Math.sin(t * angle) / sinAngle))
      .normalize();
  }

  const radius = THREE.MathUtils.lerp(from.length(), to.length(), t);
  return direction.multiplyScalar(radius);
}

// The iconic vantage: whole Earth, mostly lit, sun ~55° off-axis so the
// terminator and atmospheric rim are both in frame.
export function computeHeroPosition(): THREE.Vector3 {
  return SUN_DIRECTION.clone()
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(55))
    .multiplyScalar(HERO_DISTANCE);
}

export class GodViewTransition {
  private tween: Tween | null = null;
  private readonly from = new THREE.Vector3();
  private readonly to = new THREE.Vector3();

  constructor(private readonly camera: THREE.PerspectiveCamera) {}

  get active(): boolean {
    return this.tween !== null;
  }

  flyTo(target: THREE.Vector3, duration: number, onComplete?: () => void): void {
    this.from.copy(this.camera.position);
    this.to.copy(target);
    this.tween = new Tween(
      duration,
      (v) => {
        this.camera.position.copy(sphericalLerp(this.from, this.to, v));
        this.camera.lookAt(0, 0, 0);
      },
      {
        onComplete: () => {
          this.tween = null;
          onComplete?.();
        },
      },
    );
  }

  update(dt: number): void {
    this.tween?.update(dt);
  }
}
