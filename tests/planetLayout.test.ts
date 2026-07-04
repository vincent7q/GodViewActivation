import { describe, expect, test } from 'vitest';
import * as THREE from 'three';
import {
  MOON_ORBIT_RADIUS,
  PLANETS,
  SUN_DISTANCE,
  moonPosition,
  planetPosition,
  sunPosition,
} from '../src/scene/planetLayout';
import { SUN_DIRECTION } from '../src/scene/Lighting';

const SAMPLE_TIMES = [0, 30, 137, 512, 1999, 5000];

describe('PLANETS', () => {
  test('lists all nine planets, Mercury out to Pluto', () => {
    expect(PLANETS.map((p) => p.name)).toEqual([
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
      'Uranus',
      'Neptune',
      'Pluto',
    ]);
  });

  test('inner planets orbit faster than outer ones', () => {
    for (let i = 1; i < PLANETS.length; i++) {
      expect(PLANETS[i].periodSeconds).toBeGreaterThan(PLANETS[i - 1].periodSeconds);
    }
  });
});

describe('planetPosition', () => {
  const sun = sunPosition();

  test('the sun sits at SUN_DISTANCE along the sun axis', () => {
    expect(sun.distanceTo(SUN_DIRECTION.clone().multiplyScalar(SUN_DISTANCE))).toBeLessThan(1e-9);
  });

  test('each planet keeps a constant distance from the sun (circular orbit)', () => {
    for (const spec of PLANETS) {
      for (const t of SAMPLE_TIMES) {
        expect(planetPosition(spec, t).distanceTo(sun)).toBeCloseTo(spec.orbitRadius);
      }
    }
  });

  test('orbits actually move: position changes over a quarter period', () => {
    for (const spec of PLANETS) {
      const a = planetPosition(spec, 0);
      const b = planetPosition(spec, spec.periodSeconds / 4);
      expect(a.distanceTo(b)).toBeGreaterThan(spec.orbitRadius * 0.5);
    }
  });

  test('one full period returns the planet to its start', () => {
    const spec = PLANETS[0];
    const a = planetPosition(spec, 0);
    const b = planetPosition(spec, spec.periodSeconds);
    expect(a.distanceTo(b)).toBeLessThan(1e-6);
  });

  test('no planet ever comes within 100 units of Earth (the origin)', () => {
    for (const spec of PLANETS) {
      // Worst case on a circle: |SUN_DISTANCE - orbitRadius|.
      expect(Math.abs(SUN_DISTANCE - spec.orbitRadius)).toBeGreaterThanOrEqual(100);
      for (const t of SAMPLE_TIMES) {
        expect(planetPosition(spec, t).length()).toBeGreaterThanOrEqual(100);
      }
    }
  });

  test('orbits stay in one plane through the sun', () => {
    const e1 = SUN_DIRECTION.clone();
    const e2 = new THREE.Vector3().crossVectors(SUN_DIRECTION, new THREE.Vector3(0, 1, 0)).normalize();
    const normal = new THREE.Vector3().crossVectors(e1, e2).normalize();
    for (const spec of PLANETS) {
      for (const t of SAMPLE_TIMES) {
        const fromSun = planetPosition(spec, t).sub(sunPosition());
        expect(Math.abs(fromSun.dot(normal))).toBeLessThan(1e-6);
      }
    }
  });
});

describe('moonPosition', () => {
  test('the moon circles Earth at its orbit radius', () => {
    for (const t of SAMPLE_TIMES) {
      expect(moonPosition(t).length()).toBeCloseTo(MOON_ORBIT_RADIUS);
    }
  });

  test('the moon moves', () => {
    expect(moonPosition(0).distanceTo(moonPosition(60))).toBeGreaterThan(0.5);
  });
});
