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
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity & Active Project */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
              K
            </div>
            <span className="font-extrabold text-lg tracking-wider text-white">KINTRA</span>
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-200 truncate max-w-[180px] sm:max-w-[280px]">
              {project.metadata.name}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
              v{project.metadata.version}
            </span>
            {project.metadata.isDemoProject && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hidden md:inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
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
            className="text-xs px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors flex items-center gap-1.5"
            title="Load sample PRGuard DevSecOps brand state"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Load</span> Sample Brand
          </button>

          {/* Snapshot Button */}
          <button
            onClick={() => setShowSnapshotDialog(true)}
            className="text-xs px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors flex items-center gap-1"
            title="Save version snapshot"
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Snapshot</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExport}
            className="text-xs px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors flex items-center gap-1"
            title="Export brand state as JSON"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Import JSON */}
          <label className="text-xs px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors flex items-center gap-1 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-violet-400" />
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
            className="text-xs p-1.5 rounded-md hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Reset to blank brand project"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Snapshot Modal */}
      {showSnapshotDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Create Version Snapshot</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Freeze current brand state into an immutable historical snapshot.
            </p>
            <input
              type="text"
              placeholder="e.g. Approved B2B Positioning"
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 mb-4 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSnapshotDialog(false)}
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSnapshot}
                disabled={!snapshotLabel.trim()}
                className="px-4 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors"
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
