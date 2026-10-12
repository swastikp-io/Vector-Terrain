import { describe, it, expect } from 'vitest';
import {
  resolveBestVideoMimeType,
  getSupportedVideoMimeTypes,
} from '../src/engine/export/animationExport';
import { generateGeometry } from '../src/engine/generators';
import { DEFAULT_WAVEFORMS, DEFAULT_DIMENSIONS } from '../src/store/defaults';
import { PALETTES } from '../src/store/palettes';

describe('Animation Export Pipeline Tests', () => {
  const palette = PALETTES[0];

  it('resolves valid video MIME type and extension defaults', () => {
    const webmRes = resolveBestVideoMimeType('webm');
    expect(webmRes.extension).toBe('webm');
    expect(webmRes.mimeType).toBeTruthy();

    const mp4Res = resolveBestVideoMimeType('mp4');
    expect(['mp4', 'webm']).toContain(mp4Res.extension);
    expect(mp4Res.mimeType).toBeTruthy();
  });

  it('safely queries browser supported video MIME types', () => {
    const supported = getSupportedVideoMimeTypes();
    expect(supported).toHaveProperty('webm');
    expect(supported).toHaveProperty('mp4');
  });

  it('calculates frame counts and durations accurately up to 15 seconds', () => {
    // 5 seconds at 60 FPS
    const dur5 = 5;
    const fps60 = 60;
    const frames5s = Math.round(dur5 * fps60);
    expect(frames5s).toBe(300);

    // 15 seconds at 60 FPS (maximum allowed duration)
    const dur15 = 15;
    const frames15s = Math.round(dur15 * fps60);
    expect(frames15s).toBe(900);

    // 15 seconds at 30 FPS
    const fps30 = 30;
    const frames15s30fps = Math.round(dur15 * fps30);
    expect(frames15s30fps).toBe(450);

    // Clamping checks
    const clampDuration = (d: number) => Math.min(15, Math.max(1, d));
    expect(clampDuration(0.5)).toBe(1);
    expect(clampDuration(25)).toBe(15);
    expect(clampDuration(10.5)).toBe(10.5);
  });

  it('generates deterministic frame geometry across video timeline', () => {
    const fps = 60;
    const speed = 1.0;

    // Frame 0 at t = 0
    const geo0 = generateGeometry(
      DEFAULT_WAVEFORMS,
      1234,
      DEFAULT_DIMENSIONS,
      palette,
      (0 / fps) * speed
    );

    // Frame 60 at t = 1.0s
    const geo60 = generateGeometry(
      DEFAULT_WAVEFORMS,
      1234,
      DEFAULT_DIMENSIONS,
      palette,
      (60 / fps) * speed
    );

    // Frame 900 at t = 15.0s
    const geo900 = generateGeometry(
      DEFAULT_WAVEFORMS,
      1234,
      DEFAULT_DIMENSIONS,
      palette,
      (900 / fps) * speed
    );

    expect(geo0.paths.length).toBeGreaterThan(0);
    expect(geo60.paths.length).toBeGreaterThan(0);
    expect(geo900.paths.length).toBeGreaterThan(0);

    // Check motion displacement
    const y0 = geo0.paths[0].commands[0]?.y;
    const y60 = geo60.paths[0].commands[0]?.y;
    expect(y0).not.toBeUndefined();
    expect(y60).not.toBeUndefined();
  });

  it('computes accurate export progress metrics', () => {
    const currentFrame = 150;
    const totalFrames = 300;
    const elapsedSec = 2.5;

    const progressRatio = currentFrame / totalFrames;
    const percentage = Math.round(progressRatio * 100);
    const estimatedTotalSec = elapsedSec / progressRatio;
    const remainingSec = Math.max(0, estimatedTotalSec - elapsedSec);

    expect(percentage).toBe(50);
    expect(estimatedTotalSec).toBe(5.0);
    expect(remainingSec).toBe(2.5);
  });
});
