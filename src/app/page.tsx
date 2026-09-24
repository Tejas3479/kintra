'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { LandingPage } from '@/components/landing/LandingPage';
import { StageTracker } from '@/components/workflow/StageTracker';
import { DiscoveryWorkspace } from '@/components/discovery/DiscoveryWorkspace';
import { EvidenceWorkspace } from '@/components/research/EvidenceWorkspace';
import { PositioningWorkspace } from '@/components/strategy/PositioningWorkspace';
import { CreativeIdentityWorkspace } from '@/components/identity/CreativeIdentityWorkspace';
import { ConsistencyGuardianWorkspace } from '@/components/guardian/ConsistencyGuardianWorkspace';
import { ScenarioLabWorkspace } from '@/components/evolution/ScenarioLabWorkspace';
import { LaunchKitWorkspace } from '@/components/launch-kit/LaunchKitWorkspace';
import { PresentationModeModal } from '@/components/presentation/PresentationModeModal';
import { DecisionLedger } from '@/components/strategy/DecisionLedger';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useBrandStore } from '@/store/useBrandStore';

export default function Home() {
  const [viewMode, setViewMode] = useState<'landing' | 'studio'>('landing');
  const { loadDemoProject } = useBrandStore();

  // Check URL hash / query on client mount for direct navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash.includes('studio') || search.includes('view=studio')) {
        setViewMode('studio');
      }
    }
  }, []);

  const handleEnterStudio = () => {
    setViewMode('studio');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLoadSampleAndEnter = () => {
    loadDemoProject();
    setViewMode('studio');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-mesh text-zinc-100 flex flex-col font-sans selection:bg-champagne-500/30 selection:text-champagne-200">
      <Header viewMode={viewMode} onToggleViewMode={setViewMode} />

      {viewMode === 'landing' ? (
        <main className="flex-1">
          <LandingPage
            onEnterStudio={handleEnterStudio}
            onLoadSample={handleLoadSampleAndEnter}
          />
        </main>
      ) : (
        <>
          <StageTracker />
          <main className="flex-1 space-y-8 pb-16">
            <ErrorBoundary fallbackTitle="Workspace Encountered an Error">
              <section id="stage-discovery">
                <DiscoveryWorkspace />
              </section>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <section id="stage-research">
                  <EvidenceWorkspace />
                </section>
                <section id="stage-strategy">
                  <PositioningWorkspace />
                </section>
                <section id="stage-identity">
                  <CreativeIdentityWorkspace />
                </section>
                <section id="stage-guardian">
                  <ConsistencyGuardianWorkspace />
                </section>
                <section id="stage-scenario_lab">
                  <ScenarioLabWorkspace />
                </section>
                <section id="stage-launch_kit">
                  <LaunchKitWorkspace />
                </section>
                <section id="stage-decisions">
                  <DecisionLedger />
                </section>
              </div>
            </ErrorBoundary>
          </main>
        </>
      )}

      <PresentationModeModal />

      <footer className="border-t border-white/[0.06] bg-obsidian-950/80 backdrop-blur py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">KINTRA</span>
            <span>—</span>
            <span>Autonomous Brand Intelligence & Consistency Engine</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {viewMode === 'studio' ? (
              <button
                onClick={() => {
                  setViewMode('landing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-zinc-400 hover:text-champagne-300 transition-colors cursor-pointer"
              >
                ← Return to Overview Landing
              </button>
            ) : (
              <button
                onClick={handleEnterStudio}
                className="text-champagne-400 hover:text-champagne-300 transition-colors cursor-pointer"
              >
                Launch Brand Studio →
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-500">
            <span>Inkloom Challenge 2026</span>
            <span>•</span>
            <span className="text-champagne-400/80">Stateful Decision Model v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
