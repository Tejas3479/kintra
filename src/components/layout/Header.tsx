'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useBrandStore } from '@/store/useBrandStore';
import {
  Download,
  Upload,
  Bookmark,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Menu,
  Settings,
  Activity,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface HeaderProps {
  viewMode?: 'landing' | 'studio';
  onToggleViewMode?: (mode: 'landing' | 'studio') => void;
  activeStageTitle?: string;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
  onToggleCollapseSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode = 'landing',
  onToggleViewMode,
  activeStageTitle,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const {
    project,
    loadDemoProject,
    createSnapshot,
    resetProject,
    exportProjectJSON,
    importProjectJSON,
  } = useBrandStore();

  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [engineStatus, setEngineStatus] = useState<{
    hasApiKey: boolean;
    isDemoMode: boolean;
    hasTavilyKey: boolean;
    model: string;
    searchProvider: string;
  } | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [pingError, setPingError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setEngineStatus(data))
      .catch(() => {});
  }, []);

  const handleTestConnection = async () => {
    setIsPinging(true);
    setPingError(null);
    try {
      const res = await fetch('/api/health', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPingLatency(data.latencyMs);
      } else {
        setPingError(data.error || 'Connection failed.');
      }
    } catch (err) {
      setPingError(err instanceof Error ? err.message : 'Network failure');
    } finally {
      setIsPinging(false);
    }
  };

  const handleExport = () => {
    const jsonStr = exportProjectJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.metadata.slug}-v${project.metadata.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importProjectJSON(content);
        if (!res.success) {
          setImportError(res.error || 'Failed to import JSON.');
        } else {
          setImportError(null);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateSnapshot = () => {
    if (!snapshotLabel.trim()) return;
    createSnapshot(snapshotLabel.trim());
    setSnapshotLabel('');
    setShowSnapshotDialog(false);
  };

  return (
    <header className="border-b border-white/[0.06] bg-obsidian-950/85 backdrop-blur-xl sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Workspace Status */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          {viewMode === 'studio' && onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden h-8 w-8 rounded-lg bg-obsidian-900 border border-white/[0.08] text-zinc-300 hover:text-white hover:border-champagne-500/35 transition-colors cursor-pointer inline-flex items-center justify-center flex-shrink-0"
              aria-label="Toggle Stage Navigation Sidebar"
              aria-expanded={isMobileSidebarOpen}
              title="Open Navigation"
            >
              <Menu className="w-4 h-4 text-champagne-400" />
            </button>
          )}


          <button
            onClick={() => onToggleViewMode?.(viewMode === 'studio' ? 'landing' : 'studio')}
            className="flex items-center gap-2.5 text-left group cursor-pointer flex-shrink-0"
            title={viewMode === 'studio' ? 'Switch to Landing Overview' : 'Open Brand Studio'}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-champagne-500/35 shadow-md shadow-champagne-500/15 group-hover:scale-105 group-hover:border-champagne-400 transition-all bg-obsidian-950 flex-shrink-0 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="KINTRA Monolith Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-widest text-titanium-shimmer leading-none">
                KINTRA
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 mt-0.5">
                Brand Intelligence
              </span>
            </div>
          </button>

          {/* Active Stage Breadcrumb & Context info when in studio mode */}
          {viewMode === 'studio' && (
            <>
              <div className="h-4 w-px bg-white/[0.08] hidden md:block flex-shrink-0" />

              {activeStageTitle && (
                <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 font-mono whitespace-nowrap flex-shrink-0">
                  <span className="text-champagne-300 font-semibold px-2 py-0.5 rounded-md bg-champagne-500/10 border border-champagne-500/20">
                    {activeStageTitle}
                  </span>
                </div>
              )}

              <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-semibold text-zinc-200 truncate max-w-[150px] xl:max-w-[220px]">
                  {project.metadata.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-obsidian-900 border border-white/[0.06] text-champagne-400 font-mono flex-shrink-0">
                  v{project.metadata.version}
                </span>
                {project.metadata.isDemoProject && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-champagne-500/10 text-champagne-300 border border-champagne-500/25 inline-flex items-center gap-1.5 font-medium whitespace-nowrap flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-champagne-400" />
                    Demo Fixture
                  </span>
                )}
                {/* Live DAG Engine Telemetry */}
                <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono text-emerald-400 font-semibold whitespace-nowrap flex-shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.12)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  DAG_ACTIVE
                </span>

                {/* Live Engine Telemetry Pill */}
                {engineStatus && (
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(true)}
                    className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                      engineStatus.hasApiKey && !engineStatus.isDemoMode
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                    }`}
                    title="Click to view AI Engine Telemetry & Health"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        engineStatus.hasApiKey && !engineStatus.isDemoMode
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span>
                      {engineStatus.hasApiKey && !engineStatus.isDemoMode
                        ? 'AI: Gemini 3.8 Flash'
                        : 'AI: Offline Fallback'}
                    </span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Actions depending on viewMode */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {viewMode === 'landing' ? (
            <>
              <button
                onClick={() => {
                  loadDemoProject();
                  onToggleViewMode?.('studio');
                }}
                className="h-8 text-xs px-3 rounded-lg bg-obsidian-900/90 hover:bg-obsidian-850 text-zinc-300 border border-white/[0.08] hover:border-champagne-500/30 transition-all hidden sm:inline-flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                title="Load PRGuard DevSecOps sample brand"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-champagne-400 flex-shrink-0" />
                <span>Load Sample</span>
              </button>

              <button
                onClick={() => onToggleViewMode?.('studio')}
                className="btn-monolith-primary h-8 text-xs px-3.5 rounded-lg font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap"
              >
                <span>Enter Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              {/* Quick Demo Pre-seed button */}
              <button
                onClick={loadDemoProject}
                className="h-8 text-xs px-3 rounded-lg bg-obsidian-900/90 hover:bg-obsidian-800 text-zinc-300 border border-white/[0.08] hover:border-champagne-500/30 transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap flex-shrink-0"
                title="Load sample PRGuard DevSecOps brand state"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-champagne-400 flex-shrink-0" />
                <span className="hidden sm:inline">Load</span> Sample
              </button>

              {/* Snapshot Button */}
              <button
                onClick={() => setShowSnapshotDialog(true)}
                className="h-8 text-xs px-2.5 rounded-lg bg-obsidian-900/90 hover:bg-obsidian-800 text-zinc-300 border border-white/[0.08] hover:border-white/[0.15] transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap flex-shrink-0"
                title="Save version snapshot"
              >
                <Bookmark className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="hidden md:inline">Snapshot</span>
              </button>

              {/* Export JSON */}
              <button
                onClick={handleExport}
                className="h-8 text-xs px-2.5 rounded-lg bg-obsidian-900/90 hover:bg-obsidian-800 text-zinc-300 border border-white/[0.08] hover:border-white/[0.15] transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap flex-shrink-0"
                title="Export brand state as JSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                <span className="hidden md:inline">Export</span>
              </button>

              {/* Import JSON */}
              <label className="h-8 text-xs px-2.5 rounded-lg bg-obsidian-900/90 hover:bg-obsidian-800 text-zinc-300 border border-white/[0.08] hover:border-white/[0.15] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap flex-shrink-0">
                <Upload className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                <span className="hidden md:inline">Import</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>

              {/* Reset Project */}
              <button
                onClick={() => {
                  if (window.confirm('Reset current project? Any unsaved changes will be cleared.')) {
                    resetProject();
                  }
                }}
                className="h-8 w-8 rounded-lg hover:bg-obsidian-900 text-zinc-500 hover:text-zinc-300 transition-colors border border-transparent hover:border-white/[0.05] cursor-pointer inline-flex items-center justify-center flex-shrink-0"
                title="Reset to blank brand project"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* AI Telemetry & Settings */}
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="h-8 w-8 rounded-lg hover:bg-obsidian-900 text-zinc-400 hover:text-champagne-300 transition-colors border border-transparent hover:border-white/[0.08] cursor-pointer inline-flex items-center justify-center flex-shrink-0"
                title="AI Engine Telemetry & Connection Status"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Snapshot Modal */}
      {showSnapshotDialog && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="monolith-card-gold rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 border border-champagne-500/40 animate-workspace-enter">
            <div>
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-champagne-400" />
                <span className="text-titanium-shimmer">Save Immutable Version Snapshot</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Creates a point-in-time snapshot of all brand decisions, positioning worlds, artifacts, and scenarios.
              </p>
            </div>
            <input
              type="text"
              placeholder="e.g. Approved B2B Positioning Baseline"
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
              className="w-full bg-obsidian-950 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-champagne-400"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSnapshotDialog(false)}
                className="px-3.5 py-2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateSnapshot}
                disabled={!snapshotLabel.trim()}
                className="btn-monolith-primary px-4 py-2 text-xs rounded-xl disabled:opacity-50 cursor-pointer shadow-gold-glow"
              >
                Save Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Error Banner */}
      {importError && (
        <div className="bg-red-950/80 border-b border-red-800 text-red-200 text-xs px-4 py-2 flex items-center justify-between">
          <span>{importError}</span>
          <button onClick={() => setImportError(null)} className="text-red-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* AI Telemetry & Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="monolith-card-gold rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 border border-champagne-500/40 animate-workspace-enter text-left">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-champagne-400" />
                <h3 className="text-base font-bold text-white">AI Engine & Model Telemetry</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-obsidian-950 p-3 rounded-xl border border-white/[0.06] space-y-1">
                  <span className="text-zinc-400 text-[10px] font-mono uppercase">Primary LLM</span>
                  <div className="font-bold text-zinc-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-champagne-400" />
                    <span>{engineStatus?.model || 'gemini-3.8-flash'}</span>
                  </div>
                </div>

                <div className="bg-obsidian-950 p-3 rounded-xl border border-white/[0.06] space-y-1">
                  <span className="text-zinc-400 text-[10px] font-mono uppercase">Live Search Provider</span>
                  <div className="font-bold text-zinc-100 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${engineStatus?.hasTavilyKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span>{engineStatus?.hasTavilyKey ? 'Tavily Web Search' : 'Curated Hybrid Index'}</span>
                  </div>
                </div>

                <div className="bg-obsidian-950 p-3 rounded-xl border border-white/[0.06] space-y-1">
                  <span className="text-zinc-400 text-[10px] font-mono uppercase">API Key Status</span>
                  <div className="font-bold flex items-center gap-1.5">
                    {engineStatus?.hasApiKey ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Configured on Server
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Missing (Fallback Active)
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-obsidian-950 p-3 rounded-xl border border-white/[0.06] space-y-1">
                  <span className="text-zinc-400 text-[10px] font-mono uppercase">Execution Mode</span>
                  <div className="font-bold text-zinc-200">
                    {engineStatus?.hasApiKey && !engineStatus?.isDemoMode
                      ? 'Live Dynamic Synthesis'
                      : 'Deterministic Simulation'}
                  </div>
                </div>
              </div>

              {/* Ping Test Section */}
              <div className="bg-obsidian-950/80 p-3.5 rounded-xl border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200 font-mono text-[11px]">
                    Probe Live Model Round-Trip
                  </span>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isPinging}
                    className="btn-monolith-primary px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Activity className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                    <span>{isPinging ? 'Pinging...' : 'Test Connection'}</span>
                  </button>
                </div>
                {pingLatency !== null && (
                  <p className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ping successful! Round-trip Latency: {pingLatency}ms
                  </p>
                )}
                {pingError && (
                  <p className="text-amber-400 font-mono text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {pingError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-obsidian-900 hover:bg-obsidian-850 text-zinc-300 rounded-xl text-xs font-medium border border-white/[0.08] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
