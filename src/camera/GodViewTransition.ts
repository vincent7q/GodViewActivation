import * as THREE from 'three';
import { Tween } from '../godview/tween';

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

export class GodViewTransition {
  private tween: Tween | null = null;
  private readonly from = new THREE.Vector3();
  private readonly to = new THREE.Vector3();
  private readonly lookFrom = new THREE.Vector3();
  private hasLookFrom = false;
  private readonly lookNow = new THREE.Vector3();

  constructor(private readonly camera: THREE.PerspectiveCamera) {}

  get active(): boolean {
    return this.tween !== null;
  }

  /** lookFrom: where the camera was looking as the flight starts; the look
   *  target eases back to the origin so exits from the reveal don't snap. */
  flyTo(
    target: THREE.Vector3,
    duration: number,
    onComplete?: () => void,
    lookFrom?: THREE.Vector3,
  ): void {
    this.from.copy(this.camera.position);
    this.to.copy(target);
    this.hasLookFrom = lookFrom !== undefined;
    if (lookFrom) this.lookFrom.copy(lookFrom);
    this.tween = new Tween(
      duration,
      (v) => {
        this.camera.position.copy(sphericalLerp(this.from, this.to, v));
        if (this.hasLookFrom) {
          this.lookNow.copy(this.lookFrom).multiplyScalar(1 - v);
          this.camera.lookAt(this.lookNow);
        } else {
          this.camera.lookAt(0, 0, 0);
        }
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
