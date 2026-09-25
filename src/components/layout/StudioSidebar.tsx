'use client';

import React from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import {
  Compass,
  Search,
  Target,
  Palette,
  ShieldCheck,
  FlaskConical,
  Rocket,
  GitCommit,
  Layers,
  LayoutGrid,
  Bookmark,
  GitBranch,
  X,
  Play,
  PanelLeftClose,
  PanelLeftOpen,
  AlertTriangle,
} from 'lucide-react';

export type StudioStageId =
  | 'discovery'
  | 'research'
  | 'strategy'
  | 'identity'
  | 'guardian'
  | 'scenario_lab'
  | 'launch_kit'
  | 'decisions';

export interface StageConfig {
  id: StudioStageId;
  number: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  icon: React.ElementType;
  sectionId: string;
}

export const STUDIO_STAGES: StageConfig[] = [
  {
    id: 'discovery',
    number: 1,
    title: 'Raw Idea & Discovery',
    shortTitle: 'Discovery',
    subtitle: 'Adaptive interview & facts',
    icon: Compass,
    sectionId: 'stage-discovery',
  },
  {
    id: 'research',
    number: 2,
    title: 'Evidence Ledger',
    shortTitle: 'Evidence',
    subtitle: 'Market data & competitors',
    icon: Search,
    sectionId: 'stage-research',
  },
  {
    id: 'strategy',
    number: 3,
    title: 'Strategic Positioning',
    shortTitle: 'Strategy',
    subtitle: 'Contrarian worlds & sacrifice',
    icon: Target,
    sectionId: 'stage-strategy',
  },
  {
    id: 'identity',
    number: 4,
    title: 'Creative Identity',
    shortTitle: 'Identity',
    subtitle: 'Voice, visuals & naming',
    icon: Palette,
    sectionId: 'stage-identity',
  },
  {
    id: 'guardian',
    number: 5,
    title: 'Consistency Guardian',
    shortTitle: 'Guardian',
    subtitle: '6D integrity gatekeeper',
    icon: ShieldCheck,
    sectionId: 'stage-guardian',
  },
  {
    id: 'scenario_lab',
    number: 6,
    title: 'Scenario Lab & Evolution',
    shortTitle: 'Scenario Lab',
    subtitle: 'Stress-tests & branching',
    icon: FlaskConical,
    sectionId: 'stage-scenario_lab',
  },
  {
    id: 'launch_kit',
    number: 7,
    title: 'Launch Kit & Guidelines',
    shortTitle: 'Launch Kit',
    subtitle: 'Brand book & export assets',
    icon: Rocket,
    sectionId: 'stage-launch_kit',
  },
  {
    id: 'decisions',
    number: 8,
    title: 'Decision Ledger',
    shortTitle: 'Decisions',
    subtitle: 'Immutable audit DAG',
    icon: GitCommit,
    sectionId: 'stage-decisions',
  },
];

interface StudioSidebarProps {
  activeStage: StudioStageId;
  onSelectStage: (stageId: StudioStageId) => void;
  viewMode: 'focused' | 'continuous';
  onToggleViewMode: (mode: 'focused' | 'continuous') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenSnapshotDialog?: () => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  activeStage,
  onSelectStage,
  viewMode,
  onToggleViewMode,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenSnapshotDialog,
}) => {
  const { project, togglePresentationMode } = useBrandStore();

  // Metrics computation for each stage
  const factsCount = project.extractedFacts.length;
  const evidenceCount = project.marketLandscape?.evidenceRecords.length || 0;
  const worldsCount = project.positioningWorlds.length;
  const hasContradictions = project.contradictions && project.contradictions.length > 0;
  const hasIdentity = !!project.creativeIdentity;
  const brandArtifacts = project.brandArtifacts || [];
  const guardianAvgScore =
    brandArtifacts.length > 0
      ? Math.round(
          (brandArtifacts.filter((a) => a.validationReport?.passed).length /
            brandArtifacts.length) *
            100
        )
      : null;
  const scenariosCount = project.scenarioArtifacts?.length || 0;
  const hasLaunchKit = !!project.launchKit;
  const decisionsCount = Object.keys(project.decisions || {}).length;

  // Global Brand Readiness Calculation (0-100%)
  const readinessScore = Math.min(
    100,
    Math.round(
      (factsCount > 0 ? 15 : 0) +
        (evidenceCount > 0 ? 15 : 0) +
        (project.selectedWorldId ? 20 : worldsCount > 0 ? 10 : 0) +
        (hasIdentity ? 15 : 0) +
        (guardianAvgScore ? Math.round(guardianAvgScore * 0.15) : 0) +
        (scenariosCount > 0 ? 10 : 0) +
        (hasLaunchKit ? 10 : 0)
    )
  );

  const getStageMeta = (stageId: StudioStageId) => {
    switch (stageId) {
      case 'discovery':
        return {
          status: project.ideaBrief ? 'completed' : factsCount > 0 ? 'active' : 'upcoming',
          badge: factsCount > 0 ? `${factsCount} facts` : 'Intake',
        };
      case 'research':
        return {
          status: evidenceCount > 0 ? 'completed' : 'upcoming',
          badge: evidenceCount > 0 ? `${evidenceCount} sources` : '0 sources',
        };
      case 'strategy':
        return {
          status: project.selectedWorldId ? 'completed' : worldsCount > 0 ? 'active' : 'upcoming',
          badge: worldsCount > 0 ? `${worldsCount} worlds` : 'Draft',
          hasWarning: hasContradictions,
        };
      case 'identity': {
        const selectedCandidate = project.creativeIdentity?.namingCandidates.find(
          (c) => c.id === project.creativeIdentity?.selectedNameId
        );
        const nameLabel = selectedCandidate?.name || (hasIdentity ? 'Active' : 'Draft');
        return {
          status: hasIdentity ? 'completed' : 'upcoming',
          badge: nameLabel,
        };
      }
      case 'guardian':
        return {
          status:
            guardianAvgScore !== null
              ? guardianAvgScore >= 80
                ? 'completed'
                : 'active'
              : 'upcoming',
          badge: guardianAvgScore !== null ? `${guardianAvgScore}%` : 'Gatekeeper',
        };
      case 'scenario_lab':
        return {
          status: scenariosCount > 0 ? 'completed' : 'upcoming',
          badge: scenariosCount > 0 ? `${scenariosCount} tests` : '7 tests',
        };
      case 'launch_kit':
        return {
          status: hasLaunchKit ? 'completed' : 'upcoming',
          badge: hasLaunchKit ? 'Ready' : 'Draft',
        };
      case 'decisions':
        return {
          status: decisionsCount > 0 ? 'completed' : 'upcoming',
          badge: `${decisionsCount} locked`,
        };
    }
  };

  const handleStageClick = (stageId: StudioStageId) => {
    onSelectStage(stageId);
    if (viewMode === 'continuous') {
      const stageConfig = STUDIO_STAGES.find((s) => s.id === stageId);
      if (stageConfig) {
        const el = document.getElementById(stageConfig.sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-obsidian-950 border-r border-white/[0.08] select-none text-zinc-300">
      {/* 1. Header: Brand Overview & Branch */}
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex flex-col min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-100 truncate tracking-wide">
                {project.metadata.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-champagne-400 font-mono font-medium">
                v{project.metadata.version}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-400">
                <GitBranch className="w-3 h-3 text-emerald-400" />
                {project.currentBranchId || 'main'}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-[11px] font-mono text-champagne-400">
                {readinessScore}% Integrity
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center py-1">
            <div className="w-8 h-8 rounded-lg bg-champagne-500/10 border border-champagne-500/30 flex items-center justify-center text-champagne-400 font-bold text-xs">
              {readinessScore}%
            </div>
          </div>
        )}

        {/* Mobile close button / Desktop collapse toggle */}
        <div className="flex items-center gap-1">
          {isMobileOpen ? (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Close mobile navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-zinc-400 hover:text-champagne-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-zinc-400 hover:text-champagne-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Brand Readiness Progress Bar */}
      {!isCollapsed && (
        <div className="px-4 py-2.5 bg-obsidian-900/60 border-b border-white/[0.04]">
          <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
            <span className="text-zinc-400">Pipeline Readiness</span>
            <span className="text-champagne-400 font-semibold">{readinessScore}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-champagne-500 to-champagne-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(212,180,131,0.5)]"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
        </div>
      )}

      {/* 3. View Mode Toggle (Focused Stage vs Continuous Scroll) */}
      {!isCollapsed && (
        <div className="p-3 border-b border-white/[0.06]">
          <div className="bg-obsidian-900 p-1 rounded-xl border border-white/[0.06] grid grid-cols-2 gap-1 text-xs font-mono">
            <button
              type="button"
              onClick={() => onToggleViewMode('focused')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'focused'
                  ? 'bg-champagne-500/20 text-champagne-200 border border-champagne-500/35 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
              title="Show only the active workspace stage"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Focused</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleViewMode('continuous')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'continuous'
                  ? 'bg-champagne-500/20 text-champagne-200 border border-champagne-500/35 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
              title="Continuous scroll canvas showing all 8 stages"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Stage Workspaces Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin">
        {!isCollapsed && (
          <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold flex items-center justify-between">
            <span>Workspaces (8)</span>
            <span className="text-zinc-600 font-normal">v1.0</span>
          </div>
        )}

        {STUDIO_STAGES.map((stage) => {
          const isActive = activeStage === stage.id;
          const { status, badge, hasWarning } = getStageMeta(stage.id);
          const Icon = stage.icon;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => handleStageClick(stage.id)}
              className={`w-full text-left rounded-xl transition-all cursor-pointer flex items-center group relative overflow-hidden ${
                isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 gap-3'
              } ${
                isActive
                  ? 'monolith-card-gold text-champagne-100 border border-champagne-500/40 shadow-sm shadow-champagne-500/15'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08]'
              }`}
              title={`${stage.number}. ${stage.title} — ${stage.subtitle}`}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Active stage left luminous indicator */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-champagne-300 to-champagne-500 rounded-r shadow-[0_0_8px_rgba(212,180,131,0.8)]" />
              )}

              {/* Icon Container with Status dot */}
              <div className="relative shrink-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-champagne-500/25 text-champagne-300 border border-champagne-500/50 shadow-[0_0_12px_rgba(212,180,131,0.25)]'
                      : status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/35'
                      : 'bg-obsidian-900 text-zinc-400 border border-white/[0.06] group-hover:text-zinc-200 group-hover:border-white/[0.12]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Status Dot */}
                {status === 'completed' ? (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-obsidian-950 rounded-full" />
                ) : status === 'active' ? (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-champagne-400 border-2 border-obsidian-950 rounded-full animate-ping" />
                ) : null}
              </div>

              {/* Label details when expanded */}
              {!isCollapsed && (
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-semibold truncate tracking-tight ${
                        isActive ? 'text-champagne-100 font-bold' : 'text-zinc-300 group-hover:text-white'
                      }`}
                    >
                      {stage.number}. {stage.shortTitle}
                    </span>

                    {/* Metric badge or warning */}
                    {hasWarning ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5 font-mono">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Alert
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 ${
                          status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isActive
                            ? 'bg-champagne-500/20 text-champagne-300 border border-champagne-500/30'
                            : 'bg-white/[0.04] text-zinc-500 group-hover:text-zinc-400'
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 truncate mt-0.5 font-mono">
                    {stage.subtitle}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 5. Footer Quick Utilities */}
      <div className="p-3 border-t border-white/[0.06] bg-obsidian-900/50 space-y-1.5">
        {/* Presentation Mode Button */}
        <button
          type="button"
          onClick={() => togglePresentationMode(true)}
          className={`w-full flex items-center rounded-xl text-xs font-medium text-champagne-200 hover:text-white bg-champagne-500/15 hover:bg-champagne-500/25 border border-champagne-500/35 hover:border-champagne-400/50 shadow-sm shadow-champagne-500/10 transition-all cursor-pointer group ${
            isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 gap-2.5'
          }`}
          title="Open Executive Pitch & Presentation Deck (Full Screen • Press F5)"
        >
          <Play className="w-3.5 h-3.5 text-champagne-400 fill-champagne-400/30 group-hover:scale-110 transition-transform shrink-0" />
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="font-bold truncate">Presentation Deck</span>
              <kbd className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-champagne-300/80 font-mono border border-champagne-500/20">F5</kbd>
            </div>
          )}
        </button>

        {/* Snapshot Quick Action */}
        {onOpenSnapshotDialog && (
          <button
            type="button"
            onClick={onOpenSnapshotDialog}
            className={`w-full flex items-center rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all cursor-pointer ${
              isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 gap-2.5'
            }`}
            title="Create immutable version snapshot"
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Save Snapshot</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        role="navigation"
        aria-label="Studio Stage Navigation"
        className={`hidden lg:flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-20 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Slide-over */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Slide-over Drawer */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
