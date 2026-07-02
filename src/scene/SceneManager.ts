import * as THREE from 'three';

export interface QualitySettings {
  sphereSegments: number;
  maxPixelRatio: number;
  highResTextures: boolean;
  starCount: number;
}

export function detectQuality(): QualitySettings {
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);
  return isMobile
    ? { sphereSegments: 64, maxPixelRatio: 1.5, highResTextures: false, starCount: 4000 }
    : { sphereSegments: 128, maxPixelRatio: 2, highResTextures: true, starCount: 8000 };
}

export type UpdateFn = (dt: number, elapsed: number) => void;

export class SceneManager {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly quality: QualitySettings;

  private readonly updatables: UpdateFn[] = [];
  private lastFrameTime: number | null = null;

  constructor(canvas: HTMLCanvasElement, quality: QualitySettings = detectQuality()) {
    this.quality = quality;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxPixelRatio));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01,
      2000,
    );
    this.camera.position.set(0, 0.4, 3.2);

    window.addEventListener('resize', this.onResize);
  }

  onUpdate(fn: UpdateFn): void {
    this.updatables.push(fn);
  }

  start(): void {
    this.renderer.setAnimationLoop((timeMs) => {
      const dt =
        this.lastFrameTime === null ? 0 : Math.min((timeMs - this.lastFrameTime) / 1000, 0.1);
      this.lastFrameTime = timeMs;
      for (const fn of this.updatables) fn(dt, timeMs / 1000);
      this.renderer.render(this.scene, this.camera);
    });
  }

  setExposure(value: number): void {
    this.renderer.toneMappingExposure = value;
  }

  getExposure(): number {
    return this.renderer.toneMappingExposure;
  }

  private onResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
}
