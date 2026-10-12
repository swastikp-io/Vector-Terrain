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
    <header className="h-14 bg-transparent px-4 flex items-center justify-between text-white select-none z-30 flex-shrink-0">
      {/* Brand & App Title */}
      <div className="flex items-center">
        <span className="font-semibold text-sm tracking-tight text-white font-mono">
          Vector Terrain
        </span>
      </div>

      {/* Center Actions: Undo, Redo, Roll, Randomize, Animation */}
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <div className="flex items-center bg-[#18191c] border border-[#27282d] rounded p-0.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 hover:bg-[#25262c] text-[#e4e4e7] hover:text-white rounded disabled:opacity-25 disabled:hover:bg-transparent transition"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 hover:bg-[#25262c] text-[#e4e4e7] hover:text-white rounded disabled:opacity-25 disabled:hover:bg-transparent transition"
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* New Variation (Roll Seed) */}
        <button
          onClick={rollSeed}
          title="Generate New Seed Variation"
          className="flex items-center gap-1.5 bg-[#18191c] hover:bg-[#25262c] border border-[#27282d] hover:border-[#3f3f46] rounded px-2.5 py-1 text-xs text-[#e4e4e7] hover:text-white transition"
        >
          <Dices size={13} className="text-[#8e919a]" />
          <span className="hidden sm:inline">New Variation</span>
        </button>

        {/* Randomize All */}
        <button
          onClick={randomizeAll}
          title="Randomize All Unlocked Parameters"
          className="flex items-center gap-1.5 bg-[#18191c] hover:bg-[#25262c] border border-[#27282d] hover:border-[#3f3f46] rounded px-2.5 py-1 text-xs text-[#e4e4e7] hover:text-white transition"
        >
          <Sparkles size={13} className="text-white" />
          <span className="hidden md:inline">Randomize</span>
        </button>

        <div className="h-4 w-[1px] bg-[#27282d] mx-1" />

        {/* Animation Play/Pause, Reset & Speed */}
        <div className="flex items-center gap-1 bg-[#18191c] border border-[#27282d] rounded p-0.5">
          <button
            onClick={toggleAnimation}
            title={animation.isPlaying ? 'Pause Animation' : 'Play Motion Animation'}
            className={`p-1.5 rounded transition flex items-center gap-1 ${
              animation.isPlaying
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'hover:bg-[#25262c] text-[#e4e4e7] hover:text-white'
            }`}
          >
            {animation.isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>

          <button
            onClick={resetAnimation}
            title="Reset Animation to Initial Frame"
            className="p-1.5 hover:bg-[#25262c] text-[#8e919a] hover:text-white rounded transition"
          >
            <RotateCcw size={12} />
          </button>

          <select
            value={animation.speed}
            onChange={(e) => setAnimationSpeed(Number(e.target.value))}
            className="bg-transparent text-[11px] font-mono text-[#8e919a] hover:text-white outline-none px-1 py-0.5 rounded cursor-pointer transition font-medium"
            title="Animation Speed"
          >
            <option value={0.5} className="bg-[#18191c] text-white">0.5x</option>
            <option value={1} className="bg-[#18191c] text-white">1.0x</option>
            <option value={1.5} className="bg-[#18191c] text-white">1.5x</option>
            <option value={2} className="bg-[#18191c] text-white">2.0x</option>
          </select>
        </div>
      </div>

      {/* Right Actions: User Account + Export Buttons */}
      <div className="flex items-center gap-2">
        {user && onSignOut && (
          <div className="flex items-center gap-2 border-r border-[#27282d] pr-3 mr-1">
            <span
              className="font-mono text-[11px] text-[#8e919a] hidden md:inline max-w-[140px] truncate"
              title={user.email || ''}
            >
              {user.email}
            </span>
            <button
              onClick={onSignOut}
              title="Sign Out of Procedural Studio"
              className="px-2.5 py-1 bg-[#18191c] hover:bg-[#25262c] border border-[#27282d] hover:border-[#3f3f46] text-[#e4e4e7] hover:text-white font-mono text-[11px] rounded transition"
            >
              Sign Out
            </button>
          </div>
        )}

        <button
          onClick={() => onOpenExport('svg')}
          className="flex items-center gap-1.5 bg-white hover:bg-neutral-200 text-black font-medium text-xs rounded px-3 py-1.5 shadow-sm transition active:scale-95"
        >
          <Download size={13} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};

