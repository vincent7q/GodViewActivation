import { describe, expect, test } from 'vitest';
import * as THREE from 'three';
import {
  PLANETS,
  SUN_DISTANCE,
  planetPosition,
} from '../src/scene/planetLayout';
import { computeRevealLook, computeRevealPosition } from '../src/godview/journey';
import { SUN_DIRECTION } from '../src/scene/Lighting';

describe('PLANETS', () => {
  test('lists the seven bodies sunward-out of the arc', () => {
    expect(PLANETS.map((p) => p.name)).toEqual([
      'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune',
    ]);
  });
});

describe('planetPosition', () => {
  const positions = PLANETS.map((p) => planetPosition(p));

  test('places each planet at its distance along the sun axis', () => {
    PLANETS.forEach((spec, i) => {
      expect(positions[i].dot(SUN_DIRECTION)).toBeCloseTo(spec.distance);
    });
  });

  test('keeps the whole arc between Earth and the sun sprite', () => {
    for (const pos of positions) {
      expect(pos.length()).toBeGreaterThan(40);
      expect(pos.length()).toBeLessThan(SUN_DISTANCE);
    }
  });

  test('every planet is inside the landscape reveal frame', () => {
    const cam = computeRevealPosition();
    const view = computeRevealLook(16 / 9).clone().sub(cam);
    for (const pos of positions) {
      const toPlanet = pos.clone().sub(cam);
      expect(view.angleTo(toPlanet)).toBeLessThan(THREE.MathUtils.degToRad(38));
    }
  });

  test('no two planets overlap', () => {
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const minGap = (PLANETS[i].radius + PLANETS[j].radius) * 2;
        expect(positions[i].distanceTo(positions[j])).toBeGreaterThan(minGap);
      }
    }
  });
});
