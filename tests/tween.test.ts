import { describe, expect, test } from 'vitest';
import { Tween, easeInOutCubic } from '../src/godview/tween';

describe('easeInOutCubic', () => {
  test('maps 0 to 0 and 1 to 1', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
  });

  test('is 0.5 at the midpoint', () => {
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
  });

  test('is monotonically increasing', () => {
    let prev = -Infinity;
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const v = easeInOutCubic(Math.min(t, 1));
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
});

describe('Tween', () => {
  test('reports eased progress on update', () => {
    const values: number[] = [];
    const tween = new Tween(2, (v) => values.push(v));

    tween.update(1); // halfway
    expect(values).toEqual([easeInOutCubic(0.5)]);
  });

  test('clamps progress to 1 when overshooting the duration', () => {
    const values: number[] = [];
    const tween = new Tween(1, (v) => values.push(v));

    tween.update(5);
    expect(values).toEqual([1]);
  });

  test('returns true and fires onComplete exactly once when finished', () => {
    let completions = 0;
    const tween = new Tween(1, () => {}, { onComplete: () => completions++ });

    expect(tween.update(0.5)).toBe(false);
    expect(tween.update(0.6)).toBe(true);
    expect(tween.update(0.1)).toBe(true);
    expect(completions).toBe(1);
  });

  test('supports a custom easing function', () => {
    const values: number[] = [];
    const linear = (t: number) => t;
    const tween = new Tween(4, (v) => values.push(v), { easing: linear });

    tween.update(1);
    expect(values).toEqual([0.25]);
  });
});
