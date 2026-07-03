import * as THREE from 'three';
import { PLANETS, SUN_CORE_RADIUS, SUN_DISTANCE, planetPosition } from './planetLayout';
import { SUN_DIRECTION } from './Lighting';

const SATURN_RING_TILT = THREE.MathUtils.degToRad(63);
const GLOW_SCALE = 90;

// The reveal's scenery: unlit textured spheres (the planets sit between
// Earth and the sun, so their lit faces point away from the camera —
// physically they'd be silhouettes; MeshBasicMaterial keeps them readable)
// plus an additive glow sprite on the sun. Not a light source: the
// DirectionalLight in Lighting.ts stays the single lighting truth.
export class SolarSystem {
  readonly group = new THREE.Group();

  private readonly materials: Array<THREE.MeshBasicMaterial | THREE.SpriteMaterial> = [];
  private readonly texturedMaterials = new Map<string, THREE.MeshBasicMaterial>();
  private readonly loader = new THREE.TextureLoader();
  private currentOpacity = 0;

  constructor() {
    this.group.visible = false;

    const sunPosition = SUN_DIRECTION.clone().multiplyScalar(SUN_DISTANCE);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_CORE_RADIUS, 32, 32),
      this.track('2k_sun.jpg', new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })),
    );
    core.position.copy(sunPosition);
    this.group.add(core);

    const glowMaterial = new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.materials.push(glowMaterial);
    const glow = new THREE.Sprite(glowMaterial);
    glow.position.copy(sunPosition);
    glow.scale.setScalar(GLOW_SCALE);
    this.group.add(glow);

    for (const spec of PLANETS) {
      const material = this.track(
        spec.texture,
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
      );
      const planet = new THREE.Mesh(new THREE.SphereGeometry(spec.radius, 48, 48), material);
      planet.position.copy(planetPosition(spec));
      this.group.add(planet);

      if (spec.name === 'Saturn') {
        const ringMaterial = this.track(
          '2k_saturn_ring_alpha.png',
          new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        const ring = new THREE.Mesh(
          makeRingGeometry(spec.radius * 1.4, spec.radius * 2.3),
          ringMaterial,
        );
        ring.position.copy(planet.position);
        ring.rotation.x = SATURN_RING_TILT;
        this.group.add(ring);
      }
    }
  }

  /** Fetch all textures; call once (non-blocking) after the Earth loads. */
  async load(): Promise<void> {
    await Promise.all(
      [...this.texturedMaterials.entries()].map(async ([file, material]) => {
        const texture = await this.loader.loadAsync(`/textures/${file}`);
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.needsUpdate = true;
      }),
    );
  }

  setOpacity(value: number): void {
    this.currentOpacity = value;
    for (const material of this.materials) material.opacity = value;
    this.group.visible = value > 0.001;
  }

  get opacity(): number {
    return this.currentOpacity;
  }

  private track(file: string, material: THREE.MeshBasicMaterial): THREE.MeshBasicMaterial {
    this.materials.push(material);
    this.texturedMaterials.set(file, material);
    return material;
  }
}

// Radial-gradient glare, generated once — no asset needed.
function makeGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 244, 214, 1)');
  gradient.addColorStop(0.25, 'rgba(255, 214, 140, 0.55)');
  gradient.addColorStop(0.6, 'rgba(255, 176, 90, 0.14)');
  gradient.addColorStop(1, 'rgba(255, 160, 70, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// RingGeometry's default UVs are planar; remap u to the radial span so the
// ring strip texture (2048×125: radius along u) reads as concentric bands.
function makeRingGeometry(inner: number, outer: number): THREE.RingGeometry {
  const geometry = new THREE.RingGeometry(inner, outer, 96);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const v = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
  }
  return geometry;
}
