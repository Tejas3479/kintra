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
      name: '4. Strategic Brief Review',
      status:
        project.stage === 'intake' || project.stage === 'discovery' || project.stage === 'research'
          ? 'upcoming'
          : project.stage === 'brief_review'
          ? 'active'
          : 'completed',
    },
    {
      id: 'strategy_locked',
      name: '5. Strategy Baseline Locked',
      status: project.stage === 'strategy_locked' ? 'active' : 'upcoming',
    },
  ];

  // Calculated Metrics
  const pendingDecisionsCount =
    project.ideaBrief && project.ideaBrief.status === 'under_review' ? 1 : 0;
  const unresolvedQuestionsCount = project.unresolvedQuestions.filter((q) => !q.resolved).length;
  const factsCount = project.extractedFacts.length;
  const assumptionsCount = project.hypotheses.length;
  const evidenceCount = project.marketLandscape?.evidenceRecords.length || 0;

  return (
    <div className="bg-zinc-900/60 border-b border-zinc-800/80 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Stage Timeline */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {stages.map((st, i) => (
            <React.Fragment key={st.id}>
              {i > 0 && <div className="h-0.5 w-4 bg-zinc-800 shrink-0" />}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  st.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : st.status === 'active'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 ring-1 ring-indigo-500/30'
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                }`}
              >
                {st.status === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : st.status === 'active' ? (
                  <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-zinc-700" />
                )}
                {st.name}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* State Badges / Telemetry */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-1" title="Extracted Facts">
            <span className="font-semibold text-zinc-200">{factsCount}</span> Facts
          </div>
          <span className="text-zinc-700">•</span>
          <div className="flex items-center gap-1" title="Unverified Hypotheses">
            <span className="font-semibold text-amber-400">{assumptionsCount}</span> Hypotheses
          </div>
          <span className="text-zinc-700">•</span>
          <div className="flex items-center gap-1" title="Grounded Evidence Sources">
            <span className="font-semibold text-emerald-400">{evidenceCount}</span> Sources
          </div>
          <span className="text-zinc-700">•</span>
          <div
            className={`flex items-center gap-1 ${
              pendingDecisionsCount > 0 ? 'text-amber-300 font-semibold' : ''
            }`}
            title="Decisions awaiting founder approval"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{pendingDecisionsCount} Pending Approval</span>
          </div>
          {unresolvedQuestionsCount > 0 && (
            <>
              <span className="text-zinc-700">•</span>
              <div className="flex items-center gap-1 text-cyan-400" title="Unresolved Questions">
                <HelpCircle className="w-3.5 h-3.5" />
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
