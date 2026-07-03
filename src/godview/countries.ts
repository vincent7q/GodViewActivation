import * as THREE from 'three';

export interface TourCountry {
  name: string;
  lat: number;
  lon: number;
}

// Journey flyover roster, in visit order — a smooth south-to-north,
// then eastward arc with no backtracking. Extend or reorder freely.
export const TOUR_COUNTRIES: TourCountry[] = [
  { name: 'Australia', lat: -25.3, lon: 134.5 },
  { name: 'China', lat: 35.0, lon: 103.8 },
  { name: 'Japan', lat: 36.2, lon: 138.3 },
  { name: 'United States', lat: 39.8, lon: -98.6 },
];

const UP = new THREE.Vector3(0, 1, 0);

// Standard three.js SphereGeometry equirectangular mapping, then the
// surface's current Y rotation. Verify texture alignment in the browser;
// if the map seam differs, adjust the `+ 180` longitude offset here.
export function latLonToWorld(
  latDeg: number,
  lonDeg: number,
  surfaceRotationY: number,
  radius: number,
): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - latDeg);
  const theta = THREE.MathUtils.degToRad(lonDeg + 180);
  return new THREE.Vector3(
    -Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  )
    .applyAxisAngle(UP, surfaceRotationY)
    .multiplyScalar(radius);
}
