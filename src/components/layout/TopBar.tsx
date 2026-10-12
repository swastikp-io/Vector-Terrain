import React from 'react';
import { usePlaygroundStore } from '../../store/playgroundStore';
import {
  Sparkles,
  Undo2,
  Redo2,
  Play,
  Pause,
  RotateCcw,
  Download,
  Dices,
} from 'lucide-react';

import { User } from '@supabase/supabase-js';

interface TopBarProps {
  onOpenExport: (format?: 'svg' | 'png' | 'pdf' | 'webm' | 'mp4') => void;
  onBackToHome?: () => void;
  user?: User | null;
  onSignOut?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenExport,
  onBackToHome,
  user,
  onSignOut,
}) => {
  const {
    history,
    undo,
    redo,
    rollSeed,
    randomizeAll,
    animation,
    toggleAnimation,
    resetAnimation,
    setAnimationSpeed,
  } = usePlaygroundStore();

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return (
    <header className="h-14 bg-transparent border-none px-4 flex items-center justify-between text-black select-none z-30 flex-shrink-0">
      {/* Brand & App Title */}
      <div className="flex items-center">
        <span className="font-semibold text-sm tracking-tight text-black font-mono">
          Vector Terrain
        </span>
      </div>

      {/* Center Actions: Undo, Redo, Roll, Randomize, Animation */}
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <div className="flex items-center bg-[#f5f5f5] rounded p-0.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 hover:bg-[#eeeeee] hover:text-black text-black rounded disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 hover:bg-[#eeeeee] hover:text-black text-black rounded disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* New Variation (Roll Seed) */}
        <button
          onClick={rollSeed}
          title="Generate New Seed Variation"
          className="flex items-center gap-1.5 bg-[#f5f5f5] hover:bg-[#eeeeee] rounded px-2.5 py-1 text-xs text-black transition"
        >
          <Dices size={13} className="text-[#555555]" />
          <span className="hidden sm:inline">New Variation</span>
        </button>

        {/* Randomize All */}
        <button
          onClick={randomizeAll}
          title="Randomize All Unlocked Parameters"
          className="flex items-center gap-1.5 bg-[#f5f5f5] hover:bg-[#eeeeee] rounded px-2.5 py-1 text-xs text-black transition"
        >
          <Sparkles size={13} className="text-black" />
          <span className="hidden md:inline">Randomize</span>
        </button>

        {/* Animation Play/Pause, Reset & Speed */}
        <div className="flex items-center gap-1 bg-[#f5f5f5] rounded p-0.5">
          <button
            onClick={toggleAnimation}
            title={animation.isPlaying ? 'Pause Animation' : 'Play Motion Animation'}
            className={`p-1.5 rounded transition flex items-center gap-1 ${
              animation.isPlaying
                ? 'bg-black text-white font-semibold shadow-sm'
                : 'hover:bg-[#eeeeee] text-black'
            }`}
          >
            {animation.isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>

          <button
            onClick={resetAnimation}
            title="Reset Animation to Initial Frame"
            className="p-1.5 hover:bg-[#eeeeee] text-black rounded transition"
          >
            <RotateCcw size={12} />
          </button>

          <select
            value={animation.speed}
            onChange={(e) => setAnimationSpeed(Number(e.target.value))}
            className="bg-transparent text-[11px] font-mono text-[#555555] hover:text-black outline-none px-1 py-0.5 rounded cursor-pointer transition font-medium"
            title="Animation Speed"
          >
            <option value={0.5} className="bg-white text-black">0.5x</option>
            <option value={1} className="bg-white text-black">1.0x</option>
            <option value={1.5} className="bg-white text-black">1.5x</option>
            <option value={2} className="bg-white text-black">2.0x</option>
          </select>
        </div>
      </div>

      {/* Right Actions: User Account + Export Buttons */}
      <div className="flex items-center gap-2">
        {user && onSignOut && (
          <button
            onClick={onSignOut}
            title="Sign Out of Procedural Studio"
            className="px-2.5 py-1 bg-[#f5f5f5] hover:bg-[#eaeaea] text-black font-mono text-[11px] rounded transition"
          >
            Sign Out
          </button>
        )}

        <button
          onClick={() => onOpenExport('svg')}
          className="flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white font-medium text-xs rounded px-3 py-1.5 shadow-sm transition active:scale-95"
        >
          <Download size={13} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};

