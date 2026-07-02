import { SceneManager, detectQuality } from './scene/SceneManager';
import { createLighting } from './scene/Lighting';
import { createStarfield } from './scene/Starfield';
import { Earth } from './scene/Earth';
import { ExploreControls } from './camera/ExploreControls';

async function bootstrap(): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>('#scene');
  if (!canvas) throw new Error('Missing #scene canvas');

  const quality = detectQuality();
  const manager = new SceneManager(canvas, quality);

  manager.scene.add(createLighting());
  manager.scene.add(createStarfield(quality.starCount));

  const earth = new Earth(quality.sphereSegments);
  manager.scene.add(earth.group);
  await earth.load(quality.highResTextures);

  const controls = new ExploreControls(manager.camera, canvas);

  manager.onUpdate((dt) => {
    earth.update(dt);
    controls.update();
  });
  manager.start();
}

void bootstrap();
