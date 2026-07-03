import * as THREE from 'three';
import { SceneManager, detectQuality } from './scene/SceneManager';
import { createLighting } from './scene/Lighting';
import { createStarfield } from './scene/Starfield';
import { Earth, ATMOSPHERE_BASE_INTENSITY } from './scene/Earth';
import { ExploreControls } from './camera/ExploreControls';
import { GodViewTransition } from './camera/GodViewTransition';
import { GodViewMode } from './godview/GodViewMode';
import { JourneyPlayer, buildJourney, DESCEND_SECONDS } from './godview/journey';
import { QUOTES, QuoteRotation, REVEAL_QUOTE } from './godview/quotes';
import { SolarSystem } from './scene/SolarSystem';
import { Tween } from './godview/tween';
import { AudioEngine } from './audio/AudioEngine';
import { showWelcomeScreen } from './ui/WelcomeScreen';
import { Hud } from './ui/Hud';
import { QuoteOverlay } from './ui/QuoteOverlay';
import { CountryCaption } from './ui/CountryCaption';

const RETURN_SECONDS = 12;
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

  const anisotropy = Math.min(
    manager.renderer.capabilities.getMaxAnisotropy(),
    quality.anisotropyCap,
  );
  const earth = new Earth(quality.sphereSegments, anisotropy);
  manager.scene.add(earth.group);
  await earth.load();

  const solar = new SolarSystem();
  manager.scene.add(solar.group);
  void solar.load(); // in the background — needed ~100s in, at the reveal

  if (quality.highResDayMap && manager.renderer.capabilities.maxTextureSize >= 8192) {
    void earth.upgradeDayMap('/textures/8k_earth_daymap.jpg');
  }

  const controls = new ExploreControls(manager.camera, canvas);
  const transition = new GodViewTransition(manager.camera);
  const mode = new GodViewMode();
  const audio = new AudioEngine();
  const quotes = new QuoteRotation(QUOTES);
  const quoteOverlay = new QuoteOverlay(uiRoot);
  const hud = new Hud(uiRoot);
  const caption = new CountryCaption(uiRoot);

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
  let journey: JourneyPlayer | null = null;

  const fadeSolar = (to: number, seconds: number): void => {
    const from = solar.opacity;
    gradingTweens.push(
      new Tween(seconds, (v) => solar.setOpacity(THREE.MathUtils.lerp(from, to, v))),
    );
  };

  mode.on('enterStart', () => {
    restorePosition.copy(manager.camera.position);
    controls.enabled = false;
    hud.setGodViewActive(true);
    audio.setMood('godview');
    rampGrading(GODVIEW_EXPOSURE, GODVIEW_ATMOSPHERE, DESCEND_SECONDS);
    journey = new JourneyPlayer(
      buildJourney(manager.camera.position, earth.totalSurfaceRotationY, manager.camera.aspect),
      {
        onPhase: (phase) => {
          if (phase.kind === 'dwell') {
            caption.show(phase.country ?? '');
            mode.notifyTransitionComplete(); // settles on the first dwell; no-op after
          } else if (phase.kind === 'ascend') {
            caption.hide();
          } else if (phase.kind === 'ascend-quote') {
            quoteOverlay.show(quotes.next());
          } else if (phase.kind === 'reveal') {
            fadeSolar(1, 4);
            quoteOverlay.show(REVEAL_QUOTE);
          }
        },
        onComplete: () => mode.requestExit(),
      },
    );
  });

  mode.on('exitStart', () => {
    const lookFrom = journey?.lookTarget.clone();
    journey?.stop();
    journey = null;
    caption.hide();
    quoteOverlay.hide();
    audio.setMood('exploring');
    // rampGrading clears the tween list, so it must run before fadeSolar.
    rampGrading(1.0, ATMOSPHERE_BASE_INTENSITY, RETURN_SECONDS);
    fadeSolar(0, 3);
    transition.flyTo(restorePosition, RETURN_SECONDS, () => mode.notifyTransitionComplete(), lookFrom);
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
    if (journey) {
      const player = journey; // onComplete may null `journey` mid-update
      const pos = player.update(dt);
      if (pos) {
        manager.camera.position.copy(pos);
        manager.camera.lookAt(player.lookTarget);
      }
    }
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
