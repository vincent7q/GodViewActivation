import { describe, expect, test } from 'vitest';
import { QUOTES, QuoteRotation } from '../src/godview/quotes';

describe('QUOTES', () => {
  test('contains at least three quotes with text and author', () => {
    expect(QUOTES.length).toBeGreaterThanOrEqual(3);
    for (const quote of QUOTES) {
      expect(quote.text.length).toBeGreaterThan(0);
      expect(quote.author.length).toBeGreaterThan(0);
    }
  });
});

describe('QuoteRotation', () => {
  const sample = [
    { text: 'a', author: 'A' },
    { text: 'b', author: 'B' },
    { text: 'c', author: 'C' },
  ];

  test('returns quotes in order', () => {
    const rotation = new QuoteRotation(sample);
    expect(rotation.next().text).toBe('a');
    expect(rotation.next().text).toBe('b');
    expect(rotation.next().text).toBe('c');
  });

  test('wraps around after the last quote', () => {
    const rotation = new QuoteRotation(sample);
    for (let i = 0; i < sample.length; i++) rotation.next();
    expect(rotation.next().text).toBe('a');
  });

  test('handles a single-quote list', () => {
    const rotation = new QuoteRotation([{ text: 'only', author: 'X' }]);
    expect(rotation.next().text).toBe('only');
    expect(rotation.next().text).toBe('only');
  });
});
