import * as THREE from 'three';
import { COSMIC_STAGES, type StageEnvelope } from '../godview/cosmicStages';

// Procedural scenery for cosmic stages 2..7 (stage 1, the solar system,
// is the live SolarSystem group — main.ts scales that directly). Each
// stage is a group of points/sprites built within radius ~120, centered
// on the parent group's position (main parks it at the reveal look
// target). All content is generated — no assets.
export class CosmicScenery {
  readonly group = new THREE.Group();

  private readonly stageGroups = new Map<string, THREE.Group>();
  private readonly stageMaterials = new Map<
    string,
    Array<THREE.PointsMaterial | THREE.SpriteMaterial>
  >();

  constructor() {
    const galaxyTexture = makeGalaxyTexture();
    const builders: Record<string, (add: TrackFn) => void> = {
      'orion-arm': buildOrionArm,
      'milky-way': (add) => buildMilkyWay(add, galaxyTexture),
      'local-group': (add) => buildLocalGroup(add, galaxyTexture),
      'virgo-supercluster': (add) => buildVirgo(add, galaxyTexture),
      laniakea: buildLaniakea,
      'observable-universe': buildObservableUniverse,
    };

    for (const stage of COSMIC_STAGES) {
      const builder = builders[stage.key];
      if (!builder) continue; // solar-system stage lives elsewhere
      const stageGroup = new THREE.Group();
      stageGroup.visible = false;
      const materials: Array<THREE.PointsMaterial | THREE.SpriteMaterial> = [];
      builder((object, material) => {
        stageGroup.add(object);
        materials.push(material);
      });
      this.group.add(stageGroup);
      this.stageGroups.set(stage.key, stageGroup);
      this.stageMaterials.set(stage.key, materials);
    }
  }

  /** Drive one frame of the zoom-out. Envelopes align with COSMIC_STAGES. */
  apply(envelopes: StageEnvelope[], masterFade: number): void {
    COSMIC_STAGES.forEach((stage, i) => {
      const stageGroup = this.stageGroups.get(stage.key);
      if (!stageGroup) return;
      const opacity = envelopes[i].opacity * masterFade;
      stageGroup.visible = opacity > 0.001;
      stageGroup.scale.setScalar(envelopes[i].scale);
      for (const material of this.stageMaterials.get(stage.key) ?? []) {
        material.opacity = opacity;
      }
    });
  }

  reset(): void {
    for (const stageGroup of this.stageGroups.values()) stageGroup.visible = false;
  }
}

type TrackFn = (
  object: THREE.Object3D,
  material: THREE.PointsMaterial | THREE.SpriteMaterial,
) => void;

function makePoints(
  positions: number[],
  colors: number[],
  size: number,
): [THREE.Points, THREE.PointsMaterial] {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return [new THREE.Points(geometry, material), material];
}

const gauss = (): number =>
  (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2;

// A soft elliptical blob standing in for a whole galaxy at a distance.
function makeGalaxyTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.translate(size / 2, size / 2);
  ctx.scale(1, 0.45);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
  gradient.addColorStop(0, 'rgba(255, 250, 235, 0.95)');
  gradient.addColorStop(0.3, 'rgba(200, 210, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(160, 180, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(-size / 2, -size / 2, size, size);
  return new THREE.CanvasTexture(canvas);
}

function galaxySprite(
  texture: THREE.CanvasTexture,
  scale: number,
  position: THREE.Vector3,
  rotation: number,
): [THREE.Sprite, THREE.SpriteMaterial] {
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    rotation,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.setScalar(scale);
  sprite.position.copy(position);
  return [sprite, material];
}

// A star-dense band seen from inside: our neighborhood of the arm.
function buildOrionArm(add: TrackFn): void {
  const positions: number[] = [];
  const colors: number[] = [];
  for (let i = 0; i < 5000; i++) {
    positions.push((Math.random() - 0.5) * 240, gauss() * 14, gauss() * 45);
    const warm = 0.8 + Math.random() * 0.2;
    colors.push(warm, warm, 0.9 + Math.random() * 0.1);
  }
  add(...makePoints(positions, colors, 1.4));
}

// Two logarithmic arms + a warm bulge.
function buildMilkyWay(add: TrackFn, galaxyTexture: THREE.CanvasTexture): void {
  const positions: number[] = [];
  const colors: number[] = [];
  for (let arm = 0; arm < 2; arm++) {
    for (let i = 0; i < 3500; i++) {
      const theta = Math.random() * 4 * Math.PI;
      const r = Math.min(6 * Math.exp(0.2 * theta), 115) + gauss() * 6;
      const angle = theta + arm * Math.PI;
      positions.push(Math.cos(angle) * r, gauss() * 2.5, Math.sin(angle) * r);
      const core = 1 - Math.min(r / 120, 1) * 0.5;
      colors.push(0.9 * core + 0.3, 0.85 * core + 0.3, 1.0);
    }
  }
  add(...makePoints(positions, colors, 1.2));
  add(...galaxySprite(galaxyTexture, 55, new THREE.Vector3(0, 0, 0), 0));
}

// Milky Way + Andromeda as big blobs, dozens of dwarf-galaxy dots.
function buildLocalGroup(add: TrackFn, galaxyTexture: THREE.CanvasTexture): void {
  add(...galaxySprite(galaxyTexture, 34, new THREE.Vector3(-35, 4, -10), 0.4));
  add(...galaxySprite(galaxyTexture, 28, new THREE.Vector3(42, -8, 14), -0.7));
  for (let i = 0; i < 9; i++) {
    add(
      ...galaxySprite(
        galaxyTexture,
        4 + Math.random() * 6,
        new THREE.Vector3(gauss() * 70, gauss() * 40, gauss() * 70),
        Math.random() * Math.PI,
      ),
    );
  }
  const positions: number[] = [];
  const colors: number[] = [];
  for (let i = 0; i < 80; i++) {
    positions.push(gauss() * 90, gauss() * 50, gauss() * 90);
    colors.push(0.8, 0.85, 1.0);
  }
  add(...makePoints(positions, colors, 2.2));
}

// Clumps of hundreds of galaxies.
function buildVirgo(add: TrackFn, galaxyTexture: THREE.CanvasTexture): void {
  for (let clump = 0; clump < 6; clump++) {
    const center = new THREE.Vector3(gauss() * 75, gauss() * 45, gauss() * 75);
    for (let i = 0; i < 12; i++) {
      add(
        ...galaxySprite(
          galaxyTexture,
          1.5 + Math.random() * 3.5,
          center.clone().add(new THREE.Vector3(gauss() * 20, gauss() * 14, gauss() * 20)),
          Math.random() * Math.PI,
        ),
      );
    }
  }
  const positions: number[] = [];
  const colors: number[] = [];
  for (let i = 0; i < 600; i++) {
    positions.push(gauss() * 95, gauss() * 60, gauss() * 95);
    colors.push(0.85, 0.85, 1.0);
  }
  add(...makePoints(positions, colors, 1.6));
}

// Filaments of galaxies streaming toward the Great Attractor.
function buildLaniakea(add: TrackFn): void {
  const positions: number[] = [];
  const colors: number[] = [];
  for (let f = 0; f < 34; f++) {
    const start = new THREE.Vector3(gauss(), gauss() * 0.6, gauss()).normalize().multiplyScalar(
      90 + Math.random() * 30,
    );
    const bend = start
      .clone()
      .multiplyScalar(0.5)
      .add(new THREE.Vector3(gauss() * 22, gauss() * 14, gauss() * 22));
    for (let i = 0; i < 90; i++) {
      const t = i / 89;
      // Quadratic bezier start → bend → center, plus scatter.
      const point = start
        .clone()
        .multiplyScalar((1 - t) * (1 - t))
        .addScaledVector(bend, 2 * (1 - t) * t);
      positions.push(point.x + gauss() * 3, point.y + gauss() * 3, point.z + gauss() * 3);
      const brightness = 0.55 + 0.45 * t; // brighter toward the attractor
      colors.push(0.85 * brightness, 0.9 * brightness, brightness);
    }
  }
  add(...makePoints(positions, colors, 1.5));
}

// The cosmic web: galaxy clusters at nodes, faint scatter between.
function buildObservableUniverse(add: TrackFn): void {
  const positions: number[] = [];
  const colors: number[] = [];
  const nodes: THREE.Vector3[] = [];
  for (let n = 0; n < 70; n++) {
    nodes.push(
      new THREE.Vector3(gauss(), gauss(), gauss()).normalize().multiplyScalar(Math.random() * 115),
    );
  }
  for (const node of nodes) {
    for (let i = 0; i < 90; i++) {
      positions.push(node.x + gauss() * 7, node.y + gauss() * 7, node.z + gauss() * 7);
      const cool = 0.75 + Math.random() * 0.25;
      colors.push(0.9 * cool, 0.85 * cool, cool);
    }
  }
  for (let i = 0; i < 1600; i++) {
    const p = new THREE.Vector3(gauss(), gauss(), gauss()).normalize().multiplyScalar(
      Math.random() * 120,
    );
    positions.push(p.x, p.y, p.z);
    colors.push(0.5, 0.5, 0.65);
  }
  add(...makePoints(positions, colors, 1.1));
}
