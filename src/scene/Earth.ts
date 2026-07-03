import * as THREE from 'three';
import { SUN_DIRECTION } from './Lighting';

const EARTH_VERTEX = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Blends NASA day and night textures along the sun terminator and bakes
// in warm sun lighting. Ends with the renderer's tone mapping chunks so
// toneMappingExposure (the GodView grading ramp) affects the globe.
const EARTH_FRAGMENT = /* glsl */ `
  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform vec3 uSunDirection;

  varying vec3 vWorldNormal;
  varying vec2 vUv;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    float cosSun = dot(normal, uSunDirection);

    vec3 day = texture2D(uDayMap, vUv).rgb;
    vec3 night = texture2D(uNightMap, vUv).rgb;

    // Soft terminator: night lights glow just past the edge of daylight.
    float dayStrength = smoothstep(-0.12, 0.25, cosSun);
    float sunLight = clamp(cosSun, 0.0, 1.0);
    vec3 litDay = day * (0.08 + 1.35 * sunLight) * vec3(1.0, 0.94, 0.86);
    vec3 litNight = night * vec3(1.0, 0.85, 0.6) * 1.6;

    vec3 color = mix(litNight, litDay, dayStrength);

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;

  varying vec3 vNormal;

  void main() {
    float rim = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    gl_FragColor = vec4(uColor, 1.0) * max(rim, 0.0) * uIntensity;
  }
`;

export const EARTH_ROTATION_SPEED = 0.01; // rad/s — one revolution ≈ 10.5 min
const CLOUD_SPEED_FACTOR = 1.3;
export const ATMOSPHERE_BASE_INTENSITY = 1.0;

export class Earth {
  readonly group = new THREE.Group();

  private readonly surface: THREE.Mesh;
  private readonly clouds: THREE.Mesh;
  private readonly surfaceMaterial: THREE.ShaderMaterial;
  private readonly cloudsMaterial: THREE.MeshLambertMaterial;
  private readonly atmosphereMaterial: THREE.ShaderMaterial;
  private readonly loader = new THREE.TextureLoader();

  constructor(
    segments: number,
    private readonly anisotropy = 1,
  ) {
    const geometry = new THREE.SphereGeometry(1, segments, segments);

    this.surfaceMaterial = new THREE.ShaderMaterial({
      vertexShader: EARTH_VERTEX,
      fragmentShader: EARTH_FRAGMENT,
      uniforms: {
        uDayMap: { value: null },
        uNightMap: { value: null },
        uSunDirection: { value: SUN_DIRECTION.clone() },
      },
    });
    this.surface = new THREE.Mesh(geometry, this.surfaceMaterial);
    this.group.add(this.surface);

    this.cloudsMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    this.clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.008, segments, segments),
      this.cloudsMaterial,
    );
    this.group.add(this.clouds);

    this.atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: ATMOSPHERE_VERTEX,
      fragmentShader: ATMOSPHERE_FRAGMENT,
      uniforms: {
        uColor: { value: new THREE.Color(0.3, 0.6, 1.0) },
        uIntensity: { value: ATMOSPHERE_BASE_INTENSITY },
      },
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.16, Math.min(segments, 64), Math.min(segments, 64)),
      this.atmosphereMaterial,
    );
    this.group.add(atmosphere);

    // Random starting longitude so repeat visits open on a fresh face.
    this.group.rotation.y = Math.random() * Math.PI * 2;
  }

  /** Loads the texture set; the scene is ready when this resolves. */
  async load(): Promise<void> {
    const [day, night, clouds] = await Promise.all([
      this.loadColorTexture('/textures/2k_earth_daymap.jpg'),
      this.loadColorTexture('/textures/2k_earth_nightmap.jpg'),
      this.loader.loadAsync('/textures/2k_earth_clouds.jpg'),
    ]);
    this.applyTextures(day, night, clouds);
  }

  update(dt: number): void {
    this.surface.rotation.y += EARTH_ROTATION_SPEED * dt;
    this.clouds.rotation.y += EARTH_ROTATION_SPEED * CLOUD_SPEED_FACTOR * dt;
  }

  /** Total surface yaw: random per-visit group offset + accumulated spin.
   *  This is the rotation lat/lon → world math must use. */
  get totalSurfaceRotationY(): number {
    return this.group.rotation.y + this.surface.rotation.y;
  }

  /** GodView grading hook: 1.0 = normal, higher = stronger glow. */
  setAtmosphereIntensity(value: number): void {
    this.atmosphereMaterial.uniforms.uIntensity.value = value;
  }

  getAtmosphereIntensity(): number {
    return this.atmosphereMaterial.uniforms.uIntensity.value as number;
  }

  /** Progressive clarity: hot-swap the day map (e.g. the 8K variant) once
   *  it has loaded in the background. Startup always uses the 2K set. */
  async upgradeDayMap(path: string): Promise<void> {
    const texture = await this.loadColorTexture(path);
    const previous = this.surfaceMaterial.uniforms.uDayMap.value as THREE.Texture | null;
    this.surfaceMaterial.uniforms.uDayMap.value = texture;
    previous?.dispose();
  }

  private async loadColorTexture(url: string): Promise<THREE.Texture> {
    const texture = await this.loader.loadAsync(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.anisotropy;
    return texture;
  }

  private applyTextures(day: THREE.Texture, night: THREE.Texture, clouds: THREE.Texture): void {
    clouds.anisotropy = this.anisotropy;
    this.surfaceMaterial.uniforms.uDayMap.value = day;
    this.surfaceMaterial.uniforms.uNightMap.value = night;
    this.cloudsMaterial.alphaMap = clouds;
    this.cloudsMaterial.needsUpdate = true;
  }
}
