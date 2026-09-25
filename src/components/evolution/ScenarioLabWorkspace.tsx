'use client';

import React, { useState } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import {
  ScenarioTemplateType,
  AssumptionCategory,
  EvolutionApprovalChoice,
} from '@/types/evolution';
import { SCENARIO_TEMPLATES } from '@/lib/evolution/scenario-lab-engine';
import {
  FlaskConical,
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  GitMerge,
  Layers,
  Lock,
  Edit3,
  Sliders,
  History,
} from 'lucide-react';

export const ScenarioLabWorkspace: React.FC = () => {
  const {
    project,
    scenarioArtifacts,
    selectedScenarioId,
    activeChangeRequest,
    impactReport,
    branches,
    activeBranchId,
    runScenarioTest,
    repairScenario,
    manuallyEditScenario,
    proposeAssumptionChange,
    clearProposedAssumption,
    approveEvolution,
    createBranch,
    switchBranch,
    compareBranches,
    isLoading,
  } = useBrandStore();

  const [activeTab, setActiveTab] = useState<'scenarios' | 'evolution' | 'branches'>('scenarios');
  const [selectedTemplate, setSelectedTemplate] = useState<ScenarioTemplateType>('website_launch');
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [customBranchName, setCustomBranchName] = useState('');
  const [mobileTriStateTab, setMobileTriStateTab] = useState<'all' | 'raw' | 'brand_aware' | 'validated'>('all');

  // Evolution Form State
  const [selectedCategory, setSelectedCategory] = useState<AssumptionCategory>('target_audience');
  const [proposedValue, setProposedValue] = useState('');
  const [rationale, setRationale] = useState('');

  // Branch Comparison State
  const [compareTargetBranchId, setCompareTargetBranchId] = useState<string>('');
  const [branchDiffResult, setBranchDiffResult] = useState<ReturnType<typeof compareBranches> | null>(null);

  const activeScenario =
    scenarioArtifacts.find((s) => s.id === selectedScenarioId) || scenarioArtifacts[0];

  // Stage Gating: Remind user if Creative Identity is not locked
  const isIdentityReady = !!project.creativeIdentity;

  const handleSimulate = async () => {
    await runScenarioTest(selectedTemplate);
  };

  const handleAnalyzeImpact = () => {
    if (!proposedValue.trim() || !rationale.trim()) return;
    proposeAssumptionChange(selectedCategory, proposedValue.trim(), rationale.trim());
  };

  const handleApplyEvolution = (choice: EvolutionApprovalChoice) => {
    approveEvolution(choice, customBranchName.trim() || undefined);
    setProposedValue('');
    setRationale('');
    setCustomBranchName('');
  };

  const handleCompare = () => {
    if (!activeBranchId || !compareTargetBranchId) return;
    const diff = compareBranches(activeBranchId, compareTargetBranchId);
    setBranchDiffResult(diff);
  };

  return (
    <section className="monolith-card rounded-2xl p-6 sm:p-8 space-y-8">
      {/* Workspace Header & Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-champagne-500/10 text-champagne-400 rounded-lg border border-champagne-500/25">
              <FlaskConical className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-titanium-shimmer">Scenario Lab & Controlled Evolution</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-normal bg-obsidian-900 text-champagne-400 border border-white/[0.06]">
                Stage 7
              </span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Simulate real-world asset variants, measure multi-turn divergence, and test strategic assumption updates.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-obsidian-950 p-1 rounded-xl border border-white/[0.06] text-xs font-medium">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'scenarios'
                ? 'btn-monolith-primary font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Scenario Simulation
          </button>
          <button
            onClick={() => setActiveTab('evolution')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'evolution'
                ? 'btn-monolith-primary font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Assumption Evolution
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'branches'
                ? 'btn-monolith-primary font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Branch Manager
          </button>
        </div>
      </div>

      {/* Stage Gating Warning */}
      {!isIdentityReady && (
        <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-start space-x-3 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <div className="space-y-0.5">
            <span className="font-bold font-mono">Stage Gating: Creative Identity Incomplete</span>
            <p className="text-zinc-300">
              For complete grounded simulation, approve your Creative Identity (Name, Voice, Visuals) above. Simulations will use baseline defaults until locked.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: SCENARIO LAB (TRI-STATE OUTPUT INSPECTOR)          */}
      {/* ======================================================== */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          {/* Controls: Template Picker & Simulator */}
          <div className="monolith-card rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono font-bold text-zinc-400 tracking-wider">
                Select Simulation Challenge
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                {Object.keys(SCENARIO_TEMPLATES).length} Scenarios Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.values(SCENARIO_TEMPLATES).map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.type;
                return (
                  <div
                    key={tmpl.type}
                    onClick={() => setSelectedTemplate(tmpl.type)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'monolith-card-gold ring-1 ring-champagne-400/80 shadow-gold-glow'
                        : 'bg-obsidian-950/70 border-white/[0.05] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                        <span>{tmpl.icon}</span>
                        <span>{tmpl.label}</span>
                      </span>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border bg-champagne-500/10 text-champagne-300 border-champagne-500/25">
                        {tmpl.guardianMapping.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                      {tmpl.purpose}
                    </p>
                    <div className="text-[10px] text-zinc-500 font-mono pt-1 truncate">
                      {tmpl.defaultTitle}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/[0.04]">
              <button
                onClick={handleSimulate}
                disabled={isLoading}
                className="btn-monolith-primary px-5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Tri-State Pipeline</span>
              </button>
            </div>
          </div>

          {/* Tri-State Output Viewer */}
          {activeScenario ? (
            <div className="space-y-6">
              {/* Scenario Context Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.05] pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{activeScenario.title}</span>
                    <span className="text-xs text-champagne-400/80 font-mono capitalize">
                      • {activeScenario.scenarioType.replace('_', ' ')}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">Target Audience: {activeScenario.targetAudience}</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                  <div>
                    <span className="text-zinc-500">Archetype: </span>
                    <span className="text-champagne-300">{activeScenario.lineage.identityArchetype}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Governing Nodes: </span>
                    <span className="text-emerald-300">{activeScenario.lineage.governingDecisionIds.length} decisions</span>
                  </div>
                </div>
              </div>

              {/* Mobile / Tablet Segmented Toggle */}
              <div className="flex lg:hidden items-center justify-between p-1 bg-obsidian-950 border border-white/[0.08] rounded-xl text-xs font-mono mb-2">
                <button
                  type="button"
                  onClick={() => setMobileTriStateTab('all')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                    mobileTriStateTab === 'all'
                      ? 'bg-champagne-500/20 text-champagne-300 font-bold border border-champagne-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  aria-label="Show all three comparison columns"
                >
                  All (3)
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTriStateTab('raw')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                    mobileTriStateTab === 'raw'
                      ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  aria-label="Show raw generation column"
                >
                  Raw
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTriStateTab('brand_aware')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                    mobileTriStateTab === 'brand_aware'
                      ? 'bg-champagne-500/20 text-champagne-300 font-bold border border-champagne-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  aria-label="Show brand-aware column"
                >
                  Brand-Aware
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTriStateTab('validated')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                    mobileTriStateTab === 'validated'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  aria-label="Show validated final column"
                >
                  Validated
                </button>
              </div>

              {/* Tri-State Comparison Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. RAW GENERATION (Generic LLM Clichés) */}
                <div className={`bg-obsidian-950/90 border border-red-500/25 rounded-2xl p-5 flex-col justify-between space-y-4 ${
                  mobileTriStateTab === 'all' || mobileTriStateTab === 'raw' ? 'flex' : 'hidden lg:flex'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                      <span className="text-xs font-semibold text-red-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        <span>Raw Generation</span>
                      </span>
                      <span className="text-[10px] font-mono text-red-400/80 bg-red-950/30 px-2 py-0.5 rounded border border-red-900/40">
                        Generic LLM
                      </span>
                    </div>

                    <div className="p-3 bg-red-950/15 border border-red-900/20 rounded-xl text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                      &quot;{activeScenario.rawGeneration.content}&quot;
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                        Detected Failure Modes:
                      </span>
                      <ul className="space-y-1">
                        {activeScenario.rawGeneration.detectedFlaws.map((flaw, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-red-300/90 bg-red-950/20 px-2 py-0.5 rounded border border-red-900/30 flex items-start gap-1"
                          >
                            <span className="text-red-400">•</span>
                            <span className="line-through decoration-red-400/60">{flaw}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 border-t border-white/[0.04] pt-2 italic font-mono">
                    {activeScenario.rawGeneration.description}
                  </p>
                </div>

                {/* 2. BRAND-AWARE GENERATION (Grounded in Strategy & Voice) */}
                <div className={`monolith-card rounded-2xl p-5 flex-col justify-between space-y-4 ${
                  mobileTriStateTab === 'all' || mobileTriStateTab === 'brand_aware' ? 'flex' : 'hidden lg:flex'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                      <span className="text-xs font-semibold text-champagne-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-champagne-400" />
                        <span>Brand-Aware</span>
                      </span>
                      <span className="text-[10px] font-mono text-champagne-400 bg-champagne-500/10 px-2 py-0.5 rounded border border-champagne-500/25">
                        KINTRA Grounded
                      </span>
                    </div>

                    <div className="p-3 bg-obsidian-950/80 border border-white/[0.06] rounded-xl text-xs text-zinc-200 font-sans whitespace-pre-wrap leading-relaxed">
                      {activeScenario.brandAwareGeneration.content}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                        Aligned Decisions:
                      </span>
                      <ul className="space-y-1">
                        {activeScenario.brandAwareGeneration.alignedDecisions.map((dec, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-champagne-300/90 bg-champagne-500/10 px-2 py-0.5 rounded border border-champagne-500/20 flex items-start gap-1"
                          >
                            <span className="text-champagne-400">✓</span>
                            <span>{dec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 border-t border-white/[0.04] pt-2 italic font-mono">
                    {activeScenario.brandAwareGeneration.description}
                  </p>
                </div>

                {/* 3. VALIDATED FINAL (Passed Consistency Guardian) */}
                <div className={`rounded-2xl p-5 flex-col justify-between space-y-4 bg-gradient-to-b from-emerald-950/20 to-obsidian-950/90 border border-emerald-500/40 shadow-lg shadow-emerald-950/20 ${
                  mobileTriStateTab === 'all' || mobileTriStateTab === 'validated' ? 'flex' : 'hidden lg:flex'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                      <span className="text-xs font-semibold text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Validated Final</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                        Guardian Verified
                      </span>
                    </div>

                    {editingContent !== null ? (
                      <div className="space-y-2">
                        <textarea
                          aria-label="Edit scenario content"
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows={6}
                          className="w-full bg-obsidian-900 border border-champagne-500/80 rounded-xl p-2.5 text-xs text-zinc-100 font-sans focus:outline-none"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingContent(null)}
                            className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              manuallyEditScenario(activeScenario.id, editingContent);
                              setEditingContent(null);
                            }}
                            className="btn-monolith-primary px-3 py-1 rounded text-xs font-semibold"
                          >
                            Save & Re-Audit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-xs text-zinc-100 font-sans whitespace-pre-wrap leading-relaxed">
                        {activeScenario.validatedFinal.content}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                          Validation Health:
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {activeScenario.validatedFinal.validationReport.blockingFindingsCount} blocking findings
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1">
                        {Object.values(activeScenario.validatedFinal.validationReport.dimensions).map((dim) => (
                          <div
                            key={dim.dimension}
                            className={`p-1 rounded text-center text-[9px] font-mono border ${
                              dim.status === 'pass'
                                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30'
                                : 'bg-red-950/20 text-red-400 border-red-900/30'
                            }`}
                            title={`${dim.label}: ${dim.rationale}`}
                          >
                            {dim.dimension.split('_')[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                    {activeScenario.validatedFinal.validationReport.findings.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                        <span className="text-[10px] font-mono font-semibold text-amber-400 uppercase tracking-wider">
                          Open Findings:
                        </span>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {activeScenario.validatedFinal.validationReport.findings.map((f) => (
                            <div
                              key={f.id}
                              className="p-1.5 rounded bg-obsidian-900 border border-white/[0.05] text-[10px] flex items-center justify-between gap-2"
                            >
                              <span className="text-zinc-300 truncate" title={f.issue}>
                                {f.issue}
                              </span>
                              {f.suggestedRepair && (
                                <button
                                  onClick={() => repairScenario(activeScenario.id, f.id)}
                                  className="shrink-0 px-2 py-0.5 btn-monolith-primary rounded text-[9px] font-medium"
                                >
                                  Repair
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/[0.04] pt-3 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Repairs: {activeScenario.validatedFinal.repairedFindingsCount}
                    </span>
                    {editingContent === null && (
                      <button
                        onClick={() => setEditingContent(activeScenario.validatedFinal.content)}
                        className="px-2.5 py-1 text-zinc-400 hover:text-champagne-300 text-xs rounded-lg border border-white/[0.06] hover:border-white/[0.12] flex items-center space-x-1 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Copy</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-obsidian-950/70 border border-dashed border-white/[0.08] rounded-2xl p-12 text-center space-y-3">
              <FlaskConical className="w-8 h-8 text-champagne-400 mx-auto" />
              <h4 className="text-sm font-semibold text-zinc-200">No Scenarios Simulated Yet</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Select a template above and click &quot;Simulate&quot; to inspect side-by-side Raw vs. Brand-Aware vs. Validated final copy.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ASSUMPTION EVOLUTION & DEPENDENCY ANALYSIS         */}
      {/* ======================================================== */}
      {activeTab === 'evolution' && (
        <div className="space-y-8">
          {/* Evolution Prompt Form */}
          <div className="monolith-card rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-champagne-400" />
                <span className="text-titanium-shimmer">Controlled Assumption Evolution</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Change a foundational strategic assumption. KINTRA will trace the exact blast radius down the Decision Graph, letting you inspect affected decisions before deciding whether to update, branch, or keep.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  Assumption Category
                </label>
                <select
                  aria-label="Assumption Category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as AssumptionCategory)}
                  className="w-full bg-obsidian-900 border border-white/[0.08] rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-champagne-400"
                >
                  <option value="target_audience">Target Audience</option>
                  <option value="pricing_tier">Commercial & Pricing Tier</option>
                  <option value="emotional_territory">Emotional Territory</option>
                  <option value="primary_problem">Primary Problem Framing</option>
                  <option value="category_frame">Category Frame</option>
                </select>
              </div>

              {/* Proposed Value */}
              <div>
                <label className="block text-xs font-semibold font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  Proposed Value
                </label>
                <input
                  aria-label="Proposed Value"
                  type="text"
                  placeholder="e.g. Enterprise CISOs & Compliance Officers"
                  value={proposedValue}
                  onChange={(e) => setProposedValue(e.target.value)}
                  className="w-full bg-obsidian-900 border border-white/[0.08] rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-champagne-400"
                />
              </div>

              {/* Strategic Rationale */}
              <div>
                <label className="block text-xs font-semibold font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  Strategic Rationale
                </label>
                <input
                  aria-label="Strategic Rationale"
                  type="text"
                  placeholder="e.g. Centralized compliance budgets are 5x larger"
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  className="w-full bg-obsidian-900 border border-white/[0.08] rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-champagne-400"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              {activeChangeRequest && (
                <button
                  onClick={clearProposedAssumption}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Clear Analysis
                </button>
              )}
              <button
                onClick={handleAnalyzeImpact}
                disabled={!proposedValue.trim() || !rationale.trim() || isLoading}
                className="btn-monolith-primary px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5"
              >
                <Layers className="w-4 h-4" />
                <span>Analyze Blast Radius</span>
              </button>
            </div>
          </div>

          {/* Dependency Cascade Display */}
          {impactReport && (
            <div className="space-y-6">
              {/* Cascade Header */}
              <div className="monolith-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-champagne-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-champagne-400" />
                    <span>Dependency Blast Radius Analysis</span>
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    {impactReport.blastRadius.reviewRequiredCount} Review Required • {impactReport.blastRadius.remainsValidCount} Invariant
                  </span>
                </div>

                {/* Graph Cascade Diagram */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                  <div className="p-3 bg-obsidian-950/80 rounded-xl border border-white/[0.05] text-center">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">1. Changed Assumption</span>
                    <span className="text-xs font-semibold text-champagne-300 mt-1 block truncate">
                      {impactReport.assumptionCategory}
                    </span>
                  </div>
                  <div className="p-3 bg-obsidian-950/80 rounded-xl border border-white/[0.05] text-center">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">2. Affected Decisions</span>
                    <span className="text-xs font-semibold text-amber-300 mt-1 block font-mono">
                      {impactReport.blastRadius.affectedDecisions.length} Nodes
                    </span>
                  </div>
                  <div className="p-3 bg-obsidian-950/80 rounded-xl border border-white/[0.05] text-center">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">3. Affected Artifacts</span>
                    <span className="text-xs font-semibold text-red-300 mt-1 block font-mono">
                      {impactReport.blastRadius.affectedArtifacts.length} Deliverables
                    </span>
                  </div>
                  <div className="p-3 bg-obsidian-950/80 rounded-xl border border-white/[0.05] text-center">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">4. Invariant Moat</span>
                    <span className="text-xs font-semibold text-emerald-300 mt-1 block font-mono">
                      {impactReport.blastRadius.remainsValidCount} Unchanged
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 pt-1 leading-relaxed">
                  {impactReport.summary}
                </p>
              </div>

              {/* Impact Breakdown Cards (Remains Valid vs Must Regenerate vs Needs Revision) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Decision Nodes Impact */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase font-mono tracking-wider">
                    Governing Decisions ({impactReport.blastRadius.affectedDecisions.length})
                  </h4>
                  <div className="space-y-2">
                    {impactReport.blastRadius.affectedDecisions.map((node) => (
                      <div
                        key={node.nodeId}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          node.impactStatus === 'remains_valid' || node.impactStatus === 'unchanged'
                            ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                            : node.impactStatus === 'must_regenerate'
                            ? 'bg-red-950/20 border-red-900/40 text-red-300'
                            : 'bg-amber-950/20 border-amber-900/40 text-amber-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>{node.title}</span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-obsidian-950/80 border border-white/[0.05]">
                            {node.impactStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{node.causalReason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Artifacts Impact */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase font-mono tracking-wider">
                    Launch Artifacts ({impactReport.blastRadius.affectedArtifacts.length})
                  </h4>
                  <div className="space-y-2">
                    {impactReport.blastRadius.affectedArtifacts.map((node) => (
                      <div
                        key={node.nodeId}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          node.impactStatus === 'remains_valid'
                            ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                            : node.impactStatus === 'must_regenerate'
                            ? 'bg-red-950/20 border-red-900/40 text-red-300'
                            : 'bg-amber-950/20 border-amber-900/40 text-amber-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>{node.title}</span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-obsidian-950/80 border border-white/[0.05]">
                            {node.impactStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{node.causalReason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Approval Decision Controls (Part E) */}
              <div className="monolith-card rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200 uppercase font-mono tracking-wider">
                      Select Evolution Action
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      KINTRA never silently destroys prior work. Choose how to execute this strategic evolution.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Action 1: Apply Update in-place */}
                  <button
                    onClick={() => handleApplyEvolution('apply_update')}
                    className="p-3.5 bg-obsidian-950/80 hover:bg-obsidian-900 border border-white/[0.06] hover:border-emerald-500/40 rounded-xl text-left transition-colors space-y-1"
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Apply Update In-Place</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Updates foundational assumption, regenerates affected artifacts, and snapshots previous version.
                    </p>
                  </button>

                  {/* Action 2: Branch Brand */}
                  <div className="p-3.5 bg-obsidian-950/80 border border-white/[0.06] rounded-xl text-left space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-champagne-400">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Branch Brand</span>
                    </div>
                    <input
                      aria-label="Branch name for evolution"
                      type="text"
                      placeholder="Branch name (e.g. enterprise-ciso)"
                      value={customBranchName}
                      onChange={(e) => setCustomBranchName(e.target.value)}
                      className="w-full bg-obsidian-900 border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-champagne-400"
                    />
                    <button
                      onClick={() => handleApplyEvolution('branch_brand')}
                      className="btn-monolith-primary w-full py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Create & Evolve Branch
                    </button>
                  </div>

                  {/* Action 3: Cancel / Keep Old */}
                  <button
                    onClick={() => handleApplyEvolution('keep_old_decision')}
                    className="p-3.5 bg-obsidian-950/80 hover:bg-obsidian-900 border border-white/[0.06] hover:border-white/[0.12] rounded-xl text-left transition-colors space-y-1"
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Keep Old Decision</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Discard this evolution proposal and keep all existing decisions strictly intact.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: BRANCH MANAGER & COMPARISON DIFF (PART F)          */}
      {/* ======================================================== */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          <div className="monolith-card rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-champagne-400" />
                  <span className="text-titanium-shimmer">Brand Branches & Version Comparison</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage divergent brand tracks (e.g. Developer self-serve vs. Enterprise compliance) and compare diffs.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  aria-label="New branch name"
                  type="text"
                  placeholder="New branch name..."
                  value={customBranchName}
                  onChange={(e) => setCustomBranchName(e.target.value)}
                  className="bg-obsidian-900 border border-white/[0.08] rounded-xl px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-champagne-400"
                />
                <button
                  onClick={() => {
                    if (!customBranchName.trim()) return;
                    createBranch(customBranchName.trim());
                    setCustomBranchName('');
                  }}
                  className="btn-monolith-primary px-3 py-1 rounded-xl text-xs font-semibold"
                >
                  Create Branch
                </button>
              </div>
            </div>

            {/* Branch List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-obsidian-950/80 rounded-xl border border-champagne-500/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-zinc-100">main</span>
                    <span className="text-[10px] text-champagne-400 font-mono">v{project.metadata.version} (Active)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Default canonical brand track</p>
                </div>
              </div>

              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    branch.id === activeBranchId
                      ? 'monolith-card-gold ring-1 ring-champagne-400/80'
                      : 'bg-obsidian-950/80 border-white/[0.05]'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <GitBranch className="w-3.5 h-3.5 text-champagne-400" />
                      <span className="text-xs font-semibold text-zinc-100">{branch.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        v{branch.snapshot.version}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">{branch.description}</p>
                  </div>

                  <button
                    onClick={() => switchBranch(branch.id)}
                    className="px-2.5 py-1 text-xs text-champagne-400 hover:text-champagne-300 border border-white/[0.08] hover:border-champagne-500/30 rounded-lg transition-colors"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>

            {/* Compare Branches Section */}
            {branches.length > 0 && (
              <div className="pt-4 border-t border-white/[0.05] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase font-mono tracking-wider">
                    Compare Against Main
                  </span>
                  <div className="flex items-center space-x-2">
                    <select
                      aria-label="Select branch to compare"
                      value={compareTargetBranchId}
                      onChange={(e) => setCompareTargetBranchId(e.target.value)}
                      className="bg-obsidian-900 border border-white/[0.08] rounded-xl px-2.5 py-1 text-xs text-zinc-200"
                    >
                      <option value="">Select branch to compare...</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleCompare}
                      disabled={!compareTargetBranchId}
                      className="px-3 py-1 bg-obsidian-850 hover:bg-obsidian-800 disabled:opacity-50 text-zinc-200 rounded-xl text-xs font-semibold border border-white/[0.06]"
                    >
                      Compare
                    </button>
                  </div>
                </div>

                {branchDiffResult && (
                  <div className="bg-obsidian-950/90 p-4 rounded-xl border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-200">
                        {branchDiffResult.baseBranchName} vs {branchDiffResult.targetBranchName}
                      </span>
                      <span className="text-xs font-mono text-champagne-400">
                        Divergence Score: {branchDiffResult.divergenceScore}%
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      {branchDiffResult.assumptionDiffs.map((diff) => (
                        <div key={diff.key} className="flex items-center justify-between p-2 bg-obsidian-900 rounded-lg border border-white/[0.04]">
                          <span className="text-zinc-400">{diff.label}:</span>
                          <span className="text-zinc-300">
                            {diff.baseValue} → <span className="text-emerald-400">{diff.targetValue}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
