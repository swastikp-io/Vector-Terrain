/**
 * Deterministic PRNG and Perlin 2D noise generator.
 * Uses Mulberry32 and SplitMix32 for rock-solid reproducible procedural art.
 */

export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = this.splitmix32(Math.floor(seed) || 123456789);
  }

  private splitmix32(seed: number): number {
    let z = (seed + 0x9e3779b9) | 0;
    z ^= z >>> 16;
    z = Math.imul(z, 0x21f0aaad);
    z ^= z >>> 15;
    z = Math.imul(z, 0x735a2d97);
    z ^= z >>> 15;
    return z >>> 0;
  }

  /**
   * Generates a pseudo-random float between 0 (inclusive) and 1 (exclusive).
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    this.state = t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates a float in [min, max).
   */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generates an integer in [min, max].
   */
  int(min: number, max: number): number {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return Math.floor(this.range(lo, hi + 1));
  }

  /**
   * Returns true with given probability.
   */
  boolean(chance = 0.5): boolean {
    return this.next() < chance;
  }

  /**
   * Box-Muller transform for normal distribution.
   */
  gaussian(mean = 0, std = 1): number {
    let u = 0;
    let v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + num * std;
  }

  /**
   * Selects a random element from an array.
   */
  choice<T>(items: T[]): T {
    if (!items.length) {
      throw new Error('Cannot select choice from empty array');
    }
    const idx = Math.floor(this.next() * items.length);
    return items[idx];
  }

  /**
   * Deterministically shuffles an array in place (Fisher-Yates).
   */
  shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  /**
   * Deterministic 2D smooth gradient noise in [-1, 1].
   */
  noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = this.fade(xf);
    const v = this.fade(yf);

    const aa = this.permHash(X, Y);
    const ab = this.permHash(X, Y + 1);
    const ba = this.permHash(X + 1, Y);
    const bb = this.permHash(X + 1, Y + 1);

    const x1 = this.lerp(this.grad2D(aa, xf, yf), this.grad2D(ba, xf - 1, yf), u);
    const x2 = this.lerp(this.grad2D(ab, xf, yf - 1), this.grad2D(bb, xf - 1, yf - 1), u);

    return this.lerp(x1, x2, v);
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private permHash(x: number, y: number): number {
    let h = (x * 374761393 + y * 668265263 + (this.state & 0xffff)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) & 255;
  }

  private grad2D(hash: number, x: number, y: number): number {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
}

export function createRandom(seed: number): SeededRandom {
  return new SeededRandom(seed);
}
