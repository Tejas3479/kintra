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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Header />
      <StageTracker />
      <main className="flex-1 space-y-6 pb-12">
        <ErrorBoundary fallbackTitle="Workspace Encountered an Error">
          <DiscoveryWorkspace />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <EvidenceWorkspace />
            <PositioningWorkspace />
            <CreativeIdentityWorkspace />
            <ConsistencyGuardianWorkspace />
            <ScenarioLabWorkspace />
            <LaunchKitWorkspace />
            <DecisionLedger />
          </div>
        </ErrorBoundary>
      </main>
      <PresentationModeModal />
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>KINTRA Brand Intelligence Engine — Inkloom Challenge 2026</span>
          <span className="font-mono text-zinc-600">Stateful Decision Model v1.0</span>
        </div>
      </footer>
    </div>
  );
}
