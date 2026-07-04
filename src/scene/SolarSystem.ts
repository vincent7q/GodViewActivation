import * as THREE from 'three';
import {
  MOON_COLOR,
  MOON_RADIUS,
  PLANETS,
  SUN_CORE_RADIUS,
  moonPosition,
  planetPosition,
  sunPosition,
  type PlanetSpec,
} from './planetLayout';

const SATURN_RING_TILT = THREE.MathUtils.degToRad(63);
const GLOW_SCALE = 90;

// The living solar system: sun (textured core + additive glow sprite),
// nine planets on slow heliocentric orbits, and the Moon around Earth.
// Visible from startup; during the cosmic zoom-out main.ts scales and
// fades the whole group. Unlit materials by design — the DirectionalLight
// in Lighting.ts stays the single lighting truth for Earth itself.
export class SolarSystem {
  readonly group = new THREE.Group();

  private readonly materials: Array<THREE.MeshBasicMaterial | THREE.SpriteMaterial> = [];
  private readonly texturedMaterials = new Map<string, THREE.MeshBasicMaterial>();
  private readonly loader = new THREE.TextureLoader();
  private readonly planetMeshes: Array<{ spec: PlanetSpec; mesh: THREE.Mesh }> = [];
  private saturnRing: THREE.Mesh | null = null;
  private readonly moon: THREE.Mesh;
  private elapsed = 0;
  private currentOpacity = 1;

  constructor() {
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_CORE_RADIUS, 32, 32),
      this.track(new THREE.MeshBasicMaterial({ transparent: true }), '2k_sun.jpg'),
    );
    core.position.copy(sunPosition());
    this.group.add(core);

    const glowMaterial = new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    this.materials.push(glowMaterial);
    const glow = new THREE.Sprite(glowMaterial);
    glow.position.copy(sunPosition());
    glow.scale.setScalar(GLOW_SCALE);
    this.group.add(glow);

    for (const spec of PLANETS) {
      const material = this.track(
        new THREE.MeshBasicMaterial({ transparent: true, color: spec.color }),
        spec.texture ?? undefined,
      );
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(spec.radius, 48, 48), material);
      mesh.position.copy(planetPosition(spec, 0));
      this.group.add(mesh);
      this.planetMeshes.push({ spec, mesh });

      if (spec.name === 'Saturn') {
        const ringMaterial = this.track(
          new THREE.MeshBasicMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
          '2k_saturn_ring_alpha.png',
        );
        this.saturnRing = new THREE.Mesh(
          makeRingGeometry(spec.radius * 1.4, spec.radius * 2.3),
          ringMaterial,
        );
        this.saturnRing.position.copy(mesh.position);
        this.saturnRing.rotation.x = SATURN_RING_TILT;
        this.group.add(this.saturnRing);
      }
    }

    this.moon = new THREE.Mesh(
      new THREE.SphereGeometry(MOON_RADIUS, 32, 32),
      this.track(new THREE.MeshBasicMaterial({ transparent: true, color: MOON_COLOR })),
    );
    this.moon.position.copy(moonPosition(0));
    this.group.add(this.moon);
  }

  /** Fetch all textures; call once (non-blocking) after the Earth loads. */
  async load(): Promise<void> {
    await Promise.all(
      [...this.texturedMaterials.entries()].map(async ([file, material]) => {
        const texture = await this.loader.loadAsync(`/textures/${file}`);
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.color.set(0xffffff);
        material.needsUpdate = true;
      }),
    );
  }

  /** Advance the orbits — call every frame; motion is slow by design. */
  update(dt: number): void {
    this.elapsed += dt;
    for (const { spec, mesh } of this.planetMeshes) {
      mesh.position.copy(planetPosition(spec, this.elapsed));
      if (spec.name === 'Saturn' && this.saturnRing) {
        this.saturnRing.position.copy(mesh.position);
      }
    }
    this.moon.position.copy(moonPosition(this.elapsed));
  }

  setOpacity(value: number): void {
    this.currentOpacity = value;
    for (const material of this.materials) material.opacity = value;
    this.group.visible = value > 0.001;
  }

  get opacity(): number {
    return this.currentOpacity;
  }

  private track(material: THREE.MeshBasicMaterial, file?: string): THREE.MeshBasicMaterial {
    this.materials.push(material);
    if (file) this.texturedMaterials.set(file, material);
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
