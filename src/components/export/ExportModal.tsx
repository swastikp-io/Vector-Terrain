import React, { useState, useRef, useMemo } from 'react';
import { GeometryResult, ExportConfig, AnimationExportProgress } from '../../engine/core/types';
import { usePlaygroundStore } from '../../store/playgroundStore';
import { getPaletteById } from '../../store/palettes';
import { executeExport, getSupportedVideoMimeTypes } from '../../engine/export';
import {
  X,
  Download,
  Check,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
  StopCircle,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  geometry: GeometryResult;
  defaultFormat?: 'svg' | 'png' | 'pdf' | 'webm' | 'mp4';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  geometry,
  defaultFormat = 'svg',
}) => {
  const { paletteId, dimensions, seed, mode, configs, animation } = usePlaygroundStore();
  const palette = getPaletteById(paletteId);
  const activeConfig = configs[mode];

  const supportedFormats = useMemo(() => getSupportedVideoMimeTypes(), []);

  const [format, setFormat] = useState<'svg' | 'png' | 'pdf' | 'webm' | 'mp4'>(defaultFormat);
  const [scale, setScale] = useState<number>(format === 'webm' || format === 'mp4' ? 2 : 1);
  const [transparent, setTransparent] = useState(false);
  const [filename, setFilename] = useState(`vector-art-${mode}-${seed}`);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Animation export specific parameters
  const [durationSec, setDurationSec] = useState<number>(5);
  const [fps, setFps] = useState<number>(60);
  const [videoContainer, setVideoContainer] = useState<'webm' | 'mp4'>(
    supportedFormats.mp4 ? 'mp4' : 'webm'
  );
  const [progress, setProgress] = useState<AnimationExportProgress | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  if (!isOpen) return null;

  const isAnimated = format === 'webm' || format === 'mp4';
  const effectiveScale = isAnimated ? Math.max(1, scale) : scale;
  const outputWidth = Math.round(dimensions.width * effectiveScale);
  const outputHeight = Math.round(dimensions.height * effectiveScale);

  const handleSelectAnimated = () => {
    setFormat(videoContainer);
    if (scale === 1) {
      setScale(2); // Default to 2x Retina for crisp motion
    }
  };

  const handleCancelExport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsExporting(false);
    setProgress(null);
    setErrorMsg('Export cancelled.');
  };

  const handleExport = async () => {
    setIsExporting(true);
    setErrorMsg(null);
    setExportSuccess(false);
    setProgress(null);

    abortControllerRef.current = new AbortController();

    try {
      const config: ExportConfig = {
        format,
        width: dimensions.width,
        height: dimensions.height,
        scale: effectiveScale,
        transparentBackground: transparent,
        backgroundColor: palette.background,
        filename,
        durationSec,
        fps,
        speed: animation.speed,
        videoBitrate: 22_000_000,
        onProgress: (p) => setProgress(p),
        abortSignal: abortControllerRef.current.signal,
      };

      await executeExport(geometry, config, palette, {
        activeConfig,
        seed,
      });

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      if (err.message && err.message.includes('cancelled')) {
        setErrorMsg('Export was cancelled.');
      } else {
        console.error('Export failed:', err);
        setErrorMsg(err.message || 'Export failed. Please check browser support and parameters.');
      }
    } finally {
      setIsExporting(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-[620px] bg-[#0c0d0e] border border-[#27282d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden text-white animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-0 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest font-mono uppercase">
              EXPORT ARTWORK & MOTION
            </h2>
            <p className="text-xs text-[#8e919a] mt-1">
              Download vector geometry, high-res bitmaps, or animated graphics up to 15s.
            </p>
          </div>
          <button
            onClick={() => {
              if (isExporting) handleCancelExport();
              onClose();
            }}
            className="p-1 hover:bg-[#18191c] text-[#8e919a] hover:text-white rounded-md transition"
            title="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* Subtle Hairline Divider */}
        <div className="border-b border-[#222326] mt-4 mb-4 mx-6" />

        {/* Content Body */}
        <div className="px-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* FORMAT SELECTION */}
          <div>
            <label className="text-[10px] font-mono tracking-widest uppercase text-[#8e919a] block mb-2.5">
              FORMAT SELECTION
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {/* SVG Card */}
              <button
                type="button"
                onClick={() => setFormat('svg')}
                className={`p-3.5 rounded-lg border text-left flex flex-col items-start gap-1 transition cursor-pointer ${
                  format === 'svg'
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-[#121316] text-[#e4e4e7] border-[#27282d] hover:border-[#3f3f46]'
                }`}
              >
                {/* Vector Document Icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={format === 'svg' ? 'text-black' : 'text-white'}
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M9 15c0-1.5 1-2.5 3-2.5s3 1 3 2.5" />
                  <circle cx="9" cy="15" r="1" fill="currentColor" />
                  <circle cx="15" cy="15" r="1" fill="currentColor" />
                </svg>
                <span className="text-xs font-semibold mt-2">SVG</span>
                <span
                  className={`text-[10px] leading-tight ${
                    format === 'svg' ? 'text-neutral-600' : 'text-[#8e919a]'
                  }`}
                >
                  Lossless vector
                </span>
              </button>

              {/* PNG Card */}
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`p-3.5 rounded-lg border text-left flex flex-col items-start gap-1 transition cursor-pointer ${
                  format === 'png'
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-[#121316] text-[#e4e4e7] border-[#27282d] hover:border-[#3f3f46]'
                }`}
              >
                {/* Image Icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={format === 'png' ? 'text-black' : 'text-white'}
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-xs font-semibold mt-2">PNG</span>
                <span
                  className={`text-[10px] leading-tight ${
                    format === 'png' ? 'text-neutral-600' : 'text-[#8e919a]'
                  }`}
                >
                  Raster image
                </span>
              </button>

              {/* PDF Card */}
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3.5 rounded-lg border text-left flex flex-col items-start gap-1 transition cursor-pointer ${
                  format === 'pdf'
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-[#121316] text-[#e4e4e7] border-[#27282d] hover:border-[#3f3f46]'
                }`}
              >
                {/* Print Document Icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={format === 'pdf' ? 'text-black' : 'text-white'}
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
                <span className="text-xs font-semibold mt-2">PDF</span>
                <span
                  className={`text-[10px] leading-tight ${
                    format === 'pdf' ? 'text-neutral-600' : 'text-[#8e919a]'
                  }`}
                >
                  Print document
                </span>
              </button>

              {/* ANIMATED Card */}
              <button
                type="button"
                onClick={handleSelectAnimated}
                className={`p-3.5 rounded-lg border text-left flex flex-col items-start gap-1 transition cursor-pointer ${
                  isAnimated
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-[#121316] text-[#e4e4e7] border-[#27282d] hover:border-[#3f3f46]'
                }`}
              >
                {/* Film Reels Icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isAnimated ? 'text-black' : 'text-white'}
                >
                  <rect x="2" y="4" width="20" height="16" rx="2.5" />
                  <line x1="2" y1="8" x2="22" y2="8" />
                  <line x1="2" y1="16" x2="22" y2="16" />
                  <line x1="7" y1="4" x2="7" y2="8" />
                  <line x1="17" y1="4" x2="17" y2="8" />
                  <line x1="7" y1="16" x2="7" y2="20" />
                  <line x1="17" y1="16" x2="17" y2="20" />
                </svg>
                <span className="text-xs font-semibold mt-2">ANIMATED</span>
                <span
                  className={`text-[10px] leading-tight ${
                    isAnimated ? 'text-neutral-600' : 'text-[#8e919a]'
                  }`}
                >
                  Video up to 15s
                </span>
              </button>
            </div>
          </div>

          {/* OUTPUT RESOLUTION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-mono tracking-widest uppercase text-[#8e919a]">
                OUTPUT RESOLUTION
              </label>
              <span className="text-[11px] font-mono text-[#8e919a]">
                {outputWidth} × {outputHeight} px
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { s: 1, label: '1× (Standard)' },
                { s: 2, label: '2× (Retina HD)' },
                { s: 3, label: '3× (Ultra 4K)' },
              ].map(({ s, label }) => (
                <button
                  key={s}
                  type="button"
                  disabled={isExporting}
                  onClick={() => setScale(s)}
                  className={`py-2 rounded-lg border text-xs font-medium text-center transition cursor-pointer ${
                    scale === s
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-[#121316] text-[#e4e4e7] border-[#27282d] hover:border-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ANIMATED VIDEO DURATION & ENCODING PANEL (Revealed when Animated is chosen) */}
          {isAnimated && (
            <div className="p-3.5 rounded-lg border border-[#27282d] bg-[#121316] space-y-3 animate-in fade-in duration-100">
              {/* Duration Slider & Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                    <Clock size={12} className="text-[#8e919a]" />
                    <span>Duration: {durationSec.toFixed(1)}s</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8e919a]">
                    {Math.round(durationSec * fps)} frames @ {fps} FPS
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={durationSec}
                  onChange={(e) => setDurationSec(parseFloat(e.target.value))}
                  disabled={isExporting}
                  className="w-full cursor-pointer accent-white"
                />

                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-mono text-[#8e919a] mr-1">Presets:</span>
                  {[3, 5, 10, 15].map((d) => (
                    <button
                      key={d}
                      type="button"
                      disabled={isExporting}
                      onClick={() => setDurationSec(d)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition border cursor-pointer ${
                        durationSec === d
                          ? 'border-white bg-white text-black font-semibold'
                          : 'border-[#27282d] hover:border-[#3f3f46] bg-[#18191c] text-[#e4e4e7]'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Framerate & Container Format */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#222326]">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#8e919a] block">
                    Frame Rate
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                    {[60, 30].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        disabled={isExporting}
                        onClick={() => setFps(rate)}
                        className={`py-1 rounded-md border text-center transition cursor-pointer ${
                          fps === rate
                            ? 'border-white bg-white text-black font-medium'
                            : 'border-[#27282d] hover:border-[#3f3f46] bg-[#18191c] text-[#e4e4e7]'
                        }`}
                      >
                        {rate} FPS
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#8e919a] block">
                    Format
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={() => {
                        setVideoContainer('webm');
                        setFormat('webm');
                      }}
                      className={`py-1 rounded-md border text-center transition cursor-pointer ${
                        videoContainer === 'webm'
                          ? 'border-white bg-white text-black font-medium'
                          : 'border-[#27282d] hover:border-[#3f3f46] bg-[#18191c] text-[#e4e4e7]'
                      }`}
                    >
                      WebM
                    </button>
                    <button
                      type="button"
                      disabled={isExporting || !supportedFormats.mp4}
                      onClick={() => {
                        setVideoContainer('mp4');
                        setFormat('mp4');
                      }}
                      title={supportedFormats.mp4 ? 'Universal MP4' : 'MP4 not supported in browser'}
                      className={`py-1 rounded-md border text-center transition cursor-pointer ${
                        videoContainer === 'mp4'
                          ? 'border-white bg-white text-black font-medium'
                          : 'border-[#27282d] hover:border-[#3f3f46] bg-[#18191c] text-[#e4e4e7] disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      MP4
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transparent Background Toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-xs font-medium text-white">
                Transparent Background
              </div>
              <div className="text-[11px] text-[#8e919a] mt-0.5">
                Omit artboard background fill in exported document
              </div>
            </div>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => setTransparent(!transparent)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                transparent ? 'bg-white' : 'bg-[#27282d]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full transition-transform absolute top-0.5 ${
                  transparent ? 'left-[22px] bg-black shadow-sm' : 'left-0.5 bg-[#8e919a]'
                }`}
              />
            </button>
          </div>

          {/* FILENAME */}
          <div>
            <label className="text-[10px] font-mono tracking-widest uppercase text-[#8e919a] block mb-1.5">
              FILENAME
            </label>
            <div className="border border-[#27282d] rounded-lg bg-[#121316] flex items-center px-3.5 py-2 text-xs focus-within:border-white transition">
              <input
                type="text"
                disabled={isExporting}
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="bg-transparent flex-1 text-xs font-mono text-white outline-none"
              />
              <span className="border-l border-[#27282d] pl-3 ml-2 text-xs font-mono text-[#8e919a] select-none">
                .{isAnimated ? videoContainer : format}
              </span>
            </div>
          </div>

          {/* Active Encoding Progress Bar */}
          {isExporting && isAnimated && progress && (
            <div className="space-y-2 p-3.5 rounded-lg bg-[#121316] border border-[#27282d] animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin text-white" />
                  Encoding Frame {progress.currentFrame} of {progress.totalFrames}
                </span>
                <span className="font-bold text-white text-sm">
                  {progress.percentage}%
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-[#27282d] overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75 ease-out"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#8e919a]">
                <span>Elapsed: {progress.elapsedSec.toFixed(1)}s</span>
                <span>Est. Remaining: ~{progress.remainingSec.toFixed(1)}s</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#222326] mt-6 pt-4 px-6 pb-5 flex items-center justify-between bg-[#0c0d0e]">
          {isExporting ? (
            <button
              type="button"
              onClick={handleCancelExport}
              className="flex items-center gap-1.5 py-2 text-xs text-red-400 hover:text-red-300 font-mono transition cursor-pointer"
            >
              <StopCircle size={14} />
              <span>Cancel Encoding</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-[#8e919a] hover:text-white transition py-2 cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer active:scale-95 shadow-sm ${
              exportSuccess
                ? 'bg-white text-black font-semibold'
                : 'bg-white hover:bg-neutral-200 text-black font-semibold'
            }`}
          >
            {isExporting ? (
              <>
                <Loader2 size={14} className="animate-spin text-black" />
                <span>Encoding {isAnimated ? `${progress?.percentage || 0}%` : '...'}</span>
              </>
            ) : exportSuccess ? (
              <>
                <Check size={14} />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>
                  {isAnimated
                    ? `Download .${videoContainer.toUpperCase()}`
                    : `Download .${format.toUpperCase()}`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
