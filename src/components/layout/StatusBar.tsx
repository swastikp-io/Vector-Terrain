import React, { useState } from 'react';
import { GeometryResult } from '../../engine/core/types';
import { usePlaygroundStore } from '../../store/playgroundStore';
import { Copy, Check, Clock, Compass, Activity, Hash } from 'lucide-react';

interface StatusBarProps {
  geometry: GeometryResult;
}

export const StatusBar: React.FC<StatusBarProps> = ({ geometry }) => {
  const { seed, dimensions, mode, paletteId } = usePlaygroundStore();
  const [copied, setCopied] = useState(false);

  const handleCopySeed = () => {
    navigator.clipboard.writeText(seed.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <footer className="h-7 bg-white border-t border-[#d9d9d9] px-3 flex items-center justify-between text-[11px] font-mono text-[#555555] select-none z-30 flex-shrink-0">
      {/* Left: Seed & Mode */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopySeed}
          className="flex items-center gap-1 hover:text-black transition"
          title="Click to copy seed"
        >
          <Hash size={11} className="text-[#888888]" />
          <span>SEED:</span>
          <span className="text-black font-semibold">{seed}</span>
          {copied ? <Check size={11} className="text-black ml-0.5" /> : <Copy size={11} className="text-[#888888] ml-0.5" />}
        </button>

        <div className="w-[1px] h-3 bg-[#d9d9d9]" />

        <div className="flex items-center gap-1">
          <Compass size={11} className="text-[#888888]" />
          <span className="uppercase text-black font-medium">{mode}</span>
        </div>

        <div className="w-[1px] h-3 bg-[#d9d9d9] hidden sm:block" />

        <div className="hidden sm:flex items-center gap-1">
          <span className="text-[#888888]">PALETTE:</span>
          <span className="text-black truncate max-w-[120px]">{paletteId}</span>
        </div>
      </div>

      {/* Right: Path count, Timing, Dimensions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Activity size={11} className="text-[#888888]" />
          <span>PATHS:</span>
          <span className="text-black font-semibold">{geometry.stats.pathCount}</span>
          <span className="text-[#888888] hidden md:inline">
            ({geometry.stats.segmentCount} seg)
          </span>
        </div>

        <div className="w-[1px] h-3 bg-[#d9d9d9]" />

        <div className="flex items-center gap-1">
          <Clock size={11} className="text-[#888888]" />
          <span>TIME:</span>
          <span className="text-black font-semibold">
            {geometry.generationTimeMs.toFixed(1)}ms
          </span>
        </div>

        <div className="w-[1px] h-3 bg-[#d9d9d9] hidden md:block" />

        <div className="hidden md:flex items-center gap-1">
          <span className="text-[#888888]">CANVAS:</span>
          <span className="text-black">
            {dimensions.width}×{dimensions.height}
          </span>
        </div>
      </div>
    </footer>
  );
};
