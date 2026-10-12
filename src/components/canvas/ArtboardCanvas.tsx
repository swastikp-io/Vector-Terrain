import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { GeometryResult } from '../../engine/core/types';
import { drawPathToCanvasContext } from '../../engine/renderers/canvasRenderer';
import { generateGeometry } from '../../engine/generators';
import { usePlaygroundStore } from '../../store/playgroundStore';
import { getPaletteById } from '../../store/palettes';
import { Grid, Eye } from 'lucide-react';

interface ArtboardCanvasProps {
  geometry: GeometryResult;
}

export const ArtboardCanvas: React.FC<ArtboardCanvasProps> = ({ geometry }) => {
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const {
    paletteId,
    transparentBackground,
    showGuides,
    toggleGuides,
    toggleTransparent,
    animation,
    configs,
    mode,
    seed,
    dimensions,
  } = usePlaygroundStore();

  const palette = useMemo(() => getPaletteById(paletteId), [paletteId]);
  const activeConfig = configs[mode];

  // Measure outer designated canvas space dynamically to always fit within it
  useEffect(() => {
    const el = outerContainerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute fitted display dimensions so the layout always stays within designated canvas space
  const { displayWidth, displayHeight } = useMemo(() => {
    const padding = 48; // Comfortable breathing room inside designated canvas space
    const availW = Math.max(100, (containerSize.width || 800) - padding);
    const availH = Math.max(100, (containerSize.height || 600) - padding);

    const artW = geometry.dimensions.width;
    const artH = geometry.dimensions.height;

    const scale = Math.min(availW / artW, availH / artH);

    return {
      displayWidth: Math.max(1, Math.round(artW * scale)),
      displayHeight: Math.max(1, Math.round(artH * scale)),
    };
  }, [containerSize.width, containerSize.height, geometry.dimensions.width, geometry.dimensions.height]);

  // Ref container to hold latest values for animation loop
  const stateRef = useRef({
    geometry,
    palette,
    transparentBackground,
    showGuides,
    activeConfig,
    seed,
    dimensions,
    speed: animation.speed,
    isPlaying: animation.isPlaying,
  });

  // Synchronously keep stateRef up to date on every render so animation loop always has latest speed
  stateRef.current = {
    geometry,
    palette,
    transparentBackground,
    showGuides,
    activeConfig,
    seed,
    dimensions,
    speed: animation.speed,
    isPlaying: animation.isPlaying,
  };

  const animTimeRef = useRef(animation.time);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Sync animation clock when reset is clicked
  useEffect(() => {
    if (animation.time === 0) {
      animTimeRef.current = 0;
    }
  }, [animation.time]);

  // Draw current frame directly onto canvas context with devicePixelRatio scaling
  const drawFrame = useCallback((geo: GeometryResult) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = geo.dimensions;
    const dpr = window.devicePixelRatio || 1;

    // Ensure backing store pixel resolution matches dimensions * dpr
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear or fill background
    if (stateRef.current.transparentBackground) {
      ctx.clearRect(0, 0, width, height);
    } else {
      ctx.fillStyle = stateRef.current.palette.background;
      ctx.fillRect(0, 0, width, height);
    }

    // Render all procedural paths
    for (const path of geo.paths) {
      drawPathToCanvasContext(ctx, path);
    }

    // Render artboard guides overlay if enabled
    if (stateRef.current.showGuides) {
      ctx.save();
      const isDark = stateRef.current.palette.background !== '#ffffff';
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(0, 0, width, height);
      ctx.restore();
    }

    ctx.restore();
  }, []);

  // Static redraw whenever geometry, palette, guides, or transparency changes
  useEffect(() => {
    if (!animation.isPlaying) {
      drawFrame(geometry);
    }
  }, [geometry, palette, transparentBackground, showGuides, animation.isPlaying, drawFrame]);

  // Dedicated 60 FPS Animation Loop
  useEffect(() => {
    if (!animation.isPlaying) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lastTimeRef.current = null;
      drawFrame(geometry);
      return;
    }

    const animateLoop = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const dt = Math.min(0.1, (timestamp - lastTimeRef.current) / 1000);
      lastTimeRef.current = timestamp;

      animTimeRef.current += dt * stateRef.current.speed;

      // Deterministically generate next animated frame
      const current = stateRef.current;
      const frameGeometry = generateGeometry(
        current.activeConfig,
        current.seed,
        current.dimensions,
        current.palette,
        animTimeRef.current
      );

      drawFrame(frameGeometry);

      if (stateRef.current.isPlaying) {
        rafIdRef.current = requestAnimationFrame(animateLoop);
      }
    };

    rafIdRef.current = requestAnimationFrame(animateLoop);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [animation.isPlaying, drawFrame, geometry]);

  return (
    <div
      ref={outerContainerRef}
      className="relative flex-1 w-full h-full overflow-hidden bg-[#0c0d0e] flex items-center justify-center select-none cursor-default"
    >
      {/* Subtle minimalist grid background */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.4) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Designated Canvas Space: strictly contained, never exceeds canvas space */}
      <div
        className={`relative shadow-[0_12px_45px_rgba(0,0,0,0.7)] border rounded-sm overflow-hidden flex-shrink-0 transition-all duration-150 ease-out ${
          palette.background === '#ffffff' ? 'border-[#3f3f46]' : 'border-[#27272a]'
        }`}
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          backgroundColor: transparentBackground ? 'transparent' : palette.background,
        }}
      >
        {/* Transparency checkerboard when enabled */}
        {transparentBackground && (
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #222328 25%, transparent 25%), linear-gradient(-45deg, #222328 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222328 75%), linear-gradient(-45deg, transparent 75%, #222328 75%)',
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            }}
          />
        )}

        {/* Canvas Surface Element */}
        <canvas
          ref={canvasRef}
          className="relative z-10 w-full h-full block"
          style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
          }}
        />
      </div>

      {/* Canvas View Toggles (Bottom Left) */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-[#18191c]/95 backdrop-blur-md border border-[#27282d] p-1 rounded-md shadow-sm text-[#a1a1aa] z-30">
        <button
          onClick={toggleGuides}
          title={showGuides ? 'Hide Artboard Guides' : 'Show Artboard Guides'}
          className={`p-1.5 rounded transition ${
            showGuides ? 'bg-white text-black' : 'hover:bg-[#25262c] hover:text-white'
          }`}
        >
          <Grid size={14} />
        </button>
        <button
          onClick={toggleTransparent}
          title={transparentBackground ? 'Opaque Background' : 'Transparent Canvas'}
          className={`p-1.5 rounded transition ${
            transparentBackground ? 'bg-white text-black' : 'hover:bg-[#25262c] hover:text-white'
          }`}
        >
          <Eye size={14} />
        </button>
      </div>
    </div>
  );
};
