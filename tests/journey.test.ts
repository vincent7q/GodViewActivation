import { describe, expect, test } from 'vitest';
import * as THREE from 'three';
import {
  DESCEND_SECONDS,
  DOT_RADIUS,
  JourneyPlayer,
  REVEAL_RADIUS,
  SKIM_RADIUS,
  buildJourney,
  computeRevealLook,
  computeRevealPosition,
} from '../src/godview/journey';
import { TOUR_COUNTRIES, latLonToWorld } from '../src/godview/countries';
import { COSMIC_STAGES, COSMIC_TOTAL_SECONDS } from '../src/godview/cosmicStages';
import { EARTH_ROTATION_SPEED } from '../src/scene/Earth';
import { SUN_DIRECTION } from '../src/scene/Lighting';

const START = new THREE.Vector3(0, 0.4, 3.2);

describe('buildJourney', () => {
  const phases = buildJourney(START, 0.5, 16 / 9);

  test('produces the full beat sequence', () => {
    expect(phases.map((p) => p.kind)).toEqual([
      'descend',
      'dwell',
      'leg',
      'dwell',
      'leg',
      'dwell',
      'leg',
      'dwell',
      'ascend',
      'ascend-quote',
      'hold',
      'cosmic',
      'cosmic',
      'cosmic',
      'cosmic',
      'cosmic',
      'cosmic',
      'cosmic',
    ]);
  });

  test('cosmic phases carry the stage keys in ladder order', () => {
    const cosmic = phases.filter((p) => p.kind === 'cosmic');
    expect(cosmic.map((p) => p.stage)).toEqual(COSMIC_STAGES.map((s) => s.key));
    cosmic.forEach((p, i) => expect(p.duration).toBe(COSMIC_STAGES[i].duration));
  });

  test('names the dwell captions in tour order', () => {
    const dwells = phases.filter((p) => p.kind === 'dwell');
    expect(dwells.map((p) => p.country)).toEqual(TOUR_COUNTRIES.map((c) => c.name));
  });

  test('starts exactly where the camera is', () => {
    expect(phases[0].from.distanceTo(START)).toBeLessThan(1e-6);
  });

  test('is continuous: each phase starts where the previous ended', () => {
    for (let i = 1; i < phases.length; i++) {
      expect(phases[i].from.distanceTo(phases[i - 1].to)).toBeLessThan(1e-6);
    }
  });

  test('flies the flyover at skim altitude and the hold at dot distance', () => {
    for (const p of phases.filter((p) => p.kind === 'dwell')) {
      expect(p.to.length()).toBeCloseTo(SKIM_RADIUS);
    }
    const hold = phases.find((p) => p.kind === 'hold')!;
    expect(hold.to.length()).toBeCloseTo(DOT_RADIUS);
    expect(hold.from.distanceTo(hold.to)).toBeLessThan(1e-6); // it's a hold
  });

  test('predicts surface rotation at each arrival time for waypoints', () => {
    const australia = TOUR_COUNTRIES[0];
    const expected = latLonToWorld(
      australia.lat,
      australia.lon,
      0.5 + EARTH_ROTATION_SPEED * DESCEND_SECONDS,
      SKIM_RADIUS,
    );
    expect(phases[0].to.distanceTo(expected)).toBeLessThan(1e-6);
  });

  test('ascends radially: the pull-back never changes direction', () => {
    const ascend = phases.find((p) => p.kind === 'ascend')!;
    const ascendQuote = phases.find((p) => p.kind === 'ascend-quote')!;
    const dir = ascend.from.clone().normalize();
    expect(ascend.to.clone().normalize().distanceTo(dir)).toBeLessThan(1e-6);
    expect(ascendQuote.to.clone().normalize().distanceTo(dir)).toBeLessThan(1e-6);
  });
});

describe('JourneyPlayer', () => {
  const drive = (player: JourneyPlayer, seconds: number, step = 0.1): THREE.Vector3 | null => {
    let last: THREE.Vector3 | null = null;
    for (let t = 0; t < seconds; t += step) {
      const pos = player.update(step);
      if (pos) last = pos.clone();
    }
    return last;
  };

  test('announces the first phase on the first update', () => {
    const seen: string[] = [];
    const player = new JourneyPlayer(buildJourney(START, 0, 16 / 9), {
      onPhase: (p) => seen.push(p.kind),
    });
    player.update(0.016);
    expect(seen).toEqual(['descend']);
  });

  test('fires every phase once, in order, then onComplete exactly once', () => {
    const seen: string[] = [];
    let completions = 0;
    const player = new JourneyPlayer(buildJourney(START, 0, 16 / 9), {
      onPhase: (p) => seen.push(p.kind),
      onComplete: () => completions++,
    });
    drive(player, 90 + COSMIC_TOTAL_SECONDS); // outbound is 75s + cosmic
    expect(seen).toEqual([
      'descend', 'dwell', 'leg', 'dwell', 'leg', 'dwell', 'leg', 'dwell',
      'ascend', 'ascend-quote', 'hold',
      'cosmic', 'cosmic', 'cosmic', 'cosmic', 'cosmic', 'cosmic', 'cosmic',
    ]);
    expect(completions).toBe(1);
    expect(player.active).toBe(false);
    expect(player.update(0.1)).toBeNull();
  });

  test('ends exactly at the reveal vantage', () => {
    const phases = buildJourney(START, 0, 16 / 9);
    const player = new JourneyPlayer(phases);
    const last = drive(player, 90 + COSMIC_TOTAL_SECONDS);
    expect(last!.distanceTo(phases[phases.length - 1].to)).toBeLessThan(1e-6);
  });

  test('never dips below the explore minimum distance (no globe clipping)', () => {
    const player = new JourneyPlayer(buildJourney(START, 1.7, 16 / 9));
    for (let t = 0; t < 90 + COSMIC_TOTAL_SECONDS; t += 0.1) {
      const pos = player.update(0.1);
      if (pos) expect(pos.length()).toBeGreaterThanOrEqual(1.25 - 1e-9);
    }
  });

  test('reaches each dwell waypoint when the dwell begins', () => {
    let current: THREE.Vector3 | null = null;
    const phases = buildJourney(START, 0, 16 / 9);
    const player = new JourneyPlayer(phases, {
      onPhase: (p) => {
        if (p.kind === 'dwell') {
          // Camera is (numerically) at the waypoint as the caption fires.
          expect(current!.distanceTo(p.from)).toBeLessThan(0.05);
        }
      },
    });
    for (let t = 0; t < 90; t += 0.05) {
      const pos = player.update(0.05);
      if (pos) current = pos.clone();
    }
  });

  test('stop() halts the journey immediately', () => {
    const player = new JourneyPlayer(buildJourney(START, 0, 16 / 9));
    player.update(1);
    player.stop();
    expect(player.active).toBe(false);
    expect(player.update(0.1)).toBeNull();
  });
});

describe('cosmic finale', () => {
  const phases = buildJourney(START, 0.5, 16 / 9);
  const firstCosmic = phases.find((p) => p.kind === 'cosmic')!;

  test('flies to the reveal vantage, continuous with the hold, then holds there', () => {
    expect(firstCosmic.stage).toBe('solar-system');
    expect(firstCosmic.to.length()).toBeCloseTo(REVEAL_RADIUS);
    const holdIndex = phases.findIndex((p) => p.kind === 'cosmic') - 1;
    expect(firstCosmic.from.distanceTo(phases[holdIndex].to)).toBeLessThan(1e-6);
    // Every later cosmic phase parks at the same vantage.
    for (const p of phases.filter((p) => p.kind === 'cosmic').slice(1)) {
      expect(p.from.distanceTo(firstCosmic.to)).toBeLessThan(1e-6);
      expect(p.to.distanceTo(firstCosmic.to)).toBeLessThan(1e-6);
    }
  });

  test('frames Earth and the sun axis on landscape screens', () => {
    const cam = computeRevealPosition();
    const view = computeRevealLook(16 / 9).clone().sub(cam);
    const toEarth = cam.clone().negate();
    const toSun = SUN_DIRECTION.clone().multiplyScalar(350).sub(cam);
    expect(view.angleTo(toEarth)).toBeLessThan(THREE.MathUtils.degToRad(35));
    expect(view.angleTo(toSun)).toBeLessThan(THREE.MathUtils.degToRad(35));
  });

  test('portrait screens keep the look target near Earth', () => {
    const portrait = computeRevealLook(9 / 16);
    const landscape = computeRevealLook(16 / 9);
    expect(portrait.length()).toBeLessThan(landscape.length());
    // Both sit on the sun axis.
    expect(portrait.clone().normalize().distanceTo(SUN_DIRECTION)).toBeLessThan(1e-6);
    expect(landscape.clone().normalize().distanceTo(SUN_DIRECTION)).toBeLessThan(1e-6);
  });

  test('the player eases its look target from the origin to the reveal look', () => {
    const player = new JourneyPlayer(buildJourney(START, 0, 16 / 9));
    const drive = (seconds: number): void => {
      for (let t = 0; t < seconds; t += 0.1) player.update(0.1);
    };
    expect(player.lookTarget.length()).toBe(0);
    drive(80); // into the first cosmic phase (starts at 75s)
    expect(player.lookTarget.length()).toBeGreaterThan(0);
    drive(20 + COSMIC_TOTAL_SECONDS); // finish
    expect(player.lookTarget.distanceTo(computeRevealLook(16 / 9))).toBeLessThan(1e-6);
  });
});
