'use client';

import React, { useState } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import { Download, Upload, Bookmark, RotateCcw, Sparkles, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity & Active Project */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-champagne-400 via-champagne-500 to-champagne-700 flex items-center justify-center font-bold text-obsidian-950 shadow-md shadow-champagne-500/20 border border-white/30">
              K
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-widest text-titanium-shimmer leading-none">
                KINTRA
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 mt-0.5">
                Brand Intelligence
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-white/[0.08] hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-200 truncate max-w-[180px] sm:max-w-[280px]">
              {project.metadata.name}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-obsidian-900 border border-white/[0.06] text-champagne-400 font-mono">
              v{project.metadata.version}
            </span>
            {project.metadata.isDemoProject && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-champagne-500/10 text-champagne-300 border border-champagne-500/25 hidden md:inline-flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3 h-3 text-champagne-400" />
                Demo Fixture
              </span>
            )}
          </div>
        </div>

        {/* Right: Workspace & Version Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Demo Pre-seed button */}
          <button
            onClick={loadDemoProject}
            className="text-xs px-3 py-1.5 rounded-lg bg-obsidian-900/90 hover:bg-obsidian-800 text-zinc-300 border border-white/[0.08] hover:border-champagne-500/30 transition-all flex items-center gap-1.5 shadow-sm"
            title="Load sample PRGuard DevSecOps brand state"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-champagne-400" />
            <span className="hidden sm:inline">Load</span> Sample Brand
          </button>

          {/* Snapshot Button */}
          <button
            onClick={() => setShowSnapshotDialog(true)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-obsidian-900/90 hover:bg-obsidian-800 text-zinc-300 border border-white/[0.08] hover:border-white/[0.15] transition-colors flex items-center gap-1.5 shadow-sm"
            title="Save version snapshot"
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Snapshot</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExport}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-obsidian-900/90 hover:bg-obsidian-800 text-zinc-300 border border-white/[0.08] hover:border-white/[0.15] transition-colors flex items-center gap-1.5 shadow-sm"
            title="Export brand state as JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Import JSON */}
          <label className="text-xs px-2.5 py-1.5 rounded-lg bg-obsidian-900/90 hover:bg-obsidian-800 text-zinc-300 border border-white/[0.08] hover:border-white/[0.15] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm">
            <Upload className="w-3.5 h-3.5 text-slate-300" />
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
            className="text-xs p-1.5 rounded-lg hover:bg-obsidian-900 text-zinc-500 hover:text-zinc-300 transition-colors border border-transparent hover:border-white/[0.05]"
            title="Reset to blank brand project"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Snapshot Modal */}
      {showSnapshotDialog && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="monolith-card rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-white/[0.1]">
            <div>
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-champagne-400" />
                Create Version Snapshot
              </h3>
              <p className="text-xs text-zinc-400">
                Freeze current brand state into an immutable historical snapshot.
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
                onClick={() => setShowSnapshotDialog(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSnapshot}
                disabled={!snapshotLabel.trim()}
                className="btn-monolith-primary px-4 py-1.5 text-xs rounded-xl disabled:opacity-50"
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
    </header>
  );
};
