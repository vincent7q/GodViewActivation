import * as THREE from 'three';

// Procedural starfield: points distributed on a distant sphere with a
// slight blue-white color variation. Static — no parallax needed.
export function createStarfield(count: number): THREE.Points {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const radius = 900;

  for (let i = 0; i < count; i++) {
    // Uniform distribution on a sphere surface.
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const warmth = 0.75 + Math.random() * 0.25;
    colors[i * 3] = warmth;
    colors[i * 3 + 1] = warmth;
    colors[i * 3 + 2] = 0.85 + Math.random() * 0.15;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.6,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}
