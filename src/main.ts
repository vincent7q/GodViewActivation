import * as THREE from 'three';
import { SceneManager, detectQuality } from './scene/SceneManager';
import { createLighting } from './scene/Lighting';
import { createStarfield } from './scene/Starfield';
import { Earth, ATMOSPHERE_BASE_INTENSITY } from './scene/Earth';
import { ExploreControls } from './camera/ExploreControls';
import { GodViewTransition, computeHeroPosition } from './camera/GodViewTransition';
import { GodViewMode } from './godview/GodViewMode';
import { QUOTES, QuoteRotation } from './godview/quotes';
import { Tween } from './godview/tween';
import { AudioEngine } from './audio/AudioEngine';
import { showWelcomeScreen } from './ui/WelcomeScreen';
import { Hud } from './ui/Hud';
import { QuoteOverlay } from './ui/QuoteOverlay';

const FLIGHT_SECONDS = 6;
const RETURN_SECONDS = 4;
const GODVIEW_EXPOSURE = 1.35;
const GODVIEW_ATMOSPHERE = 2.1;

async function bootstrap(): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>('#scene');
  const uiRoot = document.querySelector<HTMLElement>('#ui-root');
  if (!canvas || !uiRoot) throw new Error('Missing #scene canvas or #ui-root');

  // Show the priming screen immediately; build the world behind it.
  const welcomeDone = showWelcomeScreen(uiRoot);

  const quality = detectQuality();
  const manager = new SceneManager(canvas, quality);
  manager.scene.add(createLighting());
  manager.scene.add(createStarfield(quality.starCount));

  const earth = new Earth(quality.sphereSegments);
  manager.scene.add(earth.group);
  await earth.load(quality.highResTextures);

  const controls = new ExploreControls(manager.camera, canvas);
  const transition = new GodViewTransition(manager.camera);
  const mode = new GodViewMode();
  const audio = new AudioEngine();
  const quotes = new QuoteRotation(QUOTES);
  const quoteOverlay = new QuoteOverlay(uiRoot);
  const hud = new Hud(uiRoot);

  // --- grading (exposure + atmosphere glow) -------------------------
  const gradingTweens: Tween[] = [];
  const rampGrading = (toExposure: number, toAtmosphere: number, seconds: number): void => {
    const fromExposure = manager.getExposure();
    const fromAtmosphere = earth.getAtmosphereIntensity();
    gradingTweens.length = 0;
    gradingTweens.push(
      new Tween(seconds, (v) => {
        manager.setExposure(THREE.MathUtils.lerp(fromExposure, toExposure, v));
        earth.setAtmosphereIntensity(THREE.MathUtils.lerp(fromAtmosphere, toAtmosphere, v));
      }),
    );
  };

  // --- GodView orchestration -----------------------------------------
  const restorePosition = new THREE.Vector3();

  mode.on('enterStart', () => {
    restorePosition.copy(manager.camera.position);
    controls.enabled = false;
    hud.setGodViewActive(true);
    audio.setMood('godview');
    rampGrading(GODVIEW_EXPOSURE, GODVIEW_ATMOSPHERE, FLIGHT_SECONDS);
    transition.flyTo(computeHeroPosition(), FLIGHT_SECONDS, () =>
      mode.notifyTransitionComplete(),
    );
  });

  mode.on('settled', () => {
    quoteOverlay.show(quotes.next());
  });

  mode.on('exitStart', () => {
    quoteOverlay.hide();
    audio.setMood('exploring');
    rampGrading(1.0, ATMOSPHERE_BASE_INTENSITY, RETURN_SECONDS);
    transition.flyTo(restorePosition, RETURN_SECONDS, () => mode.notifyTransitionComplete());
  });

  mode.on('returned', () => {
    controls.enabled = true;
    hud.setGodViewActive(false);
  });

  // --- inputs ---------------------------------------------------------
  hud.onGodView(() => mode.toggle());
  hud.onMute(() => hud.setMuted(audio.toggleMute()));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') mode.requestExit();
  });
  canvas.addEventListener('pointerdown', () => mode.requestExit());

  // --- frame loop -------------------------------------------------------
  manager.onUpdate((dt) => {
    earth.update(dt);
    transition.update(dt);
    for (let i = gradingTweens.length - 1; i >= 0; i--) {
      if (gradingTweens[i].update(dt)) gradingTweens.splice(i, 1);
    }
    // OrbitControls.update() repositions the camera, so it must not run
    // while a flight or GodView owns it.
    if (mode.state === 'exploring') controls.update();
  });
  manager.start();

  await welcomeDone;
  await audio.start();
}

void bootstrap();
