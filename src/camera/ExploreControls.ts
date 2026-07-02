import type * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const MIN_DISTANCE = 1.25; // just above the cloud layer
export const MAX_DISTANCE = 60; // "pale blue dot" range

// Orbit-style exploration: drag to rotate, wheel/pinch to zoom, no pan.
// Damping gives the weightless, inertial feel.
export class ExploreControls {
  private readonly controls: OrbitControls;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.controls = new OrbitControls(camera, domElement);
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.rotateSpeed = 0.45;
    this.controls.zoomSpeed = 0.5;
    this.controls.minDistance = MIN_DISTANCE;
    this.controls.maxDistance = MAX_DISTANCE;
  }

  get enabled(): boolean {
    return this.controls.enabled;
  }

  set enabled(value: boolean) {
    this.controls.enabled = value;
  }

  /** Fires on user interaction start (used for drag-to-exit GodView). */
  onUserInteraction(handler: () => void): void {
    this.controls.addEventListener('start', handler);
  }

  update(): void {
    this.controls.update();
  }
}
