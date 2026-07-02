import * as THREE from 'three';

// Sun direction is shared with the Earth day/night shader so the lit
// hemisphere and the texture terminator always agree.
export const SUN_DIRECTION = new THREE.Vector3(-1.0, 0.35, 0.6).normalize();

// Warm golden-hour sun (~3500K) with faint cool ambient so the night
// side is not pure black.
export function createLighting(): THREE.Group {
  const group = new THREE.Group();

  const sun = new THREE.DirectionalLight(0xffe0b8, 3.2);
  sun.position.copy(SUN_DIRECTION).multiplyScalar(50);
  group.add(sun);

  const ambient = new THREE.AmbientLight(0x101422, 0.6);
  group.add(ambient);

  return group;
}
