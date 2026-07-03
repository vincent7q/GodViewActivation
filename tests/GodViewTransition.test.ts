import { describe, expect, test } from 'vitest';
import * as THREE from 'three';
import { GodViewTransition, sphericalLerp } from '../src/camera/GodViewTransition';

describe('sphericalLerp', () => {
  const from = new THREE.Vector3(0, 0, 5);
  const to = new THREE.Vector3(2, 1, 0).normalize().multiplyScalar(10);

  test('returns endpoints at t=0 and t=1', () => {
    expect(sphericalLerp(from, to, 0).distanceTo(from)).toBeLessThan(1e-6);
    expect(sphericalLerp(from, to, 1).distanceTo(to)).toBeLessThan(1e-6);
  });

  test('interpolates distance between the endpoint radii', () => {
    const mid = sphericalLerp(from, to, 0.5);
    expect(mid.length()).toBeGreaterThan(5);
    expect(mid.length()).toBeLessThan(10);
  });

  test('never passes through the globe when both endpoints are outside it', () => {
    const near = new THREE.Vector3(-1.3, 0, 0);
    const far = new THREE.Vector3(1.3, 0.01, 0); // nearly antipodal
    for (let t = 0; t <= 1.0001; t += 0.05) {
      expect(sphericalLerp(near, far, Math.min(t, 1)).length()).toBeGreaterThanOrEqual(1.29);
    }
  });
});

describe('GodViewTransition', () => {
  const target = new THREE.Vector3(2, 1, 0).normalize().multiplyScalar(3.4);

  test('flies the camera to the target and reports completion', () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 0.4, 2);

    let completed = false;
    const transition = new GodViewTransition(camera);
    transition.flyTo(target, 6, () => (completed = true));

    // Drive a bit past the nominal duration; FP accumulation of 0.1s
    // steps lands just short of exactly 6.0.
    for (let i = 0; i < 70 && !completed; i++) transition.update(0.1);

    expect(completed).toBe(true);
    expect(camera.position.distanceTo(target)).toBeLessThan(1e-3);
  });

  test('keeps looking at the origin mid-flight', () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 0, 3);

    const transition = new GodViewTransition(camera);
    transition.flyTo(target, 6);
    transition.update(3); // halfway

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    const toOrigin = camera.position.clone().negate().normalize();
    expect(forward.dot(toOrigin)).toBeGreaterThan(0.999);
  });

  test('is inert when no flight is active', () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(1, 2, 3);

    const transition = new GodViewTransition(camera);
    transition.update(1);
    expect(camera.position.equals(new THREE.Vector3(1, 2, 3))).toBe(true);
  });
});
