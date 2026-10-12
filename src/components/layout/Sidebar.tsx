import React, { useState } from 'react';
import { usePlaygroundStore } from '../../store/playgroundStore';
import { GeneratorMode } from '../../engine/core/types';
import { PARAM_DEFINITIONS, ASPECT_RATIOS } from '../../store/defaults';
import { PALETTES } from '../../store/palettes';
import {
  Waves,
  Infinity as LoopIcon,
  GitFork,
  Radio,
  Mountain,
  Share2,
  Lock,
  Unlock,
  RefreshCw,
  Copy,
  Check,
  Palette as PaletteIcon,
  Sliders,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const MODE_ITEMS: { mode: GeneratorMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'waveforms', label: 'Waveforms', icon: <Waves size={15} /> },
  { mode: 'loops', label: 'Loops', icon: <LoopIcon size={15} /> },
  { mode: 'branches', label: 'Branches', icon: <GitFork size={15} /> },
  { mode: 'interference', label: 'Interference', icon: <Radio size={15} /> },
  { mode: 'contours', label: 'Contours', icon: <Mountain size={15} /> },
  { mode: 'connections', label: 'Connections', icon: <Share2 size={15} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const {
    mode,
    setMode,
    configs,
    updateParam,
    seed,
    setSeed,
    rollSeed,
    paletteId,
    setPaletteId,
    dimensions,
    setDimensions,
    lockedParams,
    toggleLockParam,
    isPaletteLocked,
    toggleLockPalette,
    resetCurrentMode,
    randomizeGeometryOnly,
  } = usePlaygroundStore();

  const [copiedSeed, setCopiedSeed] = useState(false);
  const [activeTab, setActiveTab] = useState<'params' | 'style' | 'seed'>('params');

  const currentConfig = configs[mode] as any;
  const paramDefs = PARAM_DEFINITIONS[mode] || [];

  const handleCopySeed = () => {
    navigator.clipboard.writeText(seed.toString());
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 1500);
  };

  return (
    <aside
      className={`h-full bg-white border-l border-[#d9d9d9] flex flex-col flex-shrink-0 transition-all duration-200 z-20 relative select-none ${
        collapsed ? 'w-14' : 'w-80 md:w-84'
      }`}
    >
      {/* Mode Selector Navigation */}
      <div className={`p-2 border-b border-[#d9d9d9] bg-[#f9f9f9] ${collapsed ? 'flex flex-col gap-1' : 'grid grid-cols-6 gap-1'}`}>
        {MODE_ITEMS.map((item) => {
          const isActive = mode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => setMode(item.mode)}
              title={item.label}
              className={`flex flex-col items-center justify-center py-2 rounded transition relative border ${
                isActive
                  ? 'border-black text-black bg-transparent font-medium'
                  : 'border-transparent text-[#555555] hover:text-black hover:border-[#cccccc] hover:bg-[#f0f0f0]'
              }`}
            >
              {item.icon}
              {!collapsed && (
                <span className="text-[9px] mt-1 tracking-tight truncate max-w-full hidden md:inline">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub Tabs: Parameters | Palette | Seed */}
      {!collapsed && (
        <div className="flex border-b border-[#d9d9d9] text-xs font-mono bg-[#f5f5f5]">
          <button
            onClick={() => setActiveTab('params')}
            className={`flex-1 py-2 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'params'
                ? 'text-black border-b-2 border-black font-semibold bg-white'
                : 'text-[#666666] hover:text-black hover:bg-[#eeeeee]'
            }`}
          >
            <Sliders size={12} />
            <span>Parameters</span>
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-2 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'style'
                ? 'text-black border-b-2 border-black font-semibold bg-white'
                : 'text-[#666666] hover:text-black hover:bg-[#eeeeee]'
            }`}
          >
            <PaletteIcon size={12} />
            <span>Palette</span>
          </button>
          <button
            onClick={() => setActiveTab('seed')}
            className={`flex-1 py-2 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'seed'
                ? 'text-black border-b-2 border-black font-semibold bg-white'
                : 'text-[#666666] hover:text-black hover:bg-[#eeeeee]'
            }`}
          >
            <RefreshCw size={12} />
            <span>Seed</span>
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 text-black">
        {collapsed ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-[#f0f0f2] text-[#555555] hover:text-black rounded"
              title="Expand Controls"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        ) : (
          <>
            {/* TAB 1: PARAMETERS */}
            {activeTab === 'params' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-[#e8e8e8]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#555555]">
                    {mode.toUpperCase()} Controls
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={randomizeGeometryOnly}
                      className="text-[10px] text-[#555555] hover:text-black underline font-mono"
                    >
                      Shuffle
                    </button>
                    <button
                      onClick={resetCurrentMode}
                      className="text-[10px] text-[#555555] hover:text-black underline font-mono"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {paramDefs.map((def) => {
                    const value = currentConfig[def.key];
                    const lockKey = `${mode}.${def.key}`;
                    const isLocked = Boolean(lockedParams[lockKey] || lockedParams[def.key]);

                    if (def.type === 'range') {
                      return (
                        <div key={def.key} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#222222] font-medium flex items-center gap-1.5">
                              {def.label}
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="text-[#555555] text-[11px] tabular-nums">
                                {typeof value === 'number'
                                  ? def.step < 1
                                    ? value.toFixed(2)
                                    : value
                                  : value}
                              </span>
                              <button
                                onClick={() => toggleLockParam(lockKey)}
                                title={isLocked ? 'Unlock parameter' : 'Lock parameter during randomization'}
                                className={`p-0.5 rounded transition ${
                                  isLocked
                                    ? 'text-black'
                                    : 'text-[#999999] hover:text-black'
                                }`}
                              >
                                {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
                              </button>
                            </div>
                          </div>

                          <input
                            type="range"
                            min={def.min}
                            max={def.max}
                            step={def.step}
                            value={value}
                            onChange={(e) =>
                              updateParam(def.key, parseFloat(e.target.value))
                            }
                            className="w-full cursor-pointer"
                          />
                        </div>
                      );
                    }

                    if (def.type === 'boolean') {
                      return (
                        <div
                          key={def.key}
                          className="flex items-center justify-between py-1 text-xs"
                        >
                          <span className="text-[#222222] font-medium">{def.label}</span>
                          <button
                            onClick={() => updateParam(def.key, !value)}
                            className={`w-9 h-5 rounded-full transition-colors relative border border-[#d9d9d9] ${
                              value ? 'bg-black' : 'bg-[#e5e5e5]'
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                                value ? 'right-0.5' : 'left-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    }

                    if (def.type === 'select' && def.options) {
                      return (
                        <div key={def.key} className="space-y-1 text-xs">
                          <label className="text-[#222222] font-medium block">
                            {def.label}
                          </label>
                          <select
                            value={value}
                            onChange={(e) => updateParam(def.key, e.target.value)}
                            className="w-full bg-[#f9f9f9] border border-[#d9d9d9] hover:border-black rounded px-2.5 py-1.5 text-xs text-black outline-none capitalize cursor-pointer"
                          >
                            {def.options.map((opt) => (
                              <option key={opt} value={opt} className="bg-white text-black">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: PALETTE & ARTBOARD */}
            {activeTab === 'style' && (
              <div className="space-y-5">
                {/* Palette Selection */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-[#e8e8e8]">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#555555]">
                      Curated Palettes
                    </span>
                    <button
                      onClick={toggleLockPalette}
                      title={isPaletteLocked ? 'Unlock Palette' : 'Lock Palette'}
                      className={`flex items-center gap-1 text-[11px] font-mono ${
                        isPaletteLocked ? 'text-black font-semibold' : 'text-[#888888] hover:text-black'
                      }`}
                    >
                      {isPaletteLocked ? <Lock size={11} /> : <Unlock size={11} />}
                      <span>{isPaletteLocked ? 'Locked' : 'Unlocked'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {PALETTES.map((pal) => {
                      const isSelected = pal.id === paletteId;
                      return (
                        <button
                          key={pal.id}
                          onClick={() => setPaletteId(pal.id)}
                          className={`flex items-center justify-between p-2 rounded border transition text-left ${
                            isSelected
                              ? 'border-black bg-[#f5f5f5]'
                              : 'border-[#d9d9d9] hover:border-[#888888] bg-white'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-medium text-black">
                              {pal.name}
                            </div>
                            <div className="text-[10px] text-[#777777] font-mono capitalize">
                              {pal.mode}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-[#f0f0f2] p-1 rounded border border-[#e5e5e5]">
                            <div
                              className="w-4 h-4 rounded-sm border border-[#cccccc]"
                              style={{ backgroundColor: pal.background }}
                              title="Background"
                            />
                            {pal.colors.slice(0, 3).map((c, i) => (
                              <div
                                key={i}
                                className="w-4 h-4 rounded-sm border border-[#cccccc]"
                                style={{ backgroundColor: c }}
                                title={c}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Artboard Aspect Ratio */}
                <div className="space-y-2.5 pt-2 border-t border-[#e8e8e8]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#555555] block pb-1 border-b border-[#e8e8e8]">
                    Artboard Ratio
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {ASPECT_RATIOS.map((aspect) => {
                      const isSelected =
                        dimensions.width === aspect.width &&
                        dimensions.height === aspect.height;
                      return (
                        <button
                          key={aspect.label}
                          onClick={() =>
                            setDimensions({
                              width: aspect.width,
                              height: aspect.height,
                              aspectRatioLabel: aspect.label,
                            })
                          }
                          className={`flex items-center justify-between px-3 py-2 rounded text-xs border transition ${
                            isSelected
                              ? 'border-black bg-black text-white font-medium'
                              : 'border-[#d9d9d9] hover:border-black bg-white text-black'
                          }`}
                        >
                          <span>{aspect.label}</span>
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-neutral-300' : 'text-[#777777]'}`}>
                            {aspect.width} × {aspect.height}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SEED & REPRODUCIBILITY */}
            {activeTab === 'seed' && (
              <div className="space-y-4">
                <div className="pb-1 border-b border-[#e8e8e8]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#555555]">
                    Deterministic Seed
                  </span>
                </div>

                <p className="text-xs text-[#555555] leading-relaxed">
                  Every unique seed and parameter set produces an identical vector composition.
                  Save or share your seed to recreate this artwork anytime.
                </p>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-[#555555] block">
                    Active Seed Value
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                      className="flex-1 bg-[#f9f9f9] border border-[#d9d9d9] rounded px-3 py-1.5 text-xs font-mono text-black outline-none focus:border-black"
                    />
                    <button
                      onClick={rollSeed}
                      title="Roll New Random Seed"
                      className="p-2 bg-[#f0f0f2] hover:bg-[#e5e5e5] border border-[#d9d9d9] rounded text-black transition"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      onClick={handleCopySeed}
                      title="Copy Seed"
                      className="p-2 bg-[#f0f0f2] hover:bg-[#e5e5e5] border border-[#d9d9d9] rounded text-black transition"
                    >
                      {copiedSeed ? <Check size={14} className="text-black" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#e8e8e8] space-y-2">
                  <span className="text-[11px] font-mono text-[#555555] block">
                    Quick Jump Seeds
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1042, 2048, 4401, 7705, 6632, 5531].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSeed(s)}
                        className={`py-1 rounded text-xs font-mono border transition ${
                          seed === s
                            ? 'border-black bg-black text-white font-medium'
                            : 'border-[#d9d9d9] hover:border-black bg-white text-[#444444]'
                        }`}
                      >
                        #{s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-[#d9d9d9] flex items-center justify-between text-[#777777] text-xs bg-[#f9f9f9]">
        {!collapsed && (
          <span className="text-[10px] font-mono px-2 text-[#777777]">v1.1.0-RELEASE</span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-[#eeeeee] hover:text-black rounded ml-auto transition text-black"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
    </aside>
  );
};
