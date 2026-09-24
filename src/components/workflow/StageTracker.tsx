'use client';

import React from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import { CheckCircle2, Clock, HelpCircle, FileText, AlertCircle } from 'lucide-react';

export const StageTracker: React.FC = () => {
  const { project, error, clearError } = useBrandStore();

  const stages = [
    {
      id: 'intake',
      name: '1. Raw Idea Intake',
      status: project.stage === 'intake' ? 'active' : 'completed',
    },
    {
      id: 'discovery',
      name: '2. Adaptive Discovery',
      status:
        project.stage === 'intake'
          ? 'upcoming'
          : project.stage === 'discovery'
          ? 'active'
          : 'completed',
    },
    {
      id: 'research',
      name: '3. Evidence Ledger',
      status:
        project.stage === 'intake' || project.stage === 'discovery'
          ? 'upcoming'
          : project.stage === 'research'
          ? 'active'
          : 'completed',
    },
    {
      id: 'brief_review',
      name: '4. Strategy Baseline',
      status:
        project.stage === 'intake' || project.stage === 'discovery' || project.stage === 'research'
          ? 'upcoming'
          : project.stage === 'brief_review'
          ? 'active'
          : 'completed',
    },
    {
      id: 'strategy_locked',
      name: '5. Creative Identity',
      status:
        project.stage === 'strategy_locked' || project.stage === 'identity'
          ? 'active'
          : project.stage === 'identity_locked' || project.stage === 'guardian' || project.stage === 'guardian_locked'
          ? 'completed'
          : 'upcoming',
    },
    {
      id: 'guardian',
      name: '6. Consistency Guardian',
      status:
        project.stage === 'guardian_locked' || project.stage === 'scenario_lab' || project.stage === 'evolution'
          ? 'completed'
          : project.stage === 'guardian' || project.stage === 'identity_locked'
          ? 'active'
          : 'upcoming',
    },
    {
      id: 'scenario_lab',
      name: '7. Scenario Lab & Evolution',
      status:
        project.stage === 'launch_kit'
          ? 'completed'
          : project.stage === 'scenario_lab' || project.stage === 'evolution' || project.stage === 'guardian_locked'
          ? 'active'
          : 'upcoming',
    },
    {
      id: 'launch_kit',
      name: '8. Launch Kit & Guidelines',
      status:
        project.stage === 'launch_kit'
          ? 'active'
          : project.launchKit
          ? 'completed'
          : 'upcoming',
    },
  ];

  // Calculated Metrics
  const pendingDecisionsCount =
    project.ideaBrief && project.ideaBrief.status === 'under_review' ? 1 : 0;
  const unresolvedQuestionsCount = project.unresolvedQuestions.filter((q) => !q.resolved).length;
  const factsCount = project.extractedFacts.length;
  const assumptionsCount = project.hypotheses.length;
  const evidenceCount = project.marketLandscape?.evidenceRecords.length || 0;

  const stageSectionMap: Record<string, string> = {
    intake: 'stage-discovery',
    discovery: 'stage-discovery',
    research: 'stage-research',
    brief_review: 'stage-strategy',
    strategy_locked: 'stage-identity',
    guardian: 'stage-guardian',
    scenario_lab: 'stage-scenario_lab',
    launch_kit: 'stage-launch_kit',
  };

  const scrollToStage = (stageId: string) => {
    const targetSectionId = stageSectionMap[stageId] || 'stage-discovery';
    const element = document.getElementById(targetSectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-obsidian-900/90 border-b border-white/[0.06] backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3 sticky top-16 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Stage Timeline */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {stages.map((st, i) => (
            <React.Fragment key={st.id}>
              {i > 0 && <div className="h-px w-3 bg-white/[0.08] shrink-0" />}
              <button
                type="button"
                onClick={() => scrollToStage(st.id)}
                title={`Jump to ${st.name}`}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer hover:scale-105 ${
                  st.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20'
                    : st.status === 'active'
                    ? 'bg-champagne-500/15 text-champagne-300 border border-champagne-500/40 ring-1 ring-champagne-500/30 hover:bg-champagne-500/25 shadow-sm shadow-champagne-500/10'
                    : 'bg-obsidian-950 text-zinc-500 border border-white/[0.05] hover:text-zinc-300 hover:border-white/[0.12]'
                }`}
              >
                {st.status === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : st.status === 'active' ? (
                  <Clock className="w-3.5 h-3.5 text-champagne-400 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-white/[0.12]" />
                )}
                {st.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* State Badges / Telemetry */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 shrink-0 font-mono">
          <div className="flex items-center gap-1.5" title="Extracted Facts">
            <span className="font-semibold text-zinc-200">{factsCount}</span> Facts
          </div>
          <span className="text-zinc-700">•</span>
          <div className="flex items-center gap-1.5" title="Unverified Hypotheses">
            <span className="font-semibold text-amber-400">{assumptionsCount}</span> Hypotheses
          </div>
          <span className="text-zinc-700">•</span>
          <div className="flex items-center gap-1.5" title="Grounded Evidence Sources">
            <span className="font-semibold text-emerald-400">{evidenceCount}</span> Sources
          </div>
          <span className="text-zinc-700">•</span>
          <div
            className={`flex items-center gap-1.5 ${
              pendingDecisionsCount > 0 ? 'text-champagne-400 font-semibold' : ''
            }`}
            title="Decisions awaiting founder approval"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{pendingDecisionsCount} Pending</span>
          </div>
          {unresolvedQuestionsCount > 0 && (
            <>
              <span className="text-zinc-700">•</span>
              <div className="flex items-center gap-1.5 text-slate-300" title="Unresolved Questions">
                <HelpCircle className="w-3.5 h-3.5 text-champagne-400" />
                <span>{unresolvedQuestionsCount} Open Unknowns</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mt-3 bg-red-950/70 border border-red-800/80 rounded-lg px-4 py-2 text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-white font-medium ml-4 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
