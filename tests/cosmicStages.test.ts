import { describe, expect, test } from 'vitest';
import {
  COSMIC_STAGES,
  COSMIC_TOTAL_SECONDS,
  EARTH_INFO,
  stageEnvelopes,
} from '../src/godview/cosmicStages';

describe('COSMIC_STAGES', () => {
  test('runs solar system → observable universe in the owner’s order', () => {
    expect(COSMIC_STAGES.map((s) => s.key)).toEqual([
      'solar-system',
      'orion-arm',
      'milky-way',
      'local-group',
      'virgo-supercluster',
      'laniakea',
      'observable-universe',
    ]);
  });

  test('every stage carries bilingual names and a description', () => {
    for (const stage of COSMIC_STAGES) {
      expect(stage.nameEn.length).toBeGreaterThan(0);
      expect(stage.nameZh.length).toBeGreaterThan(0);
      expect(stage.description.length).toBeGreaterThan(0);
      expect(stage.duration).toBeGreaterThan(0);
    }
  });

  test('total duration is the sum of the stages', () => {
    const sum = COSMIC_STAGES.reduce((acc, s) => acc + s.duration, 0);
    expect(COSMIC_TOTAL_SECONDS).toBe(sum);
  });

  test('EARTH_INFO is the homecoming card', () => {
    expect(EARTH_INFO.nameZh).toBe('地球');
    expect(EARTH_INFO.nameEn).toBe('Earth');
    expect(EARTH_INFO.description.length).toBeGreaterThan(0);
  });
});

describe('stageEnvelopes', () => {
  const last = COSMIC_STAGES.length - 1;

  test('starts with the solar system fully visible at natural scale', () => {
    const envs = stageEnvelopes(0);
    expect(envs).toHaveLength(COSMIC_STAGES.length);
    expect(envs[0].opacity).toBe(1);
    expect(envs[0].scale).toBeCloseTo(1);
    for (let i = 1; i < envs.length; i++) expect(envs[i].opacity).toBe(0);
  });

  test('the active stage shrinks as time passes', () => {
    const early = stageEnvelopes(3)[0].scale;
    const late = stageEnvelopes(12)[0].scale;
    expect(late).toBeLessThan(early);
    expect(late).toBeGreaterThan(0);
  });

  test('adjacent stages crossfade at the boundary', () => {
    // Stage 0 ends at 15s; 1s later both stage 0 (fading out) and
    // stage 1 (fading in) must be partially visible.
    const envs = stageEnvelopes(16);
    expect(envs[0].opacity).toBeGreaterThan(0);
    expect(envs[0].opacity).toBeLessThan(1);
    expect(envs[1].opacity).toBeGreaterThan(0);
  });

  test('a stage not yet reached stays at full scale, invisible', () => {
    const envs = stageEnvelopes(5);
    expect(envs[3].opacity).toBe(0);
    expect(envs[3].scale).toBeCloseTo(1);
  });

  test('the last stage holds — full opacity, no shrink — through the end', () => {
    const envs = stageEnvelopes(COSMIC_TOTAL_SECONDS);
    expect(envs[last].opacity).toBe(1);
    expect(envs[last].scale).toBeCloseTo(1);
    for (let i = 0; i < last; i++) expect(envs[i].opacity).toBe(0);
  });
});
