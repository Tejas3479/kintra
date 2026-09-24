'use client';

import React from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import { PersonalityWorkspace } from './PersonalityWorkspace';
import { NamingWorkspace } from './NamingWorkspace';
import { VoiceVisualWorkspace } from './VoiceVisualWorkspace';
import { Sparkles, RefreshCw, AlertCircle, Wand2 } from 'lucide-react';

export const CreativeIdentityWorkspace: React.FC = () => {
  const { project, generateCreativeIdentity, isLoading, loadingMessage } = useBrandStore();
  const identity = project.creativeIdentity;
  const isStrategyLocked = !!project.selectedWorldId;

  return (
    <section className="monolith-card rounded-2xl p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-champagne-400" />
              <span className="text-titanium-shimmer">4. Creative Identity & Expression System</span>
            </h2>
            {identity && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-champagne-500/10 text-champagne-300 border border-champagne-500/25 font-mono">
                {identity.namingCandidates.length} Names • {identity.personalityTraits.length} Traits
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Builds the creative expression layer directly on top of the locked strategic state. Never generates from scratch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => generateCreativeIdentity()}
            disabled={isLoading || !isStrategyLocked}
            className="btn-monolith-primary px-4 py-1.5 rounded-lg disabled:opacity-50 text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {identity ? 'Regenerate Identity System' : 'Synthesize Creative Identity'}
          </button>
        </div>
      </div>

      {/* Stage Gate Enforcement Warning */}
      {!isStrategyLocked && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-3 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold font-mono">Strategic Baseline Required:</span>
            <p className="text-zinc-300">
              Please lock a Positioning World in Stage 3 first. KINTRA derives personality, names, voice, and visuals directly from the approved strategic tradeoffs.
            </p>
          </div>
        </div>
      )}

      {/* Uninitialized State */}
      {!identity && isStrategyLocked && (
        <div className="bg-obsidian-950/70 border border-dashed border-white/[0.1] rounded-2xl p-8 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-champagne-400 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-200">Creative Identity Ready to Synthesize</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Strategic baseline is locked. Click synthesize to generate grounded personality traits, distinctive naming territories, voice cadence, and visual tokens.
          </p>
          <button
            onClick={() => generateCreativeIdentity()}
            disabled={isLoading}
            className="btn-monolith-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl disabled:opacity-50 text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? loadingMessage || 'Synthesizing...' : 'Synthesize Creative Identity'}</span>
          </button>
        </div>
      )}

      {/* Populated Identity Workspaces */}
      {identity && (
        <div className="space-y-8">
          <PersonalityWorkspace />
          <NamingWorkspace />
          <VoiceVisualWorkspace />
        </div>
      )}
    </section>
  );
};
