'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { STUDIO_STAGES, StudioStageId } from './StudioSidebar';

interface StageNavigationFooterProps {
  activeStage: StudioStageId;
  onSelectStage: (stageId: StudioStageId) => void;
}

export const StageNavigationFooter: React.FC<StageNavigationFooterProps> = ({
  activeStage,
  onSelectStage,
}) => {
  const currentIndex = STUDIO_STAGES.findIndex((s) => s.id === activeStage);
  const currentStage = STUDIO_STAGES[currentIndex] || STUDIO_STAGES[0];
  const prevStage = currentIndex > 0 ? STUDIO_STAGES[currentIndex - 1] : null;
  const nextStage = currentIndex < STUDIO_STAGES.length - 1 ? STUDIO_STAGES[currentIndex + 1] : null;

  const totalStages = STUDIO_STAGES.length;
  const percentComplete = Math.round(((currentIndex + 1) / totalStages) * 100);

  const handleNext = () => {
    if (nextStage) {
      onSelectStage(nextStage.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (prevStage) {
      onSelectStage(prevStage.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Stage sequence pagination"
      className="mt-12 pt-6 pb-2 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 select-none"
    >
      {/* Previous Stage Button */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={!prevStage}
        className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer group ${
          prevStage
            ? 'bg-obsidian-900/90 text-zinc-300 border-white/[0.08] hover:border-champagne-500/35 hover:text-white hover:bg-obsidian-850 shadow-sm'
            : 'bg-obsidian-950/40 text-zinc-600 border-white/[0.03] cursor-not-allowed opacity-50'
        }`}
        title={prevStage ? `Navigate to ${prevStage.number}. ${prevStage.title}` : 'First Stage'}
      >
        <ArrowLeft className={`w-3.5 h-3.5 ${prevStage ? 'group-hover:-translate-x-0.5 transition-transform text-zinc-400 group-hover:text-champagne-300' : ''}`} />
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-zinc-500 font-mono">Previous Stage</span>
          <span className="truncate max-w-[140px] sm:max-w-[180px]">
            {prevStage ? `${prevStage.number}. ${prevStage.shortTitle}` : 'None'}
          </span>
        </div>
      </button>

      {/* Center: Stage Progress Status */}
      <div className="flex flex-col items-center gap-1.5 text-center order-first sm:order-none">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-champagne-300">
            Stage {currentStage.number} of {totalStages} ({percentComplete}%)
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-xs text-zinc-300 font-medium">
            {currentStage.shortTitle}
          </span>
        </div>

        {/* Segmented Progress Dots */}
        <div className="flex items-center gap-1.5">
          {STUDIO_STAGES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onSelectStage(s.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title={`${s.number}. ${s.title}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-7 bg-champagne-400 ring-2 ring-champagne-500/40 shadow-[0_0_8px_rgba(212,180,131,0.6)]'
                  : idx < currentIndex
                  ? 'w-3 bg-emerald-400/90 hover:bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.35)]'
                  : 'w-2 bg-white/[0.12] hover:bg-white/[0.25]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Next Stage Button */}
      {nextStage ? (
        <button
          type="button"
          onClick={handleNext}
          className="btn-monolith-primary w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-gold-glow cursor-pointer hover:scale-[1.02] group"
          title={`Proceed to ${nextStage.number}. ${nextStage.title}`}
        >
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-obsidian-900/80 font-mono font-semibold">Next Stage</span>
            <span className="truncate max-w-[140px] sm:max-w-[180px] text-obsidian-950">
              {nextStage.number}. {nextStage.shortTitle}
            </span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-obsidian-950 group-hover:translate-x-0.5 transition-transform" />
        </button>
      ) : (
        <div className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Pipeline Complete</span>
        </div>
      )}
    </nav>
  );
};
