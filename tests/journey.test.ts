import { describe, expect, test } from 'vitest';
import * as THREE from 'three';
import {
  DESCEND_SECONDS,
  DOT_RADIUS,
  SKIM_RADIUS,
  buildJourney,
} from '../src/godview/journey';
import { TOUR_COUNTRIES, latLonToWorld } from '../src/godview/countries';
import { EARTH_ROTATION_SPEED } from '../src/scene/Earth';

const START = new THREE.Vector3(0, 0.4, 3.2);

describe('buildJourney', () => {
  const phases = buildJourney(START, 0.5);

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
    ]);
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
    const hold = phases[phases.length - 1];
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
