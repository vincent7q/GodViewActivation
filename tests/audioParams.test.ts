import { describe, expect, test } from 'vitest';
import {
  AMBIENT_GAIN,
  AMBIENT_AWE_GAIN,
  BINAURAL_GAIN,
  BINAURAL_LEFT_HZ,
  BINAURAL_RIGHT_HZ,
  gainTargets,
} from '../src/audio/audioParams';

describe('binaural configuration', () => {
  test('produces a 10 Hz alpha-wave beat', () => {
    expect(BINAURAL_RIGHT_HZ - BINAURAL_LEFT_HZ).toBe(10);
  });
});

describe('gainTargets', () => {
  test('exploring: quiet ambience, no binaural', () => {
    expect(gainTargets('exploring', false)).toEqual({
      ambient: AMBIENT_GAIN,
      binaural: 0,
    });
  });

  test('godview: ambience swells and binaural fades in', () => {
    const targets = gainTargets('godview', false);
    expect(targets).toEqual({ ambient: AMBIENT_AWE_GAIN, binaural: BINAURAL_GAIN });
    expect(targets.ambient).toBeGreaterThan(AMBIENT_GAIN);
  });

  test('binaural stays subtle relative to ambience', () => {
    expect(BINAURAL_GAIN).toBeLessThanOrEqual(AMBIENT_GAIN / 4);
  });

  test('mute silences everything in both states', () => {
    expect(gainTargets('exploring', true)).toEqual({ ambient: 0, binaural: 0 });
    expect(gainTargets('godview', true)).toEqual({ ambient: 0, binaural: 0 });
  });
});
