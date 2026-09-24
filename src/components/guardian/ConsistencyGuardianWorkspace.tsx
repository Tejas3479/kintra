'use client';

import React, { useState } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import { GuardianArtifactType, GuardianFinding } from '@/types/guardian';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  RefreshCw,
  Wand2,
  Edit3,
  Check,
  FileText,
  Sparkles,
} from 'lucide-react';

const ARTIFACT_TYPE_LABELS: Record<GuardianArtifactType, { label: string; icon: string; desc: string }> = {
  website_headline: { label: 'Website Headline', icon: '🌐', desc: 'Hero value proposition and proof subdeck' },
  landing_page_section: { label: 'Landing-Page Section', icon: '📄', desc: 'Deep dive into problem & mechanism' },
  linkedin_post: { label: 'LinkedIn Post', icon: '💼', desc: 'Founder announcement and launch narrative' },
  social_caption: { label: 'Social Caption', icon: '💬', desc: 'Concise, punchy technical snippet' },
  launch_email: { label: 'Launch Email', icon: '✉️', desc: 'Direct outreach for private beta access' },
  pitch_paragraph: { label: 'Pitch Paragraph', icon: '🎯', desc: 'Investor memo or executive summary' },
  product_onboarding_copy: { label: 'Product Onboarding Copy', icon: '🚀', desc: 'In-product setup instructions' },
  support_response: { label: 'Support Response', icon: '🎧', desc: 'Technical customer reply with repro logs' },
};

export const ConsistencyGuardianWorkspace: React.FC = () => {
  const {
    project,
    generateArtifact,
    createCustomArtifact,
    selectArtifact,
    validateArtifact,
    acceptRepair,
    manuallyEditArtifact,
    regenerateArtifact,
    ignoreFinding,
    lockApprovedArtifact,
    unlockArtifact,
    isLoading,
  } = useBrandStore();

  const artifacts = project.brandArtifacts || [];
  const selectedArtifact = artifacts.find((a) => a.id === project.selectedArtifactId) || artifacts[0];

  const [selectedTypeToGen, setSelectedTypeToGen] = useState<GuardianArtifactType>('website_headline');
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedText, setEditedText] = useState(selectedArtifact?.content || '');
  const [ignoreModalFinding, setIgnoreModalFinding] = useState<GuardianFinding | null>(null);
  const [ignoreReason, setIgnoreReason] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<GuardianArtifactType>('landing_page_section');
  const [customContent, setCustomContent] = useState('');

  // Update edited text when active artifact changes
  React.useEffect(() => {
    if (selectedArtifact) {
      setEditedText(selectedArtifact.content);
      setIsEditingContent(false);
    }
  }, [selectedArtifact]);

  // Stage Gating: Remind user if Creative Identity is not locked
  const isStrategyReady = !!project.selectedWorldId;
  const isIdentityReady = !!project.creativeIdentity;

  const handleGenerate = async () => {
    await generateArtifact(selectedTypeToGen);
  };

  const handleSaveManualEdit = () => {
    if (!selectedArtifact) return;
    manuallyEditArtifact(selectedArtifact.id, editedText, 'Manual edit in consistency workspace');
    setIsEditingContent(false);
  };

  const handleCreateCustom = () => {
    if (!customName.trim() || !customContent.trim()) return;
    createCustomArtifact(customName.trim(), customType, customContent.trim());
    setShowCustomModal(false);
    setCustomName('');
    setCustomContent('');
  };

  const report = selectedArtifact?.validationReport;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-950/80 border border-emerald-700/50 rounded-lg text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                Consistency Guardian & Artifact Validation
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-normal bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Stage 6
                </span>
              </h2>
              <p className="text-sm text-zinc-400">
                Audits marketing copy, onboarding, and outreach against the locked Brand Decision Graph.
              </p>
            </div>
          </div>
        </div>

        {/* Action: Generate On-Brand Artifact */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedTypeToGen}
            onChange={(e) => setSelectedTypeToGen(e.target.value as GuardianArtifactType)}
            className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-2 focus:ring-emerald-500"
          >
            {Object.entries(ARTIFACT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.icon} {v.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !isStrategyReady}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-emerald-950/50 transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generate Artifact</span>
          </button>
          <button
            onClick={() => setShowCustomModal(true)}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition-colors"
          >
            + Custom
          </button>
        </div>
      </div>

      {/* Stage Gating Warning */}
      {!isIdentityReady && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-lg flex items-start space-x-3 text-amber-300 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
          <div>
            <div className="font-semibold text-amber-200">Creative Identity Stage Not Locked</div>
            <div className="text-xs text-amber-300/90 mt-1">
              For complete 9-dimension auditing, approve your Positioning Strategy and Creative Identity (Name, Voice, Visuals) above. The Guardian will calibrate validation against active defaults in the meantime.
            </div>
          </div>
        </div>
      )}

      {/* Artifact Navigation Tabs */}
      {artifacts.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-zinc-800/80">
          {artifacts.map((art) => {
            const isSelected = selectedArtifact?.id === art.id;
            const meta = ARTIFACT_TYPE_LABELS[art.artifactType] || { icon: '📄', label: art.artifactType };
            const isPassed = art.validationReport?.passed;

            return (
              <button
                key={art.id}
                onClick={() => selectArtifact(art.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-zinc-800 text-white border border-emerald-500/50 shadow-md'
                    : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900 border border-zinc-800'
                }`}
              >
                <span>{meta.icon}</span>
                <span className="truncate max-w-[140px]">{art.name}</span>
                {art.isLocked ? (
                  <Lock className="w-3 h-3 text-amber-400" />
                ) : isPassed ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {artifacts.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto text-zinc-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">No brand artifacts generated yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
              Select an artifact type above (e.g. Website Headline, Launch Email) to synthesize copy and run the 9-dimension Consistency Guardian.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-950/50"
          >
            Generate Website Headline
          </button>
        </div>
      )}

      {/* Main Workspace Split View */}
      {selectedArtifact && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Artifact Content & Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 bg-zinc-900/70 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  {selectedArtifact.name}
                  {selectedArtifact.isLocked && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800 font-mono flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> LOCKED
                    </span>
                  )}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Type: {selectedArtifact.artifactType} • Target: {selectedArtifact.targetAudience}
                </p>
              </div>

              {/* Version History Indicator */}
              <span className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-300 font-mono border border-zinc-700">
                v{selectedArtifact.versionHistory.length}
              </span>
            </div>

            {/* Content Display / Inline Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Artifact Copy ({selectedArtifact.content.length} chars)</span>
                {!selectedArtifact.isLocked && (
                  <button
                    onClick={() => {
                      if (isEditingContent) {
                        handleSaveManualEdit();
                      } else {
                        setIsEditingContent(true);
                      }
                    }}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                  >
                    {isEditingContent ? <Check className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                    <span>{isEditingContent ? 'Save & Audit' : 'Edit Manually'}</span>
                  </button>
                )}
              </div>

              {isEditingContent ? (
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={10}
                  className="w-full bg-zinc-950 border border-emerald-500/60 rounded-lg p-3 text-xs text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              ) : (
                <div className="bg-zinc-950/90 border border-zinc-800 rounded-lg p-4 text-xs text-zinc-200 font-sans whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
                  {selectedArtifact.content}
                </div>
              )}
            </div>

            {/* Version History Carousel / Log */}
            {selectedArtifact.versionHistory.length > 1 && (
              <div className="border-t border-zinc-800/80 pt-3">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                  Version History
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {selectedArtifact.versionHistory.map((ver) => (
                    <div
                      key={ver.version}
                      className="text-[11px] p-2 rounded bg-zinc-950/70 border border-zinc-800/60 flex items-center justify-between"
                    >
                      <span className="font-mono text-zinc-300">v{ver.version}</span>
                      <span className="text-zinc-500 truncate max-w-[160px]">{ver.editReason || ver.editedBy}</span>
                      <span className="text-zinc-500 font-mono text-[10px]">
                        {new Date(ver.editedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => validateArtifact(selectedArtifact.id)}
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Audit</span>
              </button>

              {!selectedArtifact.isLocked && (
                <button
                  onClick={() => regenerateArtifact(selectedArtifact.id)}
                  disabled={isLoading}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              )}

              {selectedArtifact.isLocked ? (
                <button
                  onClick={() => unlockArtifact(selectedArtifact.id)}
                  className="px-3 py-2 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 rounded-lg text-xs font-medium flex items-center space-x-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock</span>
                </button>
              ) : (
                <button
                  onClick={() => lockApprovedArtifact(selectedArtifact.id)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Approved Version</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: 9-Dimension Radar & Findings (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 9-Dimension Overview Cards */}
            {report && (
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                      <span>9-Dimension Brand Integrity Analysis</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                          report.passed
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {report.passed ? 'PASSED' : 'ACTION REQUIRED'}
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{report.summary}</p>
                  </div>
                </div>

                {/* 9 Dimensions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {Object.values(report.dimensions).map((dim) => {
                    const isPass = dim.status === 'pass';
                    const isWarning = dim.status === 'warning';
                    return (
                      <div
                        key={dim.dimension}
                        className={`p-2.5 rounded-lg border text-left transition-colors ${
                          isPass
                            ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                            : isWarning
                            ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                            : 'bg-red-950/20 border-red-900/40 text-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium truncate">{dim.label}</span>
                          <span className="font-mono text-xs font-bold">{dim.score}%</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-1 truncate" title={dim.rationale}>
                          {dim.rationale}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Findings & Repair Station */}
            {report && report.findings.length > 0 && (
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Audit Findings ({report.findings.length})</span>
                  </h3>
                  <span className="text-xs text-zinc-400">
                    Causal explanations strictly grounded in the Brand Decision Graph
                  </span>
                </div>

                <div className="space-y-4">
                  {report.findings.map((finding) => {
                    const isBlocking = finding.severity === 'blocking';
                    const isHigh = finding.severity === 'high';
                    const isApplied = finding.status === 'applied';
                    const isIgnored = finding.status === 'ignored';

                    return (
                      <div
                        key={finding.id}
                        className={`p-4 rounded-xl border text-xs space-y-3 transition-all ${
                          isApplied
                            ? 'bg-zinc-950/50 border-zinc-800 opacity-60'
                            : isIgnored
                            ? 'bg-zinc-950/40 border-zinc-800/60 opacity-50'
                            : isBlocking
                            ? 'bg-red-950/25 border-red-800/60 text-zinc-200'
                            : isHigh
                            ? 'bg-amber-950/25 border-amber-800/60 text-zinc-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        {/* Finding Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                isBlocking
                                  ? 'bg-red-900/80 text-red-200 border border-red-700'
                                  : isHigh
                                  ? 'bg-amber-900/80 text-amber-200 border border-amber-700'
                                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                              }`}
                            >
                              {finding.severity}
                            </span>
                            <span className="font-semibold text-zinc-100">{finding.issue}</span>
                          </div>

                          <span className="text-[10px] text-zinc-400 font-mono">{finding.dimension}</span>
                        </div>

                        {/* Exact Evidence Excerpt */}
                        <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800/80 font-mono text-zinc-400 text-[11px]">
                          <span className="text-zinc-500">Detected: </span>
                          <span className="text-red-300">&quot;{finding.evidence}&quot;</span>
                        </div>

                        {/* Structured Explanation (WHAT, WHY, WHICH, HOW) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/60 text-[11px] leading-relaxed">
                          <div>
                            <span className="font-semibold text-zinc-400">WHAT is wrong: </span>
                            <span className="text-zinc-300">{finding.explanation.whatIsWrong}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-400">WHY it matters: </span>
                            <span className="text-zinc-300">{finding.explanation.whyItMatters}</span>
                          </div>
                          <div className="md:col-span-2 pt-1 border-t border-zinc-800/50">
                            <span className="font-semibold text-amber-300">WHICH brand decision: </span>
                            <span className="text-zinc-200 font-mono font-medium">
                              {finding.explanation.whichDecisionConflicts}
                            </span>
                          </div>
                          <div className="md:col-span-2 pt-1 border-t border-zinc-800/50">
                            <span className="font-semibold text-emerald-400">HOW to correct: </span>
                            <span className="text-zinc-200">{finding.explanation.howToCorrect}</span>
                          </div>
                        </div>

                        {/* Repair Station Actions */}
                        {!isApplied && !isIgnored && !selectedArtifact.isLocked && (
                          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-zinc-500 font-mono">Suggested repair:</span>
                              <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                                {finding.suggestedRepair}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setIgnoreModalFinding(finding);
                                  setIgnoreReason('');
                                }}
                                className="px-2.5 py-1 text-zinc-400 hover:text-zinc-200 text-[11px] rounded transition-colors"
                              >
                                Ignore
                              </button>
                              <button
                                onClick={() => acceptRepair(selectedArtifact.id, finding.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold shadow-sm transition-colors flex items-center space-x-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Accept Fix</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {isApplied && (
                          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 pt-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Repair applied to artifact copy</span>
                          </div>
                        )}

                        {isIgnored && (
                          <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5 pt-1">
                            <span>Ignored: &quot;{finding.ignoredReason || 'Marked as acceptable by founder'}&quot;</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Zero findings clean state */}
            {report && report.findings.length === 0 && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-8 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-semibold text-emerald-300">100% Brand Consistent</h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Zero findings across all 9 validation dimensions. This artifact belongs authentically to your brand and is ready to publish or lock.
                </p>
                {!selectedArtifact.isLocked && (
                  <button
                    onClick={() => lockApprovedArtifact(selectedArtifact.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg"
                  >
                    Lock Approved Canonical Version
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Ignore Finding with Rationale */}
      {ignoreModalFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Ignore Finding
            </h3>
            <p className="text-xs text-zinc-400">
              Provide a rationale for ignoring this finding. The rationale will be recorded in the audit ledger:
            </p>
            <div className="p-3 bg-zinc-950 rounded border border-zinc-800 text-xs text-zinc-300">
              {ignoreModalFinding.issue}
            </div>
            <textarea
              value={ignoreReason}
              onChange={(e) => setIgnoreReason(e.target.value)}
              placeholder="e.g. Deliberately using this phrasing for a specific partner campaign..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIgnoreModalFinding(null)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedArtifact) {
                    ignoreFinding(
                      selectedArtifact.id,
                      ignoreModalFinding.id,
                      ignoreReason.trim() || 'Approved exception by founder'
                    );
                  }
                  setIgnoreModalFinding(null);
                }}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold"
              >
                Confirm Ignore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Custom Artifact */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Create Custom Artifact for Audit
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Artifact Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. TechCrunch Launch Pitch, Q3 Newsletter"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Artifact Type</label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as GuardianArtifactType)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {Object.entries(ARTIFACT_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.icon} {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Content / Copy to Validate</label>
                <textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="Paste or write your marketing headline, pitch, or email copy here..."
                  rows={6}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustom}
                disabled={!customName.trim() || !customContent.trim()}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs font-semibold"
              >
                Create & Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
