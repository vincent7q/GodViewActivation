import { describe, expect, test } from 'vitest';
import * as THREE from 'three';
import { TOUR_COUNTRIES, latLonToWorld } from '../src/godview/countries';

describe('TOUR_COUNTRIES', () => {
  test('visits the four MVP countries in order', () => {
    expect(TOUR_COUNTRIES.map((c) => c.name)).toEqual([
      'Australia',
      'China',
      'Japan',
      'United States',
    ]);
  });

  test('uses plausible coordinates', () => {
    for (const { lat, lon } of TOUR_COUNTRIES) {
      expect(Math.abs(lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(lon)).toBeLessThanOrEqual(180);
    }
    expect(TOUR_COUNTRIES[0].lat).toBeLessThan(0); // Australia: southern hemisphere
    expect(TOUR_COUNTRIES[3].lon).toBeLessThan(0); // USA: western hemisphere
  });
});

describe('latLonToWorld', () => {
  test('honors the requested radius', () => {
    expect(latLonToWorld(35, 104, 0.7, 1.3).length()).toBeCloseTo(1.3);
    expect(latLonToWorld(-25, 134, 2.1, 55).length()).toBeCloseTo(55);
  });

  test('puts the north pole on +Y regardless of rotation', () => {
    for (const rotation of [0, 1.234, Math.PI]) {
      const p = latLonToWorld(90, 0, rotation, 2);
      expect(p.distanceTo(new THREE.Vector3(0, 2, 0))).toBeLessThan(1e-6);
    }
  });

  test('keeps equator points at y = 0', () => {
    expect(latLonToWorld(0, 77, 0.4, 1).y).toBeCloseTo(0);
  });

  test('rotating the surface by Δ equals shifting longitude east by Δ', () => {
    const delta = Math.PI / 2;
    const rotated = latLonToWorld(0, 0, delta, 1);
    const shifted = latLonToWorld(0, THREE.MathUtils.radToDeg(delta), 0, 1);
    expect(rotated.distanceTo(shifted)).toBeLessThan(1e-6);
  });

  test('separates two distant countries by a real angle', () => {
    const australia = latLonToWorld(-25.3, 134.5, 0, 1);
    const usa = latLonToWorld(39.8, -98.6, 0, 1);
    expect(australia.angleTo(usa)).toBeGreaterThan(1.5); // ~86°+ apart
  });
});
