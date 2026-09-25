'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { LandingPage } from '@/components/landing/LandingPage';
import { StudioSidebar, STUDIO_STAGES, StudioStageId } from '@/components/layout/StudioSidebar';
import { StageNavigationFooter } from '@/components/layout/StageNavigationFooter';
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
import { Bookmark } from 'lucide-react';

export default function Home() {
  const [viewMode, setViewMode] = useState<'landing' | 'studio'>('landing');
  const [activeStage, setActiveStage] = useState<StudioStageId>('discovery');
  const [workspaceMode, setWorkspaceMode] = useState<'focused' | 'continuous'>('focused');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('');

  const { loadDemoProject, createSnapshot, isHydrated } = useBrandStore();

  // Check URL hash / query on client mount for direct stage navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').replace('stage-', '');
      const validStages: StudioStageId[] = [
        'discovery',
        'research',
        'strategy',
        'identity',
        'guardian',
        'scenario_lab',
        'launch_kit',
        'decisions',
      ];

      if (validStages.includes(hash as StudioStageId)) {
        setActiveStage(hash as StudioStageId);
        setViewMode('studio');
      } else if (window.location.hash.includes('studio') || window.location.search.includes('view=studio')) {
        setViewMode('studio');
      }
    }
  }, []);

  // Keyboard shortcut: Ctrl+B or Cmd+B toggles sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const handleSelectStage = (stageId: StudioStageId) => {
    setActiveStage(stageId);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${stageId}`);
      if (workspaceMode === 'focused') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const activeStageConfig = STUDIO_STAGES.find((s) => s.id === activeStage);
  const activeStageTitle = activeStageConfig
    ? `${activeStageConfig.number}. ${activeStageConfig.shortTitle}`
    : undefined;

  if (viewMode === 'studio' && !isHydrated) {
    return (
      <div className="min-h-screen bg-obsidian-mesh text-zinc-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4 p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl max-w-sm text-center">
          <div className="w-10 h-10 border-2 border-champagne-400 border-t-transparent rounded-full animate-spin" />
          <div>
            <h3 className="font-serif text-lg font-medium text-champagne-200">Rehydrating Studio</h3>
            <p className="text-xs text-zinc-400 mt-1">Restoring canonical state and decision ledger...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian-mesh text-zinc-100 flex flex-col font-sans selection:bg-champagne-500/30 selection:text-champagne-200">
      {viewMode === 'studio' && (
        <Header
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          activeStageTitle={activeStageTitle}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onToggleCollapseSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          isSidebarCollapsed={isSidebarCollapsed}
        />
      )}

      {viewMode === 'landing' ? (
        <main className="flex-1">
          <LandingPage
            onEnterStudio={handleEnterStudio}
            onLoadSample={handleLoadSampleAndEnter}
          />
        </main>
      ) : (
        <div className="flex-1 flex min-h-[calc(100vh-4rem)] relative">
          {/* Atmospheric Background Effects for Studio */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
            <div className="absolute inset-0 bg-grid-cyber opacity-30 mask-radial-fade" />
            <div className="absolute inset-0 bg-dot-matrix opacity-15" />
            <div className="glow-orb-gold w-[560px] h-[560px] -top-32 right-[8%] opacity-20 pointer-events-none" />
            <div className="glow-orb-steel w-[440px] h-[440px] bottom-[15%] left-[15%] opacity-15 pointer-events-none" />
          </div>

          {/* Navigation Sidebar */}
          <StudioSidebar
            activeStage={activeStage}
            onSelectStage={handleSelectStage}
            viewMode={workspaceMode}
            onToggleViewMode={setWorkspaceMode}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            onOpenSnapshotDialog={() => setShowSnapshotDialog(true)}
          />

          {/* Main Workspace Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
              <ErrorBoundary fallbackTitle="Workspace Encountered an Error">
                {workspaceMode === 'focused' ? (
                  <div key={activeStage} className="animate-workspace-enter space-y-6">
                    {activeStage === 'discovery' && (
                      <section id="stage-discovery">
                        <DiscoveryWorkspace />
                      </section>
                    )}
                    {activeStage === 'research' && (
                      <section id="stage-research">
                        <EvidenceWorkspace />
                      </section>
                    )}
                    {activeStage === 'strategy' && (
                      <section id="stage-strategy">
                        <PositioningWorkspace />
                      </section>
                    )}
                    {activeStage === 'identity' && (
                      <section id="stage-identity">
                        <CreativeIdentityWorkspace />
                      </section>
                    )}
                    {activeStage === 'guardian' && (
                      <section id="stage-guardian">
                        <ConsistencyGuardianWorkspace />
                      </section>
                    )}
                    {activeStage === 'scenario_lab' && (
                      <section id="stage-scenario_lab">
                        <ScenarioLabWorkspace />
                      </section>
                    )}
                    {activeStage === 'launch_kit' && (
                      <section id="stage-launch_kit">
                        <LaunchKitWorkspace />
                      </section>
                    )}
                    {activeStage === 'decisions' && (
                      <section id="stage-decisions">
                        <DecisionLedger />
                      </section>
                    )}

                    {/* Sequential Progress Footer */}
                    <StageNavigationFooter
                      activeStage={activeStage}
                      onSelectStage={handleSelectStage}
                    />
                  </div>
                ) : (
                  <div className="space-y-12">
                    <section id="stage-discovery">
                      <DiscoveryWorkspace />
                    </section>
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
                )}
              </ErrorBoundary>
            </main>
          </div>
        </div>
      )}

      {/* Snapshot Dialog */}
      {showSnapshotDialog && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="monolith-card-gold rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 border border-champagne-500/40 animate-workspace-enter">
            <div>
              <h3 className="font-bold text-base text-zinc-100 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-champagne-400" />
                <span className="text-titanium-shimmer">Save Immutable Version Snapshot</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Creates a point-in-time snapshot of all brand decisions, positioning worlds, artifacts, and scenarios.
              </p>
            </div>
            <input
              type="text"
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
              placeholder="e.g. Pre-series A Positioning Locked"
              className="w-full bg-obsidian-950 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-champagne-500/50"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSnapshotDialog(false)}
                className="text-xs px-3.5 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (snapshotLabel.trim()) {
                    createSnapshot(snapshotLabel.trim());
                    setSnapshotLabel('');
                    setShowSnapshotDialog(false);
                  }
                }}
                disabled={!snapshotLabel.trim()}
                className="btn-monolith-primary text-xs px-4 py-2 rounded-xl disabled:opacity-50 cursor-pointer shadow-gold-glow"
              >
                Save Snapshot
              </button>
            </div>
          </div>
        </div>
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
