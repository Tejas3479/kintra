'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
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

export default function Home() {
  return (
    <div className="min-h-screen bg-obsidian-mesh text-zinc-100 flex flex-col font-sans selection:bg-champagne-500/30 selection:text-champagne-200">
      <Header />
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
      <PresentationModeModal />
      <footer className="border-t border-white/[0.06] bg-obsidian-950/80 backdrop-blur py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">KINTRA</span>
            <span>—</span>
            <span>Autonomous Brand Intelligence & Consistency Engine</span>
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
