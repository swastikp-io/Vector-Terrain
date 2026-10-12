import { describe, it, expect } from 'vitest';
import { createRandom } from '../src/engine/core/random';

describe('SeededRandom PRNG', () => {
  it('produces identical sequences for the same seed', () => {
    const rng1 = createRandom(42);
    const rng2 = createRandom(42);

    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());

    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = createRandom(101);
    const rng2 = createRandom(202);

    const val1 = rng1.next();
    const val2 = rng2.next();

    expect(val1).not.toBe(val2);
  });

  it('respects range boundaries', () => {
    const rng = createRandom(999);
    for (let i = 0; i < 100; i++) {
      const val = rng.range(10, 20);
      expect(val).toBeGreaterThanOrEqual(10);
      expect(val).toBeLessThan(20);
    }
  });

  it('generates integers within [min, max] inclusive', () => {
    const rng = createRandom(777);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) {
      const val = rng.int(1, 5);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(5);
      seen.add(val);
    }
    expect(seen.size).toBe(5);
  });

  it('generates smooth deterministic 2D noise', () => {
    const rng1 = createRandom(1234);
    const rng2 = createRandom(1234);

    const n1 = rng1.noise2D(3.5, 4.2);
    const n2 = rng2.noise2D(3.5, 4.2);

    expect(n1).toBe(n2);
    expect(n1).toBeGreaterThanOrEqual(-1.5);
    expect(n1).toBeLessThanOrEqual(1.5);
  });
});
