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
  CheckCircle2,
  RefreshCw,
  Sparkles,
  GitMerge,
  Layers,
  Lock,
  Edit3,
  Sliders,
  History,
  Info,
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
    selectScenario,
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
    <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-sm space-y-8">
      {/* Workspace Header & Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <FlaskConical className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100">
              Scenario Lab & Brand Evolution Engine
            </h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Stress-test your brand across realistic launch scenarios with tri-state comparison, or evolve foundational assumptions without silently destroying prior decisions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 ${
              activeTab === 'scenarios'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Scenario Lab</span>
          </button>
          <button
            onClick={() => setActiveTab('evolution')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 ${
              activeTab === 'evolution'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Assumption Evolution</span>
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 ${
              activeTab === 'branches'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Branch Manager ({branches.length})</span>
          </button>
        </div>
      </div>

      {!isIdentityReady && (
        <div className="p-4 bg-amber-950/30 border border-amber-900/50 rounded-xl text-amber-300 text-xs flex items-center gap-3">
          <Info className="w-5 h-5 shrink-0 text-amber-400" />
          <span>
            Creative Identity is not locked yet. Simulations will use default baseline values until Strategy & Identity are finalized.
          </span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: SCENARIO LAB (TRI-STATE COMPARISON & LINEAGE)     */}
      {/* ======================================================== */}
      {activeTab === 'scenarios' && (
        <div className="space-y-8">
          {/* Scenario Selector Ribbon */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Select Realistic Situation
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {scenarioArtifacts.length} Simulated Scenarios Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {(Object.keys(SCENARIO_TEMPLATES) as ScenarioTemplateType[]).map((type) => {
                const def = SCENARIO_TEMPLATES[type];
                const isSelected = selectedTemplate === type;
                const existing = scenarioArtifacts.find((s) => s.scenarioType === type);

                return (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedTemplate(type);
                      if (existing) selectScenario(existing.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/50'
                        : 'bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <span className="text-xl block mb-1">{def.icon}</span>
                      <h4 className="text-xs font-semibold text-zinc-200 leading-tight">
                        {def.label}
                      </h4>
                    </div>

                    <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                      {existing ? (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Simulated</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Ready</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-zinc-400">
                {SCENARIO_TEMPLATES[selectedTemplate].purpose}
              </p>
              <button
                onClick={handleSimulate}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate {SCENARIO_TEMPLATES[selectedTemplate].label}</span>
              </button>
            </div>
          </div>

          {/* Active Scenario Display: Tri-State Comparison */}
          {activeScenario ? (
            <div className="space-y-6">
              {/* Scenario Context Header & Lineage Badge */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {SCENARIO_TEMPLATES[activeScenario.scenarioType].icon}
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-100">{activeScenario.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      v{activeScenario.lineage.version}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Targeted Audience: <span className="text-zinc-200 font-medium">{activeScenario.targetAudience}</span>
                  </p>
                </div>

                {/* Lineage Info */}
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                  <div>
                    <span className="text-zinc-500">Archetype: </span>
                    <span className="text-indigo-300">{activeScenario.lineage.identityArchetype}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Governing Nodes: </span>
                    <span className="text-emerald-300">{activeScenario.lineage.governingDecisionIds.length} decisions</span>
                  </div>
                </div>
              </div>

              {/* Tri-State Comparison Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. RAW GENERATION (Generic LLM Clichés) */}
                <div className="bg-zinc-950/60 border border-red-900/30 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <span className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        <span>Raw Generation</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">Ungrounded</span>
                    </div>

                    <div className="p-3 bg-red-950/10 border border-red-900/20 rounded-lg text-xs text-zinc-300 font-sans whitespace-pre-wrap leading-relaxed">
                      &quot;{activeScenario.rawGeneration.content}&quot;
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Detected Failure Modes:
                      </span>
                      <ul className="space-y-1">
                        {activeScenario.rawGeneration.detectedFlaws.map((flaw, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-red-300/80 bg-red-950/20 px-2 py-0.5 rounded border border-red-900/30 flex items-start gap-1"
                          >
                            <span className="text-red-400">•</span>
                            <span>{flaw}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 border-t border-zinc-900 pt-2 italic">
                    {activeScenario.rawGeneration.description}
                  </p>
                </div>

                {/* 2. BRAND-AWARE GENERATION (Grounded in Strategy & Voice) */}
                <div className="bg-zinc-950/60 border border-indigo-900/30 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Brand-Aware</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">Grounded</span>
                    </div>

                    <div className="p-3 bg-indigo-950/10 border border-indigo-900/20 rounded-lg text-xs text-zinc-200 font-sans whitespace-pre-wrap leading-relaxed">
                      {activeScenario.brandAwareGeneration.content}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Aligned Decisions:
                      </span>
                      <ul className="space-y-1">
                        {activeScenario.brandAwareGeneration.alignedDecisions.map((dec, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-indigo-300/80 bg-indigo-950/20 px-2 py-0.5 rounded border border-indigo-900/30 flex items-start gap-1"
                          >
                            <span className="text-indigo-400">✓</span>
                            <span>{dec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 border-t border-zinc-900 pt-2 italic">
                    {activeScenario.brandAwareGeneration.description}
                  </p>
                </div>

                {/* 3. VALIDATED FINAL (Passed Consistency Guardian) */}
                <div className="bg-zinc-950/60 border border-emerald-900/30 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Validated Final</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/40">
                        100% Consistent
                      </span>
                    </div>

                    {editingContent !== null ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows={6}
                          className="w-full bg-zinc-900 border border-indigo-500/80 rounded-lg p-2.5 text-xs text-zinc-100 font-sans focus:outline-none"
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
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-sm"
                          >
                            Save & Re-Audit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-950/10 border border-emerald-900/20 rounded-lg text-xs text-zinc-100 font-sans whitespace-pre-wrap leading-relaxed">
                        {activeScenario.validatedFinal.content}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
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
                      <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                        <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                          Open Findings:
                        </span>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {activeScenario.validatedFinal.validationReport.findings.map((f) => (
                            <div
                              key={f.id}
                              className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800 text-[10px] flex items-center justify-between gap-2"
                            >
                              <span className="text-zinc-300 truncate" title={f.issue}>
                                {f.issue}
                              </span>
                              {f.suggestedRepair && (
                                <button
                                  onClick={() => repairScenario(activeScenario.id, f.id)}
                                  className="shrink-0 px-2 py-0.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded text-[9px] font-medium"
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

                  <div className="border-t border-zinc-900 pt-3 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Repairs: {activeScenario.validatedFinal.repairedFindingsCount}
                    </span>
                    {editingContent === null && (
                      <button
                        onClick={() => setEditingContent(activeScenario.validatedFinal.content)}
                        className="px-2.5 py-1 text-zinc-400 hover:text-zinc-200 text-xs rounded border border-zinc-800 hover:border-zinc-700 flex items-center space-x-1"
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
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-12 text-center space-y-3">
              <FlaskConical className="w-8 h-8 text-indigo-400 mx-auto" />
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
          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-indigo-400" />
                <span>Controlled Assumption Evolution</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Change a foundational strategic assumption. KINTRA will trace the exact blast radius down the Decision Graph, letting you inspect affected decisions before deciding whether to update, branch, or keep.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Assumption Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as AssumptionCategory)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
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
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Proposed Value
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise CISOs & Compliance Officers"
                  value={proposedValue}
                  onChange={(e) => setProposedValue(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Strategic Rationale */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Strategic Rationale
                </label>
                <input
                  type="text"
                  placeholder="e.g. Centralized compliance budgets are 5x larger"
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
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
              <div className="bg-zinc-950 p-4 rounded-xl border border-indigo-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dependency Blast Radius Analysis</span>
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    {impactReport.blastRadius.reviewRequiredCount} Review Required • {impactReport.blastRadius.remainsValidCount} Invariant
                  </span>
                </div>

                {/* Graph Cascade Diagram */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">1. Changed Assumption</span>
                    <span className="text-xs font-semibold text-indigo-300 mt-1 block truncate">
                      {impactReport.assumptionCategory}
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">2. Affected Decisions</span>
                    <span className="text-xs font-semibold text-amber-300 mt-1 block">
                      {impactReport.blastRadius.affectedDecisions.length} Nodes
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">3. Affected Artifacts</span>
                    <span className="text-xs font-semibold text-red-300 mt-1 block">
                      {impactReport.blastRadius.affectedArtifacts.length} Deliverables
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">4. Invariant Moat</span>
                    <span className="text-xs font-semibold text-emerald-300 mt-1 block">
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
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Governing Decisions ({impactReport.blastRadius.affectedDecisions.length})
                  </h4>
                  <div className="space-y-2">
                    {impactReport.blastRadius.affectedDecisions.map((node) => (
                      <div
                        key={node.nodeId}
                        className={`p-3 rounded-lg border text-xs space-y-1 ${
                          node.impactStatus === 'remains_valid' || node.impactStatus === 'unchanged'
                            ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                            : node.impactStatus === 'must_regenerate'
                            ? 'bg-red-950/20 border-red-900/40 text-red-300'
                            : 'bg-amber-950/20 border-amber-900/40 text-amber-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>{node.title}</span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-950/60">
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
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Launch Artifacts ({impactReport.blastRadius.affectedArtifacts.length})
                  </h4>
                  <div className="space-y-2">
                    {impactReport.blastRadius.affectedArtifacts.map((node) => (
                      <div
                        key={node.nodeId}
                        className={`p-3 rounded-lg border text-xs space-y-1 ${
                          node.impactStatus === 'remains_valid'
                            ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                            : node.impactStatus === 'must_regenerate'
                            ? 'bg-red-950/20 border-red-900/40 text-red-300'
                            : 'bg-amber-950/20 border-amber-900/40 text-amber-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>{node.title}</span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-950/60">
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
              <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
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
                    className="p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-lg text-left transition-colors space-y-1"
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
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-left space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-400">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Branch Brand</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Branch name (e.g. enterprise-ciso)"
                      value={customBranchName}
                      onChange={(e) => setCustomBranchName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200"
                    />
                    <button
                      onClick={() => handleApplyEvolution('branch_brand')}
                      className="w-full py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold"
                    >
                      Create & Evolve Branch
                    </button>
                  </div>

                  {/* Action 3: Cancel / Keep Old */}
                  <button
                    onClick={() => handleApplyEvolution('keep_old_decision')}
                    className="p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-lg text-left transition-colors space-y-1"
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
          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  <span>Brand Branches & Version Comparison</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage divergent brand tracks (e.g. Developer self-serve vs. Enterprise compliance) and compare diffs.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="New branch name..."
                  value={customBranchName}
                  onChange={(e) => setCustomBranchName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200"
                />
                <button
                  onClick={() => {
                    if (!customBranchName.trim()) return;
                    createBranch(customBranchName.trim());
                    setCustomBranchName('');
                  }}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold"
                >
                  Create Branch
                </button>
              </div>
            </div>

            {/* Branch List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-zinc-900/60 rounded-lg border border-indigo-500/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-zinc-100">main</span>
                    <span className="text-[10px] text-indigo-400 font-mono">v{project.metadata.version} (Active)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Default canonical brand track</p>
                </div>
              </div>

              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    branch.id === activeBranchId
                      ? 'bg-indigo-950/20 border-indigo-500/60'
                      : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-xs font-semibold text-zinc-100">{branch.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        v{branch.snapshot.version}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">{branch.description}</p>
                  </div>

                  <button
                    onClick={() => switchBranch(branch.id)}
                    className="px-2.5 py-1 text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-900 rounded"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>

            {/* Compare Branches Section */}
            {branches.length > 0 && (
              <div className="pt-4 border-t border-zinc-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Compare Against Main
                  </span>
                  <div className="flex items-center space-x-2">
                    <select
                      value={compareTargetBranchId}
                      onChange={(e) => setCompareTargetBranchId(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200"
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
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 rounded text-xs font-semibold"
                    >
                      Compare
                    </button>
                  </div>
                </div>

                {branchDiffResult && (
                  <div className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-200">
                        {branchDiffResult.baseBranchName} vs {branchDiffResult.targetBranchName}
                      </span>
                      <span className="text-xs font-mono text-indigo-400">
                        Divergence Score: {branchDiffResult.divergenceScore}%
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      {branchDiffResult.assumptionDiffs.map((diff) => (
                        <div key={diff.key} className="flex items-center justify-between p-1.5 bg-zinc-950 rounded">
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
