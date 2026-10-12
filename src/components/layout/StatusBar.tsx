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
    <footer className="h-7 bg-[#0c0d0e] border-t border-[#222326] px-3 flex items-center justify-between text-[11px] font-mono text-[#8e919a] select-none z-30 flex-shrink-0">
      {/* Left: Seed & Mode */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopySeed}
          className="flex items-center gap-1 hover:text-white transition"
          title="Click to copy seed"
        >
          <Hash size={11} className="text-[#71717a]" />
          <span>SEED:</span>
          <span className="text-white font-semibold">{seed}</span>
          {copied ? <Check size={11} className="text-white ml-0.5" /> : <Copy size={11} className="text-[#71717a] ml-0.5" />}
        </button>

        <div className="w-[1px] h-3 bg-[#222326]" />

        <div className="flex items-center gap-1">
          <Compass size={11} className="text-[#71717a]" />
          <span className="uppercase text-white font-medium">{mode}</span>
        </div>

        <div className="w-[1px] h-3 bg-[#222326] hidden sm:block" />

        <div className="hidden sm:flex items-center gap-1">
          <span className="text-[#71717a]">PALETTE:</span>
          <span className="text-white truncate max-w-[120px]">{paletteId}</span>
        </div>
      </div>

      {/* Right: Path count, Timing, Dimensions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Activity size={11} className="text-[#71717a]" />
          <span>PATHS:</span>
          <span className="text-white font-semibold">{geometry.stats.pathCount}</span>
          <span className="text-[#71717a] hidden md:inline">
            ({geometry.stats.segmentCount} seg)
          </span>
        </div>

        <div className="w-[1px] h-3 bg-[#222326]" />

        <div className="flex items-center gap-1">
          <Clock size={11} className="text-[#71717a]" />
          <span>TIME:</span>
          <span className="text-white font-semibold">
            {geometry.generationTimeMs.toFixed(1)}ms
          </span>
        </div>

        <div className="w-[1px] h-3 bg-[#222326] hidden md:block" />

        <div className="hidden md:flex items-center gap-1">
          <span className="text-[#71717a]">CANVAS:</span>
          <span className="text-white">
            {dimensions.width}×{dimensions.height}
          </span>
        </div>
      </div>
    </footer>
  );
};
