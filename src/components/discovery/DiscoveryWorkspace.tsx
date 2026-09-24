'use client';

import React, { useState } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Plus,
  Trash2,
  RefreshCw,
  XCircle,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import { DEMO_BRAND_PRGUARD } from '@/fixtures/demo-brands';

export const DiscoveryWorkspace: React.FC = () => {
  const {
    project,
    isLoading,
    loadingMessage,
    runIntakeAnalysis,
    answerInterviewQuestion,
    skipInterviewQuestion,
    synthesizeBrief,
    updateFact,
    deleteFact,
    addFact,
    updateHypothesis,
    updateIdeaBriefField,
    approveIdeaBrief,
    rejectIdeaBrief,
    regenerateIdeaBrief,
  } = useBrandStore();

  const [ideaInput, setIdeaInput] = useState(project.rawFounderInput || '');
  const [newFactInput, setNewFactInput] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [editBriefMode, setEditBriefMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Active question in interview
  const activeQuestion =
    project.interviewState.history[project.interviewState.currentQuestionIndex];
  const isInterviewComplete = project.interviewState.isComplete;

  const handleStartAnalysis = async () => {
    if (!ideaInput.trim() || ideaInput.length < 10) return;
    await runIntakeAnalysis(ideaInput.trim());
  };

  const handleQuickPreFill = (text: string) => {
    setIdeaInput(text);
  };

  const handleAnswerQuestion = async (answer: string) => {
    if (!activeQuestion) return;
    await answerInterviewQuestion(activeQuestion.id, answer);
    setCustomAnswer('');
  };

  const handleSkipQuestion = async () => {
    if (!activeQuestion) return;
    await skipInterviewQuestion(activeQuestion.id);
    setCustomAnswer('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* ========================================================================= */}
      {/* SECTION 1: RAW IDEA INTAKE                                                */}
      {/* ========================================================================= */}
      <section className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              1. Raw Idea Intake
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Enter your incomplete founder, startup, or product idea in 1–3 rough sentences.
            </p>
          </div>

          {/* Quick Pre-seed Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Quick Try:</span>
            <button
              onClick={() => handleQuickPreFill(DEMO_BRAND_PRGUARD.rawIdea)}
              className="text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              PRGuard (DevSecOps)
            </button>
            <button
              onClick={() =>
                handleQuickPreFill(
                  'A paid subscriber community and live workshop platform for boutique indie coffee roasters and home baristas.'
                )
              }
              className="text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              Artisan Roast (Creator)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={ideaInput}
            onChange={(e) => setIdeaInput(e.target.value)}
            disabled={isLoading || project.stage !== 'intake'}
            placeholder="e.g. An AI-powered tool that audits GitHub pull requests for subtle logic bugs so developers don't have to wait for senior reviews..."
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-60"
          />

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-zinc-500">
              {ideaInput.length} characters {ideaInput.length < 10 && '(min 10 required)'}
            </div>

            {project.stage === 'intake' ? (
              <button
                onClick={handleStartAnalysis}
                disabled={isLoading || ideaInput.trim().length < 10}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{loadingMessage || 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <span>Extract Epistemic Core</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Idea Deconstructed
                </span>
                <button
                  onClick={() => useBrandStore.getState().resetProject()}
                  className="text-xs text-zinc-400 hover:text-zinc-200 underline ml-2"
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: ADAPTIVE DISCOVERY INTERVIEW                                  */}
      {/* ========================================================================= */}
      {project.stage !== 'intake' && (
        <section className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                2. Adaptive Discovery Interview
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                KINTRA dynamically identifies high-value strategic unknowns rather than asking a blind questionnaire.
              </p>
            </div>

            {/* Questions Progress */}
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                {isInterviewComplete
                  ? 'Interview Complete'
                  : `Question ${project.interviewState.currentQuestionIndex + 1} of ${
                      project.interviewState.history.length
                    }`}
              </span>
            </div>
          </div>

          {!isInterviewComplete && activeQuestion ? (
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-6 space-y-6">
              {/* Question Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400 px-2.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                    Topic: {activeQuestion.topic}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white leading-relaxed">
                  {activeQuestion.question}
                </h3>
              </div>

              {/* Strategic Rationale: Explains WHY the AI asks this */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3.5 text-xs text-zinc-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-indigo-300">Why KINTRA is asking this: </span>
                  {activeQuestion.whyAsking}
                </div>
              </div>

              {/* Quick Select Choice Buttons */}
              {activeQuestion.suggestedAnswers && activeQuestion.suggestedAnswers.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">
                    Select a strategic direction:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeQuestion.suggestedAnswers.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswerQuestion(opt)}
                        className="text-left p-3 rounded-lg bg-zinc-900 hover:bg-indigo-950/50 hover:border-indigo-600/60 border border-zinc-800 text-xs text-zinc-200 transition-all leading-normal"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Answer Input */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-zinc-400">
                  Or enter your own specific perspective:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                    placeholder="Type custom answer..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customAnswer.trim()) {
                        handleAnswerQuestion(customAnswer.trim());
                      }
                    }}
                  />
                  <button
                    onClick={() => handleAnswerQuestion(customAnswer.trim())}
                    disabled={!customAnswer.trim()}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Submit
                  </button>
                  <button
                    onClick={handleSkipQuestion}
                    className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>

              {/* Early Synthesis Override */}
              <div className="pt-2 border-t border-zinc-900 flex justify-end">
                <button
                  onClick={() => synthesizeBrief()}
                  className="text-xs text-zinc-400 hover:text-indigo-300 underline"
                >
                  I have provided enough detail — synthesize Strategic Brief now &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Adaptive Discovery Complete</h4>
                  <p className="text-xs text-zinc-400">
                    {project.interviewState.history.filter((q) => !q.skipped && q.userAnswer).length} strategic questions answered.
                  </p>
                </div>
              </div>

              {project.stage === 'discovery' && (
                <button
                  onClick={() => synthesizeBrief()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <span>Synthesize Strategic Idea Brief</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: EXTRACTED FACTS VS UNVALIDATED HYPOTHESES                      */}
      {/* ========================================================================= */}
      {project.stage !== 'intake' && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column A: Verified Facts */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Verified Facts ({project.extractedFacts.length})
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Invariants asserted by founder. Edit or verify to anchor strategy.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {project.extractedFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5 flex-1">
                    <input
                      type="checkbox"
                      checked={fact.verifiedByUser}
                      onChange={(e) => updateFact(fact.id, fact.statement, e.target.checked)}
                      className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0 cursor-pointer"
                      title="Verify as confirmed fact"
                    />
                    <input
                      type="text"
                      value={fact.statement}
                      onChange={(e) => updateFact(fact.id, e.target.value, fact.verifiedByUser)}
                      className="flex-1 bg-transparent text-zinc-200 border-none p-0 focus:outline-none focus:ring-0"
                    />
                  </div>
                  <button
                    onClick={() => deleteFact(fact.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                    title="Remove fact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Fact Form */}
            <div className="flex gap-2 pt-2 border-t border-zinc-800/80">
              <input
                type="text"
                placeholder="Add another invariant fact..."
                value={newFactInput}
                onChange={(e) => setNewFactInput(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFactInput.trim()) {
                    addFact(newFactInput.trim());
                    setNewFactInput('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newFactInput.trim()) {
                    addFact(newFactInput.trim());
                    setNewFactInput('');
                  }
                }}
                disabled={!newFactInput.trim()}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Column B: Unvalidated Hypotheses */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Unvalidated Hypotheses ({project.hypotheses.length})
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Implicit premises requiring validation. Flagged by risk level.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {project.hypotheses.map((hyp) => (
                <div
                  key={hyp.id}
                  className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        hyp.riskLevel === 'critical'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : hyp.riskLevel === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {hyp.riskLevel} risk
                    </span>
                    <select
                      value={hyp.riskLevel}
                      onChange={(e) =>
                        updateHypothesis(
                          hyp.id,
                          hyp.claim,
                          e.target.value as 'low' | 'medium' | 'critical'
                        )
                      }
                      className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-zinc-300"
                    >
                      <option value="critical">Critical</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={hyp.claim}
                    onChange={(e) => updateHypothesis(hyp.id, e.target.value, hyp.riskLevel)}
                    className="w-full bg-transparent text-zinc-200 border-none p-0 focus:outline-none focus:ring-0"
                  />
                  {hyp.potentialConsequenceIfFalse && (
                    <div className="text-[11px] text-zinc-500 italic">
                      Risk if false: {hyp.potentialConsequenceIfFalse}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: STRATEGIC IDEA BRIEF COCKPIT                                  */}
      {/* ========================================================================= */}
      {project.ideaBrief && (
        <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-white">3. Strategic Idea Brief Baseline</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    project.ideaBrief.status === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : project.ideaBrief.status === 'rejected'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse'
                  }`}
                >
                  {project.ideaBrief.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                This brief is the foundational anchor for all downstream positioning, naming, and launch messaging.
              </p>
            </div>

            {/* Confidence Metric & Edit Toggle */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-zinc-400">Context Confidence</div>
                <div className="text-base font-bold text-emerald-400 font-mono">
                  {Math.round(project.ideaBrief.confidenceScore * 100)}%
                </div>
              </div>
              <button
                onClick={() => setEditBriefMode(!editBriefMode)}
                className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  editBriefMode
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                {editBriefMode ? 'Exit Edit Mode' : 'Edit Brief'}
              </button>
            </div>
          </div>

          {/* Brief Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Core Problem */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                Core Problem Framing
              </span>
              <div>
                <label className="text-[11px] text-zinc-500">The Acute Pain Point:</label>
                {editBriefMode ? (
                  <textarea
                    value={project.ideaBrief.problem.corePain}
                    onChange={(e) =>
                      updateIdeaBriefField('problem', {
                        ...project.ideaBrief!.problem,
                        corePain: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm text-zinc-200 font-medium">
                    {project.ideaBrief.problem.corePain}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[11px] text-zinc-500">Trigger Event (When it hurts):</label>
                {editBriefMode ? (
                  <input
                    type="text"
                    value={project.ideaBrief.problem.triggerEvent}
                    onChange={(e) =>
                      updateIdeaBriefField('problem', {
                        ...project.ideaBrief!.problem,
                        triggerEvent: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white"
                  />
                ) : (
                  <p className="text-xs text-zinc-400">{project.ideaBrief.problem.triggerEvent}</p>
                )}
              </div>
            </div>

            {/* Card 2: Target User Avatar */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
              <span className="text-xs uppercase tracking-wider font-bold text-cyan-400">
                Target User Avatar
              </span>
              <div>
                <label className="text-[11px] text-zinc-500">Primary Niche:</label>
                {editBriefMode ? (
                  <input
                    type="text"
                    value={project.ideaBrief.targetUser.primaryNiche}
                    onChange={(e) =>
                      updateIdeaBriefField('targetUser', {
                        ...project.ideaBrief!.targetUser,
                        primaryNiche: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white"
                  />
                ) : (
                  <p className="text-sm text-zinc-200 font-medium">
                    {project.ideaBrief.targetUser.primaryNiche}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[11px] text-zinc-500">Current Workarounds:</label>
                <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                  {project.ideaBrief.targetUser.currentWorkarounds.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Card 3: Proposed Value & Mechanic */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                Proposed Value & Mechanic
              </span>
              <div>
                <label className="text-[11px] text-zinc-500">Mechanic / How it Works:</label>
                {editBriefMode ? (
                  <textarea
                    value={project.ideaBrief.proposedValue.mechanicOrSolution}
                    onChange={(e) =>
                      updateIdeaBriefField('proposedValue', {
                        ...project.ideaBrief!.proposedValue,
                        mechanicOrSolution: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white"
                    rows={2}
                  />
                ) : (
                  <p className="text-xs text-zinc-300">
                    {project.ideaBrief.proposedValue.mechanicOrSolution}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[11px] text-zinc-500">Primary Benefit:</label>
                {editBriefMode ? (
                  <input
                    type="text"
                    value={project.ideaBrief.proposedValue.keyBenefit}
                    onChange={(e) =>
                      updateIdeaBriefField('proposedValue', {
                        ...project.ideaBrief!.proposedValue,
                        keyBenefit: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white"
                  />
                ) : (
                  <p className="text-sm text-emerald-400 font-medium">
                    {project.ideaBrief.proposedValue.keyBenefit}
                  </p>
                )}
              </div>
            </div>

            {/* Card 4: Boundaries & Constraints */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
              <span className="text-xs uppercase tracking-wider font-bold text-violet-400">
                Strategic Constraints
              </span>
              <div>
                <label className="text-[11px] text-zinc-500">Non-Negotiables:</label>
                <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1 mt-1">
                  {project.ideaBrief.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <label className="text-[11px] text-zinc-500">Category & Industry:</label>
                <p className="text-xs text-zinc-300">{project.ideaBrief.context.industryOrCategory}</p>
              </div>
            </div>
          </div>

          {/* User Control & Decision Checkpoints */}
          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-400">
              {project.ideaBrief.status === 'approved' ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Strategic Decision Locked. Ready for Positioning Worlds (Phase 2).
                </span>
              ) : (
                <span>
                  Strategic checkpoint: You must approve this brief to commit the foundational decision.
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Regenerate Button */}
              <button
                onClick={() => regenerateIdeaBrief()}
                disabled={isLoading}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                title="Regenerate brief with AI"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Regenerate
              </button>

              {/* Reject Button */}
              {project.ideaBrief.status !== 'rejected' && (
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-red-950 hover:text-red-300 text-zinc-400 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              )}

              {/* Approve Decision Button */}
              {project.ideaBrief.status !== 'approved' && (
                <button
                  onClick={() => approveIdeaBrief('Founder approved baseline.')}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Strategic Decision
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Reject Strategic Idea Brief</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Explain why this direction is incorrect so future iterations do not repeat this path.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Target audience is too broad; we must focus strictly on B2B engineering leads..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-500 mb-4 focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rejectIdeaBrief(rejectReason);
                  setShowRejectModal(false);
                }}
                disabled={!rejectReason.trim()}
                className="px-4 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
