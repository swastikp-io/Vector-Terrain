import React, { useEffect, useRef } from 'react';

export const HeroArtwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Observe visibility to avoid rendering when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const checkReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let time = 0;
    const cols = 28;
    const rows = 46;

    const render = () => {
      if (!isVisibleRef.current) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Pure white artwork surface
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Asymmetrical vertical block on left
      const matrixWidth = width * 0.78;
      const matrixX = 0;
      const matrixY = 0;

      // Draw subtle light gray technical grid backing
      ctx.strokeStyle = '#F0F0F0';
      ctx.lineWidth = 1;
      const cellW = matrixWidth / cols;
      const cellH = height / rows;

      // Generative vertical flow field with pure monochrome dot matrix
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = matrixX + c * cellW + cellW / 2;
          const y = matrixY + r * cellH + cellH / 2;

          // Flow deformation formula
          const angle =
            Math.sin(c * 0.18 + time * 0.8) * 1.5 +
            Math.cos(r * 0.12 + time * 0.6) * 1.8 +
            Math.sin((c + r) * 0.08 + time * 0.4);

          const distanceToCore = Math.abs(c - 10) / cols;
          const intensity = Math.max(0.12, 1 - distanceToCore * 1.2);

          // Dot radius modulated by mathematical wave
          const baseRadius = 1.0 + Math.sin(r * 0.25 + time + c * 0.1) * 0.95;
          const radius = Math.max(0.6, baseRadius * intensity * 1.35);

          // Monochrome stippling
          const isAccentPoint = (c * 7 + r * 13) % 37 === 0;

          ctx.beginPath();
          ctx.arc(x, y, isAccentPoint ? radius * 1.5 : radius, 0, Math.PI * 2);

          if (isAccentPoint) {
            ctx.fillStyle = '#000000';
          } else {
            const alpha = 0.2 + Math.abs(Math.sin(c * 0.3 + time * 0.5)) * 0.7;
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha.toFixed(2)})`;
          }
          ctx.fill();

          // Connect vertical streamlines in clusters with delicate black lines
          if (c % 2 === 0 && r < rows - 1 && Math.sin(c * 0.5 + time) > -0.2) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.sin(angle) * 3, y + cellH);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      // Vertical architectural cutoff stripe (subtle light gray tone)
      const cutX = matrixWidth;
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(cutX, 0, width - cutX, height);

      // Minimal horizontal technical line dividers
      ctx.strokeStyle = '#E5E5E5';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.18);
      ctx.lineTo(width, height * 0.18);
      ctx.moveTo(0, height * 0.82);
      ctx.lineTo(width, height * 0.82);
      ctx.moveTo(cutX, 0);
      ctx.lineTo(cutX, height);
      ctx.stroke();

      // Right column procedural vector arcs in pure black
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cutX + 30, height * 0.5, 60, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      ctx.restore();

      if (!checkReducedMotion) {
        time += 0.015;
      }
      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[460px] sm:h-[540px] lg:h-[620px] bg-white border border-[#E5E5E5] overflow-hidden select-none group"
    >
      {/* Real-time Generative Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ imageRendering: 'crisp-edges' }}
      />

      {/* Technical Annotation Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 text-[10px] font-mono tracking-wider text-[#666666] bg-white/95 backdrop-blur-sm px-2.5 py-1.5 border border-[#E5E5E5]">
        <div className="flex items-center gap-1.5 text-black font-semibold">
          <span className="w-1.5 h-1.5 bg-black rounded-none" />
          <span>SYSTEM 001 // CONTINUUM</span>
        </div>
        <div className="text-[9px] text-[#888888]">
          SEED: 94821 • MATRIX: 28×46 • FPS: 60
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 text-[9px] font-mono tracking-widest text-[#666666] uppercase bg-white/95 px-2 py-1 border border-[#E5E5E5]">
        MODE: MONOCHROME FLOW FIELD
      </div>

      {/* Oversized Pure Black Arrow Graphic */}
      <div className="absolute bottom-6 right-6 z-10 pointer-events-none transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
        <svg
          width="54"
          height="54"
          viewBox="0 0 54 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 46L46 8M46 8H16M46 8V38"
            stroke="#000000"
            strokeWidth="2.5"
            strokeLinecap="square"
          />
        </svg>
      </div>
    </div>
  );
};
