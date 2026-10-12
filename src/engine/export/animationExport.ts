import {
  GeneratorConfig,
  ArtboardDimensions,
  PaletteConfig,
  ExportConfig,
  AnimationExportProgress,
} from '../core/types';
import { generateGeometry } from '../generators';
import { drawPathToCanvasContext } from '../renderers/canvasRenderer';

export interface VideoMimeOptions {
  webm: string | null;
  mp4: string | null;
}

/**
 * Detects browser-supported video encoding formats for MediaRecorder.
 */
export function getSupportedVideoMimeTypes(): VideoMimeOptions {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
    return { webm: null, mp4: null };
  }

  const webmCandidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm;codecs=h264',
    'video/webm',
  ];

  const mp4Candidates = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1',
    'video/mp4',
  ];

  let webm: string | null = null;
  let mp4: string | null = null;

  for (const mime of webmCandidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      webm = mime;
      break;
    }
  }

  for (const mime of mp4Candidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      mp4 = mime;
      break;
    }
  }

  return { webm, mp4 };
}

/**
 * Selects optimal MIME type based on desired format ('webm' | 'mp4').
 */
export function resolveBestVideoMimeType(preferredFormat: 'webm' | 'mp4'): {
  mimeType: string;
  extension: 'webm' | 'mp4';
} {
  const supported = getSupportedVideoMimeTypes();

  if (preferredFormat === 'mp4' && supported.mp4) {
    return { mimeType: supported.mp4, extension: 'mp4' };
  }

  if (supported.webm) {
    return { mimeType: supported.webm, extension: 'webm' };
  }

  if (supported.mp4) {
    return { mimeType: supported.mp4, extension: 'mp4' };
  }

  // Fallback default
  return { mimeType: 'video/webm', extension: 'webm' };
}

/**
 * Triggers file download in the browser.
 */
export function triggerFileDownload(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1200);
}

export interface AnimationExportOptions {
  config: GeneratorConfig;
  seed: number;
  dimensions: ArtboardDimensions;
  palette: PaletteConfig;
  exportConfig: ExportConfig;
}

/**
 * Exports procedural vector art animation as very high quality WebM or MP4 video (up to 15 seconds).
 */
export async function exportToAnimation(options: AnimationExportOptions): Promise<Blob> {
  const { config, seed, dimensions, palette, exportConfig } = options;

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Animation export requires a browser environment.');
  }

  // Constrain duration between 1 and 15 seconds strictly
  const durationSec = Math.min(15, Math.max(1, exportConfig.durationSec ?? 5));
  const fps = exportConfig.fps === 30 ? 30 : 60; // 60 FPS default for buttery smooth animation
  const scale = exportConfig.scale || 2; // 2x Retina scale for high-definition sharpness
  const speed = exportConfig.speed ?? 1.0;
  // High bitrate: 20 Mbps default for crisp vector lines without block artifacts
  const bitrate = exportConfig.videoBitrate ?? 20_000_000;
  const preferredFormat = exportConfig.format === 'mp4' ? 'mp4' : 'webm';

  const { mimeType, extension } = resolveBestVideoMimeType(preferredFormat);

  const outWidth = Math.round(dimensions.width * scale);
  const outHeight = Math.round(dimensions.height * scale);
  const totalFrames = Math.round(durationSec * fps);
  const frameIntervalMs = 1000 / fps;

  // Create high-resolution rendering canvas
  const canvas = document.createElement('canvas');
  canvas.width = outWidth;
  canvas.height = outHeight;

  const ctx = canvas.getContext('2d', { alpha: exportConfig.transparentBackground });
  if (!ctx) {
    throw new Error('Failed to acquire 2D canvas context for video encoding.');
  }

  // Antialiasing configuration for ultra-sharp edges
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Check canvas capture stream support
  if (!('captureStream' in canvas)) {
    throw new Error('HTMLCanvasElement.captureStream is not supported in this browser.');
  }

  const stream = (canvas as any).captureStream(fps) as MediaStream;
  const videoTrack = stream.getVideoTracks()[0];

  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: bitrate,
    });
  } catch {
    // If strict codec string fails, fallback to bare container
    recorder = new MediaRecorder(stream, {
      videoBitsPerSecond: bitrate,
    });
  }

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise<Blob>((resolve, reject) => {
    const startTime = performance.now();

    const handleAbort = () => {
      try {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        // ignore
      }
      reject(new Error('Export was cancelled by user.'));
    };

    if (exportConfig.abortSignal?.aborted) {
      handleAbort();
      return;
    }

    exportConfig.abortSignal?.addEventListener('abort', handleAbort);

    recorder.onstop = () => {
      exportConfig.abortSignal?.removeEventListener('abort', handleAbort);
      stream.getTracks().forEach((t) => t.stop());

      if (chunks.length === 0) {
        reject(new Error('Video encoding produced no frames.'));
        return;
      }

      const finalBlob = new Blob(chunks, { type: recorder.mimeType || mimeType });
      const downloadUrl = URL.createObjectURL(finalBlob);

      const baseName = exportConfig.filename.replace(/\.(webm|mp4|png|svg|pdf)$/i, '');
      const finalFilename = `${baseName}.${extension}`;

      triggerFileDownload(downloadUrl, finalFilename);
      resolve(finalBlob);
    };

    recorder.onerror = (event: any) => {
      exportConfig.abortSignal?.removeEventListener('abort', handleAbort);
      stream.getTracks().forEach((t) => t.stop());
      reject(event.error || new Error('MediaRecorder encountered an encoding error.'));
    };

    // Start recorder
    recorder.start(100);

    let frameIndex = 0;

    const renderNextFrame = async () => {
      if (exportConfig.abortSignal?.aborted) {
        handleAbort();
        return;
      }

      if (frameIndex >= totalFrames) {
        // Allow encoder to absorb final frame
        setTimeout(() => {
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        }, frameIntervalMs * 2);
        return;
      }

      // Compute exact deterministic time for this frame
      const frameTime = (frameIndex / fps) * speed;

      // Deterministically generate geometry
      const frameGeometry = generateGeometry(
        config,
        seed,
        dimensions,
        palette,
        frameTime
      );

      // Render frame onto canvas
      ctx.save();
      if (exportConfig.transparentBackground) {
        ctx.clearRect(0, 0, outWidth, outHeight);
      } else {
        ctx.fillStyle = exportConfig.backgroundColor || palette.background;
        ctx.fillRect(0, 0, outWidth, outHeight);
      }

      ctx.scale(scale, scale);

      for (const path of frameGeometry.paths) {
        drawPathToCanvasContext(ctx, path);
      }
      ctx.restore();

      // Request frame capture if supported
      if (videoTrack && (videoTrack as any).requestFrame) {
        (videoTrack as any).requestFrame();
      }

      frameIndex++;

      // Progress reporting
      const now = performance.now();
      const elapsedSec = (now - startTime) / 1000;
      const progressRatio = frameIndex / totalFrames;
      const estimatedTotalSec = progressRatio > 0 ? elapsedSec / progressRatio : durationSec;
      const remainingSec = Math.max(0, estimatedTotalSec - elapsedSec);

      if (exportConfig.onProgress) {
        exportConfig.onProgress({
          currentFrame: frameIndex,
          totalFrames,
          percentage: Math.round(progressRatio * 100),
          elapsedSec: Math.round(elapsedSec * 10) / 10,
          remainingSec: Math.round(remainingSec * 10) / 10,
        });
      }

      // Real-time pacing to guarantee smooth 60fps/30fps stream absorption
      setTimeout(renderNextFrame, frameIntervalMs);
    };

    // Initiate frame rendering loop
    renderNextFrame();
  });
}
