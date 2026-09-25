import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  CanonicalBrandState,
  ExtractedFact,
  Hypothesis,
  IdeaBrief,
  ProjectSnapshot,
  ApprovedDecision,
} from '@/types/brand';
import { MarketLandscape, CompetitorProfile } from '@/types/research';
import { PositioningWorld, DecisionNode, DecisionEdge, ContradictionAlert } from '@/types/strategy';
import {
  CreativeIdentity,
  VoiceSystem,
  GeneratedVisualAsset,
} from '@/types/identity';
import { ContradictionDetector } from '@/lib/strategy/contradiction-detector';
import { StrategyService } from '@/lib/strategy/strategy-service';
import { IdentityConsistencyChecker } from '@/lib/identity/identity-consistency-checker';
import { IdentityService } from '@/lib/identity/identity-service';
import { DefaultImageGenerationProvider } from '@/lib/identity/image-provider';
import {
  BrandArtifact,
  GuardianArtifactType,
  VisualSpecOverride,
  ArtifactValidationReport,
} from '@/types/guardian';
import { ConsistencyGuardian } from '@/lib/guardian/consistency-guardian';
import {
  ScenarioTemplateType,
  ScenarioArtifact,
  AssumptionCategory,
  AssumptionChangeRequest,
  DependencyImpactReport,
  EvolutionApprovalChoice,
  BrandBranch,
  BranchComparisonDiff,
} from '@/types/evolution';
import { ScenarioLabEngine } from '@/lib/evolution/scenario-lab-engine';
import { BrandEvolutionEngine } from '@/lib/evolution/brand-evolution-engine';
import { LaunchKit } from '@/types/launch-kit';
import { LaunchKitEngine } from '@/lib/launch-kit/launch-kit-engine';
import { CanonicalBrandStateSchema } from '@/lib/schemas/brand-schemas';
import { INITIAL_DEMO_PROJECT } from '@/fixtures/demo-brands';
import { logger } from '@/lib/logger';

// In-flight abort controllers to cancel superseded operations
const inFlightControllers = new Map<string, AbortController>();

export function getAbortSignal(key: string): AbortSignal {
  const existing = inFlightControllers.get(key);
  if (existing) {
    try {
      existing.abort();
    } catch {
      // Ignore abort errors
    }
  }
  const controller = new AbortController();
  inFlightControllers.set(key, controller);
  return controller.signal;
}

export function cancelInFlightOperation(key: string): void {
  const existing = inFlightControllers.get(key);
  if (existing) {
    try {
      existing.abort();
    } catch {
      // Ignore
    }
    inFlightControllers.delete(key);
  }
}

export function clearAbortSignal(key: string): void {
  inFlightControllers.delete(key);
}

export function isAbortError(err: unknown): boolean {
  return (
    (err instanceof Error && (err.name === 'AbortError' || err.message.includes('aborted'))) ||
    (typeof err === 'object' && err !== null && 'name' in err && (err as { name: string }).name === 'AbortError')
  );
}

interface BrandStoreState {
  // Active Project State
  project: CanonicalBrandState;
  // History & Snapshots
  snapshots: ProjectSnapshot[];
  // UI Loading & Errors
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  isHydrated: boolean;
  setHydrated: (hydrated: boolean) => void;

  // Actions: Project Management
  createProject: (name: string, initialIdea?: string) => void;
  loadDemoProject: () => void;
  createSnapshot: (label: string) => void;
  rollbackToSnapshot: (snapshotId: string) => boolean;
  exportProjectJSON: () => string;
  importProjectJSON: (jsonString: string) => { success: boolean; error?: string };
  resetProject: (preserveSnapshots?: boolean) => void;
  cancelOperation: (operationKey: string) => void;

  // Actions: Discovery Flow
  setRawFounderInput: (input: string) => void;
  runIntakeAnalysis: (rawIdea: string) => Promise<boolean>;
  answerInterviewQuestion: (questionId: string, answer: string) => Promise<void>;
  skipInterviewQuestion: (questionId: string) => Promise<void>;
  generateNextQuestion: () => Promise<void>;
  synthesizeBrief: () => Promise<boolean>;

  // Actions: Research & Evidence Ledger
  runMarketResearch: (query?: string) => Promise<boolean>;
  addManualCompetitor: (name: string, claimedPositioning: string, targetAudience?: string) => void;
  removeEvidenceRecord: (id: string) => void;
  setMarketLandscape: (landscape: MarketLandscape) => void;

  // Actions: Strategy & Positioning Worlds
  generatePositioningWorlds: () => Promise<boolean>;
  selectPositioningWorld: (worldId: string, rationale?: string) => void;
  editPositioningWorld: (worldId: string, updates: Partial<PositioningWorld>) => void;
  editDecision: (
    decisionId: string,
    updates: { approvedValue?: string; rationale?: string; tradeoff?: string }
  ) => void;
  combinePositioningWorlds: (
    title: string,
    archetype: PositioningWorld['archetype'],
    valueProp: string,
    sacrifice: string
  ) => void;
  rejectPositioningWorld: (worldId: string, reason: string) => void;
  auditContradictions: () => void;

  // Actions: Creative Identity (Naming, Voice, Visuals)
  generateCreativeIdentity: () => Promise<boolean>;
  selectName: (candidateId: string) => void;
  rejectName: (candidateId: string, reason: string) => void;
  selectTagline: (taglineId: string) => void;
  updateVoiceTonalSlider: (slider: keyof VoiceSystem['tonalSliders'], value: number) => void;
  updateVisualPaletteColor: (role: 'primary' | 'secondary' | 'accent', hex: string) => void;
  generateVisualAsset: (assetType?: GeneratedVisualAsset['assetType']) => Promise<boolean>;
  approveCreativeIdentity: (rationale?: string) => void;
  auditIdentityConsistency: () => void;

  // Actions: Consistency Guardian & Artifact Validation
  generateArtifact: (artifactType: GuardianArtifactType) => Promise<boolean>;
  createCustomArtifact: (
    name: string,
    artifactType: GuardianArtifactType,
    content: string,
    visualSpec?: VisualSpecOverride
  ) => void;
  selectArtifact: (artifactId: string) => void;
  validateArtifact: (artifactId: string) => Promise<boolean>;
  acceptRepair: (artifactId: string, findingId: string) => Promise<boolean>;
  manuallyEditArtifact: (artifactId: string, newContent: string, reason?: string) => void;
  regenerateArtifact: (artifactId: string) => Promise<boolean>;
  ignoreFinding: (artifactId: string, findingId: string, reason: string) => void;
  lockApprovedArtifact: (artifactId: string, rationale?: string) => void;
  unlockArtifact: (artifactId: string) => void;

  // Evolution & Scenario Lab State (Prompt 10)
  scenarioArtifacts: ScenarioArtifact[];
  selectedScenarioId: string | null;
  activeChangeRequest: AssumptionChangeRequest | null;
  impactReport: DependencyImpactReport | null;
  branches: BrandBranch[];
  activeBranchId: string | null;

  // Actions: Scenario Lab
  runScenarioTest: (scenarioType: ScenarioTemplateType) => Promise<boolean>;
  selectScenario: (scenarioId: string) => void;
  repairScenario: (scenarioId: string, findingId: string) => Promise<void> | void;
  manuallyEditScenario: (scenarioId: string, newContent: string) => Promise<void> | void;

  // Actions: Assumption Evolution Engine
  proposeAssumptionChange: (category: AssumptionCategory, proposedValue: string, rationale: string) => Promise<void> | void;
  clearProposedAssumption: () => void;
  approveEvolution: (choice: EvolutionApprovalChoice, branchName?: string) => Promise<void> | void;

  // Actions: Branching & Versioning
  createBranch: (name: string, description?: string) => void;
  switchBranch: (branchId: string) => boolean;
  compareBranches: (baseBranchId: string, targetBranchId: string) => BranchComparisonDiff | null;

  // Launch Kit & Brand Guidelines State (Prompt 11)
  launchKit: LaunchKit | null;
  selectedLaunchItemId: string | null;
  isPresentationModeOpen: boolean;
  exportContent: { format: 'markdown' | 'json'; content: string } | null;

  // Actions: Launch Kit & Guidelines
  generateLaunchKit: () => Promise<boolean>;
  selectLaunchItem: (itemId: string | null) => void;
  exportLaunchKit: (format: 'markdown' | 'json') => string;
  togglePresentationMode: (open?: boolean) => void;
  clearExport: () => void;

  // Actions: User Control & Editing
  updateFact: (factId: string, statement: string, verified: boolean) => void;
  deleteFact: (factId: string) => void;
  addFact: (statement: string) => void;
  updateHypothesis: (hypId: string, claim: string, riskLevel: Hypothesis['riskLevel']) => void;
  updateIdeaBriefField: <K extends keyof IdeaBrief>(field: K, value: IdeaBrief[K]) => void;
  approveIdeaBrief: (rationale?: string) => void;
  rejectIdeaBrief: (reason: string) => void;
  regenerateIdeaBrief: () => Promise<boolean>;

  // Utility Actions
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const DEFAULT_EMPTY_PROJECT: CanonicalBrandState = {
  metadata: {
    id: 'proj-new',
    name: 'Untitled Brand Project',
    slug: 'untitled-brand-project',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemoProject: false,
  },
  stage: 'intake',
  rawFounderInput: '',
  extractedFacts: [],
  unresolvedQuestions: [],
  hypotheses: [],
  interviewState: {
    currentQuestionIndex: 0,
    history: [],
    isComplete: false,
    lastUpdated: new Date().toISOString(),
  },
  marketLandscape: null,
  positioningWorlds: [],
  selectedWorldId: null,
  decisionGraph: { nodes: {}, edges: [] },
  contradictions: [],
  ideaBrief: null,
  creativeIdentity: null,
  decisions: {},
  artifacts: [],
  brandArtifacts: [],
  selectedArtifactId: null,
  scenarioArtifacts: [],
  selectedScenarioId: null,
  branches: [],
  currentBranchId: undefined,
  launchKit: null,
  validationHistory: [],
};

export const useBrandStore = create<BrandStoreState>()(
  persist(
    (set, get) => ({
      project: DEFAULT_EMPTY_PROJECT,
      snapshots: [],
      scenarioArtifacts: [],
      selectedScenarioId: null,
      activeChangeRequest: null,
      impactReport: null,
      branches: [],
      activeBranchId: null,
      launchKit: null,
      selectedLaunchItemId: null,
      isPresentationModeOpen: false,
      exportContent: null,
      isLoading: false,
      loadingMessage: '',
      error: null,
      isHydrated: false,
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

      setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      createProject: (name: string, initialIdea = '') => {
        const id = `proj-${Date.now()}`;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const newProject: CanonicalBrandState = {
          ...DEFAULT_EMPTY_PROJECT,
          metadata: {
            id,
            name,
            slug: slug || 'brand-project',
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDemoProject: false,
          },
          rawFounderInput: initialIdea,
        };

        set({
          project: newProject,
          snapshots: [],
          scenarioArtifacts: [],
          selectedScenarioId: null,
          activeChangeRequest: null,
          impactReport: null,
          branches: [],
          activeBranchId: null,
          launchKit: null,
          selectedLaunchItemId: null,
          isPresentationModeOpen: false,
          exportContent: null,
          error: null,
        });
      },

      loadDemoProject: () => {
        set({
          project: INITIAL_DEMO_PROJECT,
          scenarioArtifacts: INITIAL_DEMO_PROJECT.scenarioArtifacts || [],
          branches: INITIAL_DEMO_PROJECT.branches || [],
          activeBranchId: INITIAL_DEMO_PROJECT.currentBranchId || null,
          launchKit: (INITIAL_DEMO_PROJECT.launchKit as LaunchKit | null) || null,
          selectedScenarioId: null,
          activeChangeRequest: null,
          impactReport: null,
          selectedLaunchItemId: INITIAL_DEMO_PROJECT.launchKit?.items?.[0]?.id || null,
          error: null,
        });
      },

      createSnapshot: (label: string) => {
        const state = get().project;
        const snapshot: ProjectSnapshot = {
          id: `snap-${Date.now()}`,
          version: state.metadata.version,
          label,
          timestamp: new Date().toISOString(),
          state: JSON.parse(JSON.stringify(state)),
        };

        set((s) => ({
          snapshots: [snapshot, ...s.snapshots].slice(0, 3), // keep last 3 snapshots to prevent localStorage quota overflow
          project: {
            ...s.project,
            metadata: {
              ...s.project.metadata,
              version: s.project.metadata.version + 1,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      rollbackToSnapshot: (snapshotId: string) => {
        const target = get().snapshots.find((s) => s.id === snapshotId);
        if (!target) return false;

        const restoredProject = JSON.parse(JSON.stringify(target.state));
        set({
          project: restoredProject,
          scenarioArtifacts: restoredProject.scenarioArtifacts || [],
          branches: restoredProject.branches || get().branches,
          activeBranchId: restoredProject.currentBranchId || get().activeBranchId,
          launchKit: (restoredProject.launchKit as LaunchKit | null) || null,
          selectedScenarioId: null,
          activeChangeRequest: null,
          impactReport: null,
          selectedLaunchItemId: restoredProject.launchKit?.items?.[0]?.id || null,
          error: null,
        });
        return true;
      },

      exportProjectJSON: () => {
        const state = get();
        const exportData = {
          ...state.project,
          scenarioArtifacts: state.scenarioArtifacts?.length ? state.scenarioArtifacts : state.project.scenarioArtifacts,
          branches: state.branches?.length ? state.branches : state.project.branches,
          currentBranchId: state.activeBranchId || state.project.currentBranchId,
          launchKit: state.launchKit || state.project.launchKit,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importProjectJSON: (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString);
          const sanitized = {
            ...parsed,
            artifacts: parsed.artifacts || [],
            brandArtifacts: parsed.brandArtifacts || [],
            scenarioArtifacts: parsed.scenarioArtifacts || [],
            branches: parsed.branches || [],
            extractedFacts: parsed.extractedFacts || [],
            unresolvedQuestions: parsed.unresolvedQuestions || [],
            hypotheses: parsed.hypotheses || [],
            validationHistory: parsed.validationHistory || [],
            decisions: parsed.decisions || {},
          };
          const validated = CanonicalBrandStateSchema.parse(sanitized);
          set({
            project: validated,
            scenarioArtifacts: validated.scenarioArtifacts || [],
            branches: validated.branches || [],
            activeBranchId: validated.currentBranchId || null,
            launchKit: (validated.launchKit as LaunchKit | null) || null,
            selectedScenarioId: null,
            activeChangeRequest: null,
            impactReport: null,
            selectedLaunchItemId: validated.launchKit?.items?.[0]?.id || null,
            error: null,
          });
          return { success: true };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Invalid brand state JSON file.';
          set({ error: `Import failed: ${message}` });
          return { success: false, error: message };
        }
      },

      resetProject: (preserveSnapshots = false) => {
        set((s) => ({
          project: {
            ...DEFAULT_EMPTY_PROJECT,
            metadata: {
              ...DEFAULT_EMPTY_PROJECT.metadata,
              id: `proj-${Date.now()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          snapshots: preserveSnapshots ? s.snapshots : [],
          scenarioArtifacts: [],
          selectedScenarioId: null,
          activeChangeRequest: null,
          impactReport: null,
          branches: [],
          activeBranchId: null,
          launchKit: null,
          selectedLaunchItemId: null,
          isPresentationModeOpen: false,
          exportContent: null,
          error: null,
        }));
      },

      cancelOperation: (operationKey: string) => {
        cancelInFlightOperation(operationKey);
        set({ isLoading: false, loadingMessage: '' });
      },

      setRawFounderInput: (input: string) => {
        set((s) => ({
          project: {
            ...s.project,
            rawFounderInput: input,
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));
      },

      runIntakeAnalysis: async (rawIdea: string) => {
        set({ isLoading: true, loadingMessage: 'Deconstructing idea into facts & assumptions...', error: null });
        const signal = getAbortSignal('discovery_intake');

        try {
          const res = await fetch('/api/discovery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'intake', rawIdea }),
            signal,
          });

          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.error || 'Failed to analyze idea.');
          }

          const { extractedFacts, hypotheses, initialQuestions } = json.data;

          set((s) => ({
            isLoading: false,
            loadingMessage: '',
            project: {
              ...s.project,
              stage: 'discovery',
              rawFounderInput: rawIdea,
              extractedFacts,
              hypotheses,
              interviewState: {
                currentQuestionIndex: 0,
                history: initialQuestions,
                isComplete: false,
                lastUpdated: new Date().toISOString(),
              },
              metadata: {
                ...s.project.metadata,
                updatedAt: new Date().toISOString(),
              },
            },
          }));

          clearAbortSignal('discovery_intake');
          return true;
        } catch (err: unknown) {
          clearAbortSignal('discovery_intake');
          if (isAbortError(err)) {
            return false;
          }
          set({
            isLoading: false,
            loadingMessage: '',
            error: err instanceof Error ? err.message : 'Analysis failed.',
          });
          return false;
        }
      },

      answerInterviewQuestion: async (questionId: string, answer: string) => {
        const history = [...get().project.interviewState.history];
        const idx = history.findIndex((q) => q.id === questionId);
        if (idx === -1) return;

        history[idx] = {
          ...history[idx],
          userAnswer: answer,
          answeredAt: new Date().toISOString(),
        };

        const nextIdx = idx + 1;
        const isComplete = nextIdx >= history.length && history.length >= 2;

        set((s) => ({
          project: {
            ...s.project,
            interviewState: {
              ...s.project.interviewState,
              currentQuestionIndex: isComplete ? idx : nextIdx,
              history,
              isComplete,
              lastUpdated: new Date().toISOString(),
            },
          },
        }));

        // If answered all questions so far but need adaptive next question
        if (!isComplete && nextIdx >= history.length) {
          await get().generateNextQuestion();
        }
      },

      skipInterviewQuestion: async (questionId: string) => {
        const history = [...get().project.interviewState.history];
        const idx = history.findIndex((q) => q.id === questionId);
        if (idx === -1) return;

        history[idx] = {
          ...history[idx],
          skipped: true,
        };

        const nextIdx = idx + 1;
        const isComplete = nextIdx >= history.length;

        set((s) => ({
          project: {
            ...s.project,
            interviewState: {
              ...s.project.interviewState,
              currentQuestionIndex: isComplete ? idx : nextIdx,
              history,
              isComplete,
              lastUpdated: new Date().toISOString(),
            },
          },
        }));

        if (!isComplete && nextIdx >= history.length) {
          await get().generateNextQuestion();
        }
      },

      generateNextQuestion: async () => {
        const { rawFounderInput, interviewState } = get().project;
        if (interviewState.history.length >= 4) {
          set((s) => ({
            project: {
              ...s.project,
              interviewState: { ...s.project.interviewState, isComplete: true },
            },
          }));
          return;
        }

        const signal = getAbortSignal('discovery_next_question');
        try {
          const res = await fetch('/api/discovery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'next_question',
              rawIdea: rawFounderInput,
              history: interviewState.history,
            }),
            signal,
          });

          const json = await res.json();
          if (res.ok && json.success && json.data.hasMore && json.data.nextQuestion) {
            set((s) => ({
              project: {
                ...s.project,
                interviewState: {
                  ...s.project.interviewState,
                  history: [...s.project.interviewState.history, json.data.nextQuestion],
                  currentQuestionIndex: s.project.interviewState.history.length,
                  lastUpdated: new Date().toISOString(),
                },
              },
            }));
          } else {
            // Marked complete
            set((s) => ({
              project: {
                ...s.project,
                interviewState: { ...s.project.interviewState, isComplete: true },
              },
            }));
          }
          clearAbortSignal('discovery_next_question');
        } catch (err) {
          clearAbortSignal('discovery_next_question');
          if (isAbortError(err)) return;
          // Fallback to completing interview if next question fails
          set((s) => ({
            project: {
              ...s.project,
              interviewState: { ...s.project.interviewState, isComplete: true },
            },
          }));
        }
      },

      synthesizeBrief: async () => {
        const { rawFounderInput, extractedFacts, hypotheses, interviewState } = get().project;
        set({ isLoading: true, loadingMessage: 'Synthesizing strategic Idea Brief...', error: null });
        const signal = getAbortSignal('discovery_synthesize');

        try {
          const res = await fetch('/api/discovery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'synthesize',
              rawIdea: rawFounderInput,
              facts: extractedFacts,
              assumptions: hypotheses,
              history: interviewState.history,
            }),
            signal,
          });

          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.error || 'Failed to synthesize idea brief.');
          }

          const ideaBrief: IdeaBrief = json.data;

          set((s) => ({
            isLoading: false,
            loadingMessage: '',
            project: {
              ...s.project,
              stage: 'brief_review',
              ideaBrief,
              metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
            },
          }));

          clearAbortSignal('discovery_synthesize');
          return true;
        } catch (err: unknown) {
          clearAbortSignal('discovery_synthesize');
          if (isAbortError(err)) {
            return false;
          }
          set({
            isLoading: false,
            loadingMessage: '',
            error: err instanceof Error ? err.message : 'Brief synthesis failed.',
          });
          return false;
        }
      },

      runMarketResearch: async (query?: string) => {
        const brief = get().project.ideaBrief;
        const targetQuery =
          query ||
          brief?.context?.industryOrCategory ||
          brief?.problem?.corePain ||
          get().project.rawFounderInput ||
          'Modern product innovation';
        set({ isLoading: true, loadingMessage: 'Analyzing market landscape and compiling evidence ledger...', error: null });
        const signal = getAbortSignal('market_research');

        try {
          const res = await fetch('/api/research', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: targetQuery,
              rawIdea: get().project.rawFounderInput,
            }),
            signal,
          });

          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.error || 'Failed to aggregate market research.');
          }

          const landscape: MarketLandscape = json.data;

          set((s) => ({
            isLoading: false,
            loadingMessage: '',
            project: {
              ...s.project,
              stage: s.project.stage === 'intake' || s.project.stage === 'discovery' ? 'research' : s.project.stage,
              marketLandscape: landscape,
              metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
            },
          }));

          clearAbortSignal('market_research');
          return true;
        } catch (err: unknown) {
          clearAbortSignal('market_research');
          if (isAbortError(err)) {
            return false;
          }
          set({
            isLoading: false,
            loadingMessage: '',
            error: err instanceof Error ? err.message : 'Research aggregation failed.',
          });
          return false;
        }
      },

      addManualCompetitor: (name: string, claimedPositioning: string, targetAudience = 'General market') => {
        const landscape = get().project.marketLandscape;
        if (!landscape) return;

        const newComp: CompetitorProfile = {
          id: `comp-custom-${Date.now()}`,
          name,
          claimedPositioning,
          targetAudience,
          strengths: ['Founder-identified market player'],
          weaknesses: ['Competitor profile added directly by user'],
          clichePhrases: [],
          sourceIds: [],
        };

        set((s) => ({
          project: {
            ...s.project,
            marketLandscape: {
              ...landscape,
              competitors: [...landscape.competitors, newComp],
            },
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));
      },

      removeEvidenceRecord: (id: string) => {
        const landscape = get().project.marketLandscape;
        if (!landscape) return;

        set((s) => ({
          project: {
            ...s.project,
            marketLandscape: {
              ...landscape,
              evidenceRecords: landscape.evidenceRecords.filter((r) => r.id !== id),
            },
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));
      },

      setMarketLandscape: (landscape: MarketLandscape) => {
        set((s) => ({
          project: {
            ...s.project,
            marketLandscape: landscape,
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));
      },

      generatePositioningWorlds: async () => {
        const { ideaBrief, marketLandscape } = get().project;
        if (!ideaBrief) {
          set({ error: 'Please review and approve the Idea Brief before generating positioning worlds.' });
          return false;
        }

        set({ isLoading: true, loadingMessage: 'Synthesizing high-contrast strategic positioning worlds...', error: null });
        const signal = getAbortSignal('strategy_worlds');

        try {
          let worlds: PositioningWorld[];
          let contradictions: ContradictionAlert[] = [];

          try {
            const res = await fetch('/api/strategy', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'generate_worlds',
                brief: ideaBrief,
                evidenceRecords: marketLandscape?.evidenceRecords || [],
              }),
              signal,
            });

            const json = await res.json();
            if (res.ok && json.success) {
              worlds = json.data.worlds;
              contradictions = json.data.contradictions || [];
            } else {
              throw new Error(json.error || 'Failed to generate positioning worlds.');
            }
          } catch (fetchErr) {
            if (isAbortError(fetchErr)) return false;
            // Direct service fallback (e.g. offline, test environment, or API route unreachable)
            worlds = StrategyService.generateWorlds(ideaBrief, marketLandscape?.evidenceRecords || []);
            contradictions = worlds.flatMap((w) =>
              ContradictionDetector.auditPositioningWorld(w, marketLandscape?.evidenceRecords || [])
            );
          }

          clearAbortSignal('strategy_worlds');

          set((s) => ({
            isLoading: false,
            loadingMessage: '',
            project: {
              ...s.project,
              stage: 'positioning',
              positioningWorlds: worlds,
              contradictions: contradictions || [],
              metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
            },
          }));

          return true;
        } catch (err: unknown) {
          clearAbortSignal('strategy_worlds');
          if (isAbortError(err)) {
            return false;
          }
          set({
            isLoading: false,
            loadingMessage: '',
            error: err instanceof Error ? err.message : 'Positioning generation failed.',
          });
          return false;
        }
      },

      selectPositioningWorld: (worldId: string, rationale = 'Founder approved strategic positioning territory.') => {
        const { project } = get();
        const { positioningWorlds } = project;
        const selected = positioningWorlds.find((w) => w.id === worldId);
        if (!selected) return;

        const updatedWorlds = positioningWorlds.map((w) => ({
          ...w,
          status: (w.id === worldId ? 'selected' : 'rejected') as PositioningWorld['status'],
        }));

        // Build DecisionNode and Edge
        const decisionId = `decision-world-${Date.now()}`;
        const rejectedAlts = positioningWorlds
          .filter((w) => w.id !== worldId)
          .map((w) => ({
            id: w.id,
            title: w.title,
            whyRejected: w.rejectionReason || `Rejected in favor of ${selected.title}.`,
          }));

        const decisionNode: DecisionNode = {
          id: decisionId,
          category: 'positioning_world',
          title: `Positioning Territory: ${selected.title}`,
          approvedValue: selected.valueProposition,
          rationale: `${rationale} (Emphasizes: ${selected.tradeoffs.whatWeEmphasize}; Sacrifices: ${selected.tradeoffs.whatWeSacrifice})`,
          evidenceIds: selected.supportingEvidenceIds,
          rejectedAlternatives: rejectedAlts,
          tradeoff: selected.tradeoffs.whatWeSacrifice,
          dependsOn: ['brief-baseline'],
          governs: ['identity_system', 'voice_sliders', 'hero_headline'],
          status: 'approved',
          approvedAt: new Date().toISOString(),
          version: project.metadata.version,
        };

        const edge: DecisionEdge = {
          id: `edge-brief-${Date.now()}`,
          source: 'brief-baseline',
          target: decisionId,
          relation: 'supports',
        };

        const approvedDecision: ApprovedDecision = {
          id: decisionId,
          category: 'positioning',
          title: `Positioning: ${selected.title}`,
          value: selected.valueProposition,
          rationale,
          approvedAt: new Date().toISOString(),
          approvedBy: 'founder',
          version: project.metadata.version,
        };

        set((s) => ({
          project: {
            ...s.project,
            stage: 'strategy_locked',
            selectedWorldId: worldId,
            positioningWorlds: updatedWorlds,
            decisionGraph: {
              nodes: {
                ...(s.project.decisionGraph?.nodes || {}),
                ...(!s.project.decisionGraph?.nodes?.['brief-baseline']
                  ? {
                      'brief-baseline': {
                        id: 'brief-baseline',
                        category: 'problem_framing',
                        title: 'Strategic Brief Baseline',
                        approvedValue:
                          s.project.ideaBrief?.problem.corePain || 'Strategic problem & value framing anchor',
                        rationale: 'Baseline problem and value framing anchor',
                        evidenceIds: [],
                        rejectedAlternatives: [],
                        tradeoff: 'Initial problem formulation constraints',
                        dependsOn: [],
                        governs: ['positioning_world', 'target_niche'],
                        status: 'approved',
                        approvedAt: new Date().toISOString(),
                        version: s.project.metadata.version,
                      },
                    }
                  : {}),
                [decisionId]: decisionNode,
              },
              edges: [...(s.project.decisionGraph?.edges || []), edge],
            },
            decisions: {
              ...s.project.decisions,
              [decisionId]: approvedDecision,
            },
            metadata: {
              ...s.project.metadata,
              version: s.project.metadata.version + 1,
              updatedAt: new Date().toISOString(),
            },
          },
        }));

        // Take snapshot of committed strategy
        get().createSnapshot(`Locked Positioning Strategy: ${selected.title}`);
      },

      editPositioningWorld: (worldId: string, updates: Partial<PositioningWorld>) => {
        const { project } = get();
        const isSelected = project.selectedWorldId === worldId;
        const newVersion = isSelected ? project.metadata.version + 1 : project.metadata.version;

        // If this world is selected, also sync the corresponding decision node in the graph
        const updatedNodes = { ...(project.decisionGraph?.nodes || {}) };
        if (isSelected) {
          Object.keys(updatedNodes).forEach((k) => {
            if (updatedNodes[k].category === 'positioning_world') {
              updatedNodes[k] = {
                ...updatedNodes[k],
                approvedValue: updates.valueProposition ?? updatedNodes[k].approvedValue,
                tradeoff: updates.tradeoffs?.whatWeSacrifice ?? updatedNodes[k].tradeoff,
                version: newVersion,
              };
            }
          });
        }

        set((s) => ({
          project: {
            ...s.project,
            positioningWorlds: s.project.positioningWorlds.map((w) =>
              w.id === worldId ? { ...w, ...updates, userCustomizations: 'User modified' } : w
            ),
            decisionGraph: {
              ...s.project.decisionGraph,
              nodes: updatedNodes,
            },
            metadata: {
              ...s.project.metadata,
              updatedAt: new Date().toISOString(),
            },
          },
        }));

        if (isSelected) {
          get().createSnapshot(`Updated Selected Strategy (v${newVersion})`);
        }

        get().auditContradictions();
      },

      editDecision: (
        decisionId: string,
        updates: { approvedValue?: string; rationale?: string; tradeoff?: string }
      ) => {
        const { project } = get();
        const existingNode = project.decisionGraph.nodes[decisionId];
        if (!existingNode) return;

        const newVersion = project.metadata.version + 1;
        const updatedNode: DecisionNode = {
          ...existingNode,
          ...updates,
          version: newVersion,
          approvedAt: new Date().toISOString(),
        };

        // Sync back to selected PositioningWorld if this was a positioning_world decision
        let updatedWorlds = project.positioningWorlds;
        if (existingNode.category === 'positioning_world' && project.selectedWorldId) {
          updatedWorlds = project.positioningWorlds.map((w) => {
            if (w.id === project.selectedWorldId) {
              return {
                ...w,
                ...(updates.approvedValue ? { valueProposition: updates.approvedValue } : {}),
                ...(updates.tradeoff
                  ? {
                      tradeoffs: {
                        ...w.tradeoffs,
                        whatWeSacrifice: updates.tradeoff,
                      },
                    }
                  : {}),
              };
            }
            return w;
          });
        }

        set((s) => ({
          project: {
            ...s.project,
            positioningWorlds: updatedWorlds,
            decisionGraph: {
              ...s.project.decisionGraph,
              nodes: {
                ...s.project.decisionGraph.nodes,
                [decisionId]: updatedNode,
              },
            },
            decisions: {
              ...s.project.decisions,
              ...(s.project.decisions[decisionId]
                ? {
                    [decisionId]: {
                      ...s.project.decisions[decisionId],
                      value: updates.approvedValue ?? s.project.decisions[decisionId].value,
                      rationale: updates.rationale ?? s.project.decisions[decisionId].rationale,
                    },
                  }
                : {}),
            },
            metadata: {
              ...s.project.metadata,
              updatedAt: new Date().toISOString(),
            },
          },
        }));

        get().createSnapshot(`Edited Decision: ${updatedNode.title} (v${newVersion})`);
        get().auditContradictions();
      },

      combinePositioningWorlds: (
        title: string,
        archetype: PositioningWorld['archetype'],
        valueProp: string,
        sacrifice: string
      ) => {
        const id = `world-custom-${Date.now()}`;
        const newWorld: PositioningWorld = {
          id,
          title,
          archetype,
          targetAudience: 'Founder-customized audience niche',
          problemFraming: 'Custom synthesized problem framing',
          valueProposition: valueProp,
          differentiator: 'Custom hybrid strategic differentiator',
          categoryFraming: 'Custom Positioning Category',
          emotionalTerritory: 'Authentic founder conviction',
          proofMechanism: 'Custom metric verification',
          supportingEvidenceIds: [],
          assumptions: ['Custom hybrid assumptions confirmed by founder.'],
          risks: ['Hybrid approach must vigilantly avoid losing sharpness.'],
          tradeoffs: {
            whatWeEmphasize: 'Hybrid synthesis of key priorities',
            whatWeSacrifice: sacrifice,
          },
          challenges: [],
          status: 'custom_hybrid',
        };

        set((s) => ({
          project: {
            ...s.project,
            positioningWorlds: [...s.project.positioningWorlds, newWorld],
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));

        get().selectPositioningWorld(id, 'Founder synthesized custom hybrid positioning territory.');
      },

      rejectPositioningWorld: (worldId: string, reason: string) => {
        set((s) => ({
          project: {
            ...s.project,
            positioningWorlds: s.project.positioningWorlds.map((w) =>
              w.id === worldId ? { ...w, status: 'rejected' as const, rejectionReason: reason } : w
            ),
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));
      },

      auditContradictions: async () => {
        const { positioningWorlds, marketLandscape } = get().project;
        const alerts = positioningWorlds.flatMap((w) =>
          ContradictionDetector.auditPositioningWorld(w, marketLandscape?.evidenceRecords || [])
        );
        set((s) => ({
          project: {
            ...s.project,
            contradictions: alerts,
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));

        const selectedWorld = positioningWorlds.find((w) => w.id === get().project.selectedWorldId);
        if (selectedWorld) {
          try {
            const res = await fetch('/api/strategy', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'audit_contradictions',
                world: selectedWorld,
                evidenceRecords: marketLandscape?.evidenceRecords || [],
              }),
            });
            const json = await res.json();
            if (res.ok && json.success && Array.isArray(json.data)) {
              set((s) => ({
                project: {
                  ...s.project,
                  contradictions: json.data,
                },
              }));
            }
          } catch {
            // Keep local alerts
          }
        }
      },

      generateCreativeIdentity: async () => {
        const { project } = get();
        const { selectedWorldId, positioningWorlds, ideaBrief, marketLandscape } = project;

        if (!selectedWorldId) {
          set({
            error: 'Please select and lock a Positioning World before generating creative identity.',
          });
          return false;
        }

        const selectedWorld = positioningWorlds.find((w) => w.id === selectedWorldId);
        if (!selectedWorld) {
          set({ error: 'Selected Positioning World not found.' });
          return false;
        }

        if (!ideaBrief) {
          set({ error: 'Idea Brief is required to generate creative identity.' });
          return false;
        }

        set({
          isLoading: true,
          loadingMessage: 'Synthesizing creative identity (naming, voice, visual system)...',
          error: null,
        });

        const signal = getAbortSignal('creative_identity');

        try {
          let identityData: CreativeIdentity;
          try {
            const res = await fetch('/api/identity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'generate_identity',
                world: selectedWorld,
                brief: ideaBrief,
                evidenceRecords: marketLandscape?.evidenceRecords || [],
              }),
              signal,
            });

            const json = await res.json();
            if (res.ok && json.success) {
              identityData = json.data;
            } else {
              throw new Error(json.error || 'Failed to generate creative identity.');
            }
          } catch (fetchErr) {
            if (isAbortError(fetchErr)) return false;
            // Direct service fallback (e.g. offline, test environment, or API route unreachable)
            identityData = await IdentityService.generateIdentity(
              selectedWorld,
              ideaBrief,
              marketLandscape?.evidenceRecords || []
            );
          }

          clearAbortSignal('creative_identity');

          set((s) => ({
            isLoading: false,
            loadingMessage: '',
            project: {
              ...s.project,
              stage: 'identity',
              creativeIdentity: identityData,
              metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
            },
          }));

          return true;
        } catch (err: unknown) {
          clearAbortSignal('creative_identity');
          if (isAbortError(err)) {
            return false;
          }
          set({
            isLoading: false,
            loadingMessage: '',
            error: err instanceof Error ? err.message : 'Identity generation failed.',
          });
          return false;
        }
      },

      selectName: (candidateId: string) => {
        const { project } = get();
        if (!project.creativeIdentity) return;

        const candidate = project.creativeIdentity.namingCandidates.find((c) => c.id === candidateId);
        if (!candidate) return;

        set((s) => ({
          project: {
            ...s.project,
            creativeIdentity: s.project.creativeIdentity
              ? {
                  ...s.project.creativeIdentity,
                  selectedNameId: candidateId,
                  namingCandidates: s.project.creativeIdentity.namingCandidates.map((c) =>
                    c.id === candidateId
                      ? { ...c, status: 'selected' as const }
                      : c.status === 'selected'
                      ? { ...c, status: 'candidate' as const }
                      : c
                  ),
                }
              : null,
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));

        get().auditIdentityConsistency();
      },

      rejectName: (candidateId: string, reason: string) => {
        set((s) => ({
          project: {
            ...s.project,
            creativeIdentity: s.project.creativeIdentity
              ? {
                  ...s.project.creativeIdentity,
                  namingCandidates: s.project.creativeIdentity.namingCandidates.map((c) =>
                    c.id === candidateId
                      ? { ...c, status: 'rejected' as const, rejectionReason: reason }
                      : c
                  ),
                }
              : null,
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));
      },

      selectTagline: (taglineId: string) => {
        const { project } = get();
        if (!project.creativeIdentity) return;

        set((s) => ({
          project: {
            ...s.project,
            creativeIdentity: s.project.creativeIdentity
              ? {
                  ...s.project.creativeIdentity,
                  selectedTaglineId: taglineId,
                  taglineCandidates: s.project.creativeIdentity.taglineCandidates.map((t) =>
                    t.id === taglineId
                      ? { ...t, status: 'selected' as const }
                      : t.status === 'selected'
                      ? { ...t, status: 'candidate' as const }
                      : t
                  ),
                }
              : null,
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));

        get().auditIdentityConsistency();
      },

      updateVoiceTonalSlider: (slider: keyof VoiceSystem['tonalSliders'], value: number) => {
        set((s) => ({
          project: {
            ...s.project,
            creativeIdentity: s.project.creativeIdentity
              ? {
                  ...s.project.creativeIdentity,
                  voiceSystem: {
                    ...s.project.creativeIdentity.voiceSystem,
                    tonalSliders: {
                      ...s.project.creativeIdentity.voiceSystem.tonalSliders,
                      [slider]: value,
                    },
                  },
                }
              : null,
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));

        get().auditIdentityConsistency();
      },

      updateVisualPaletteColor: (role: 'primary' | 'secondary' | 'accent', hex: string) => {
        set((s) => ({
          project: {
            ...s.project,
            creativeIdentity: s.project.creativeIdentity
              ? {
                  ...s.project.creativeIdentity,
                  visualSystem: {
                    ...s.project.creativeIdentity.visualSystem,
                    palette: {
                      ...s.project.creativeIdentity.visualSystem.palette,
                      [role]: {
                        ...s.project.creativeIdentity.visualSystem.palette[role],
                        hex,
                      },
                    },
                  },
                }
              : null,
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));
      },

      generateVisualAsset: async (assetType: GeneratedVisualAsset['assetType'] = 'brand_mark') => {
        const { project } = get();
        if (!project.creativeIdentity || !project.selectedWorldId) return false;

        const selectedWorld = project.positioningWorlds.find((w) => w.id === project.selectedWorldId);
        const selectedName =
          project.creativeIdentity.namingCandidates.find(
            (c) => c.id === project.creativeIdentity?.selectedNameId
          )?.name || 'Kintra';
        const selectedTagline =
          project.creativeIdentity.taglineCandidates.find(
            (t) => t.id === project.creativeIdentity?.selectedTaglineId
          )?.tagline || '';

        try {
          let asset: GeneratedVisualAsset | null = null;
          try {
            const res = await fetch('/api/identity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'generate_visual',
                promptContext: {
                  positioningArchetype: selectedWorld?.archetype || 'The Engineering Purist',
                  brandName: selectedName,
                  tagline: selectedTagline,
                  primaryHex: project.creativeIdentity.visualSystem.palette.primary.hex,
                  secondaryHex: project.creativeIdentity.visualSystem.palette.secondary.hex,
                  accentHex: project.creativeIdentity.visualSystem.palette.accent.hex,
                  visualMetaphors: project.creativeIdentity.visualSystem.visualMetaphors,
                  audience: selectedWorld?.targetAudience || 'Engineers',
                  borderRadius: project.creativeIdentity.visualSystem.shapes.borderRadius,
                  assetType,
                },
              }),
            });

            const json = await res.json();
            if (res.ok && json.success && json.data.asset) {
              asset = json.data.asset;
            }
          } catch {
            const provider = new DefaultImageGenerationProvider();
            const result = await provider.generateVisual({
              positioningArchetype: selectedWorld?.archetype || 'The Engineering Purist',
              brandName: selectedName,
              tagline: selectedTagline,
              primaryHex: project.creativeIdentity.visualSystem.palette.primary.hex,
              secondaryHex: project.creativeIdentity.visualSystem.palette.secondary.hex,
              accentHex: project.creativeIdentity.visualSystem.palette.accent.hex,
              visualMetaphors: project.creativeIdentity.visualSystem.visualMetaphors,
              audience: selectedWorld?.targetAudience || 'Engineers',
              borderRadius: project.creativeIdentity.visualSystem.shapes.borderRadius,
              assetType,
            });
            if (result.success && result.asset) {
              asset = result.asset;
            }
          }

          if (asset) {
            set((s) => ({
              project: {
                ...s.project,
                creativeIdentity: s.project.creativeIdentity
                  ? {
                      ...s.project.creativeIdentity,
                      generatedVisuals: [asset!, ...s.project.creativeIdentity.generatedVisuals],
                    }
                  : null,
              },
            }));
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      approveCreativeIdentity: (rationale = 'Founder approved creative identity baseline.') => {
        const { project } = get();
        if (!project.creativeIdentity) return;

        const selectedName =
          project.creativeIdentity.namingCandidates.find(
            (c) => c.id === project.creativeIdentity?.selectedNameId
          )?.name || 'Kintra';
        const selectedTagline =
          project.creativeIdentity.taglineCandidates.find(
            (t) => t.id === project.creativeIdentity?.selectedTaglineId
          )?.tagline || '';

        const nameDecisionId = `decision-name-${Date.now()}`;
        const taglineDecisionId = `decision-tagline-${Date.now()}`;
        const worldDecisionId =
          Object.keys(project.decisionGraph?.nodes || {}).find(
            (k) => project.decisionGraph.nodes[k].category === 'positioning_world'
          ) || 'brief-baseline';

        const nameNode: DecisionNode = {
          id: nameDecisionId,
          category: 'brand_name',
          title: `Brand Name: ${selectedName}`,
          approvedValue: selectedName,
          rationale: `Selected brand name from territory. ${rationale}`,
          evidenceIds: [],
          rejectedAlternatives: project.creativeIdentity.namingCandidates
            .filter((c) => c.id !== project.creativeIdentity?.selectedNameId)
            .map((c) => ({
              id: c.id,
              title: c.name,
              whyRejected: c.rejectionReason || 'Rejected in favor of selected brand name.',
            })),
          tradeoff: 'Selected specific phonetic brand architecture.',
          dependsOn: [worldDecisionId],
          governs: ['voice_sliders', 'visual_system'],
          status: 'approved',
          approvedAt: new Date().toISOString(),
          version: project.metadata.version + 1,
        };

        const taglineNode: DecisionNode = {
          id: taglineDecisionId,
          category: 'tagline',
          title: `Brand Tagline: "${selectedTagline}"`,
          approvedValue: selectedTagline,
          rationale: `Selected tagline communicating core differentiator.`,
          evidenceIds: [],
          rejectedAlternatives: project.creativeIdentity.taglineCandidates
            .filter((t) => t.id !== project.creativeIdentity?.selectedTaglineId)
            .map((t) => ({
              id: t.id,
              title: t.tagline,
              whyRejected: t.rejectionReason || 'Alternative tagline rejected.',
            })),
          tradeoff: 'Sacrifices generic feature listing for sharp positioning.',
          dependsOn: [worldDecisionId],
          governs: ['hero_headline'],
          status: 'approved',
          approvedAt: new Date().toISOString(),
          version: project.metadata.version + 1,
        };

        const newEdges: DecisionEdge[] = [
          {
            id: `edge-world-name-${Date.now()}`,
            source: worldDecisionId,
            target: nameDecisionId,
            relation: 'governs',
          },
          {
            id: `edge-world-tagline-${Date.now()}`,
            source: worldDecisionId,
            target: taglineDecisionId,
            relation: 'governs',
          },
        ];

        set((s) => ({
          project: {
            ...s.project,
            stage: 'identity_locked',
            creativeIdentity: s.project.creativeIdentity
              ? {
                  ...s.project.creativeIdentity,
                  status: 'approved',
                  approvedAt: new Date().toISOString(),
                }
              : null,
            decisionGraph: {
              nodes: {
                ...s.project.decisionGraph.nodes,
                [nameDecisionId]: nameNode,
                [taglineDecisionId]: taglineNode,
              },
              edges: [...s.project.decisionGraph.edges, ...newEdges],
            },
            decisions: {
              ...s.project.decisions,
              [nameDecisionId]: {
                id: nameDecisionId,
                category: 'name',
                title: nameNode.title,
                value: nameNode.approvedValue,
                rationale: nameNode.rationale,
                approvedAt: new Date().toISOString(),
                approvedBy: 'founder',
                version: project.metadata.version + 1,
              },
              [taglineDecisionId]: {
                id: taglineDecisionId,
                category: 'positioning',
                title: taglineNode.title,
                value: taglineNode.approvedValue,
                rationale: taglineNode.rationale,
                approvedAt: new Date().toISOString(),
                approvedBy: 'founder',
                version: project.metadata.version + 1,
              },
            },
            metadata: {
              ...s.project.metadata,
              updatedAt: new Date().toISOString(),
            },
          },
        }));

        get().createSnapshot(`Approved Creative Identity: ${selectedName}`);
      },

      auditIdentityConsistency: async () => {
        const { project } = get();
        if (!project.creativeIdentity) return;

        const selectedName = project.creativeIdentity.namingCandidates.find(
          (c) => c.id === project.creativeIdentity?.selectedNameId
        );
        const selectedTagline = project.creativeIdentity.taglineCandidates.find(
          (t) => t.id === project.creativeIdentity?.selectedTaglineId
        );
        const selectedWorld = project.positioningWorlds.find((w) => w.id === project.selectedWorldId);

        const conflicts = IdentityConsistencyChecker.auditConsistency({
          selectedName,
          selectedTagline,
          voiceSystem: project.creativeIdentity.voiceSystem,
          visualSystem: project.creativeIdentity.visualSystem,
          positioningWorld: selectedWorld,
        });

        set((s) => ({
          project: {
            ...s.project,
            creativeIdentity: s.project.creativeIdentity
              ? {
                  ...s.project.creativeIdentity,
                  consistencyConflicts: conflicts,
                }
              : null,
          },
        }));

        try {
          const res = await fetch('/api/identity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'audit_consistency',
              selectedName,
              selectedTagline,
              voiceSystem: project.creativeIdentity.voiceSystem,
              visualSystem: project.creativeIdentity.visualSystem,
              positioningWorld: selectedWorld,
            }),
          });
          const json = await res.json();
          if (res.ok && json.success && Array.isArray(json.data)) {
            set((s) => ({
              project: {
                ...s.project,
                creativeIdentity: s.project.creativeIdentity
                  ? {
                      ...s.project.creativeIdentity,
                      consistencyConflicts: json.data,
                    }
                  : null,
              },
            }));
          }
        } catch {
          // Keep local conflicts
        }
      },

      generateArtifact: async (artifactType: GuardianArtifactType) => {
        const { project } = get();
        set({
          isLoading: true,
          loadingMessage: `Generating and validating on-brand ${artifactType}...`,
          error: null,
        });

        try {
          let artifact: BrandArtifact;
          try {
            const res = await fetch('/api/guardian', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'generate_artifact', artifactType, brandState: project }),
            });
            const json = await res.json();
            if (res.ok && json.success && json.data.artifact) {
              artifact = json.data.artifact;
            } else {
              throw new Error(json.error || 'Failed to generate artifact via API.');
            }
          } catch {
            // Fallback to local ConsistencyGuardian
            artifact = ConsistencyGuardian.generateDefaultArtifact(artifactType, project);
            const report = ConsistencyGuardian.evaluateArtifact(artifact, project);
            artifact.validationReport = report;
          }

          const existingArtifacts = project.brandArtifacts || [];
          const updatedArtifacts = [artifact, ...existingArtifacts.filter((a) => a.id !== artifact.id)];

          set((s) => ({
            isLoading: false,
            loadingMessage: '',
            project: {
              ...s.project,
              stage: s.project.stage === 'identity_locked' ? 'guardian' : s.project.stage,
              brandArtifacts: updatedArtifacts,
              selectedArtifactId: artifact.id,
              metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
            },
          }));

          return true;
        } catch (err: unknown) {
          set({
            isLoading: false,
            loadingMessage: '',
            error: err instanceof Error ? err.message : 'Artifact generation failed.',
          });
          return false;
        }
      },

      createCustomArtifact: (name, artifactType, content, visualSpec) => {
        const { project } = get();
        const now = new Date().toISOString();
        const newArtifact: BrandArtifact = {
          id: `art-${artifactType}-${Date.now()}`,
          name,
          artifactType,
          content,
          targetAudience: project.positioningWorlds.find((w) => w.id === project.selectedWorldId)?.targetAudience,
          visualSpec,
          versionHistory: [
            {
              version: 1,
              content,
              editedAt: now,
              editedBy: 'user',
              editReason: 'Custom artifact created',
            },
          ],
          status: 'draft',
          isApproved: false,
          isLocked: false,
          createdAt: now,
          updatedAt: now,
        };

        const report = ConsistencyGuardian.evaluateArtifact(newArtifact, project);
        newArtifact.validationReport = report;

        const existing = project.brandArtifacts || [];
        set((s) => ({
          project: {
            ...s.project,
            stage: s.project.stage === 'identity_locked' ? 'guardian' : s.project.stage,
            brandArtifacts: [newArtifact, ...existing],
            selectedArtifactId: newArtifact.id,
            metadata: { ...s.project.metadata, updatedAt: now },
          },
        }));
      },

      selectArtifact: (artifactId: string) => {
        set((s) => ({
          project: {
            ...s.project,
            selectedArtifactId: artifactId,
          },
        }));
      },

      validateArtifact: async (artifactId: string) => {
        const { project } = get();
        const artifact = (project.brandArtifacts || []).find((a) => a.id === artifactId);
        if (!artifact) return false;

        set({ isLoading: true, loadingMessage: 'Auditing artifact across 9 validation dimensions...', error: null });

        try {
          let report: ArtifactValidationReport;
          try {
            const res = await fetch('/api/guardian', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'validate_artifact', artifact, brandState: project }),
            });
            const json = await res.json();
            if (res.ok && json.success && json.data) {
              report = json.data;
            } else {
              throw new Error(json.error || 'Failed to validate artifact via API.');
            }
          } catch {
            report = ConsistencyGuardian.evaluateArtifact(artifact, project);
          }

          set((s) => ({
            isLoading: false,
            loadingMessage: '',
            project: {
              ...s.project,
              brandArtifacts: (s.project.brandArtifacts || []).map((a) =>
                a.id === artifactId ? { ...a, validationReport: report, updatedAt: new Date().toISOString() } : a
              ),
            },
          }));

          return true;
        } catch (err: unknown) {
          set({
            isLoading: false,
            loadingMessage: '',
            error: err instanceof Error ? err.message : 'Validation failed.',
          });
          return false;
        }
      },

      acceptRepair: async (artifactId: string, findingId: string) => {
        const { project } = get();
        const artifact = (project.brandArtifacts || []).find((a) => a.id === artifactId);
        if (!artifact) return false;

        if (artifact.isLocked) {
          set({ error: `Artifact "${artifact.name}" is locked. Unlock it first to accept repairs.` });
          return false;
        }

        set({ isLoading: true, loadingMessage: 'Applying suggested repair non-destructively...', error: null });

        try {
          let repaired: BrandArtifact;
          try {
            const res = await fetch('/api/guardian', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'apply_repair', artifact, findingId }),
            });
            const json = await res.json();
            if (res.ok && json.success && json.data) {
              repaired = json.data;
            } else {
              throw new Error(json.error || 'Failed to apply repair via API.');
            }
          } catch {
            repaired = ConsistencyGuardian.applyRepair(artifact, findingId);
          }

          // Re-evaluate repaired artifact against brand state
          const newReport = ConsistencyGuardian.evaluateArtifact(repaired, project);
          repaired.validationReport = newReport;

          set((s) => ({
            isLoading: false,
            loadingMessage: '',
            project: {
              ...s.project,
              brandArtifacts: (s.project.brandArtifacts || []).map((a) => (a.id === artifactId ? repaired : a)),
              metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
            },
          }));

          return true;
        } catch (err: unknown) {
          set({
            isLoading: false,
            loadingMessage: '',
            error: err instanceof Error ? err.message : 'Repair failed.',
          });
          return false;
        }
      },

      manuallyEditArtifact: (artifactId: string, newContent: string, reason = 'Manual edit by founder') => {
        const { project } = get();
        const artifact = (project.brandArtifacts || []).find((a) => a.id === artifactId);
        if (!artifact) return;

        if (artifact.isLocked) {
          set({ error: `Artifact "${artifact.name}" is locked and cannot be edited silently.` });
          return;
        }

        const now = new Date().toISOString();
        const updatedHistory = [
          ...artifact.versionHistory,
          {
            version: artifact.versionHistory.length + 1,
            content: newContent,
            editedAt: now,
            editReason: reason,
            editedBy: 'user' as const,
          },
        ];

        const updatedArtifact: BrandArtifact = {
          ...artifact,
          content: newContent,
          versionHistory: updatedHistory,
          status: 'under_review',
          isApproved: false,
          updatedAt: now,
        };

        const report = ConsistencyGuardian.evaluateArtifact(updatedArtifact, project);
        updatedArtifact.validationReport = report;

        set((s) => ({
          project: {
            ...s.project,
            brandArtifacts: (s.project.brandArtifacts || []).map((a) => (a.id === artifactId ? updatedArtifact : a)),
            metadata: { ...s.project.metadata, updatedAt: now },
          },
        }));
      },

      regenerateArtifact: async (artifactId: string) => {
        const { project } = get();
        const artifact = (project.brandArtifacts || []).find((a) => a.id === artifactId);
        if (!artifact) return false;

        if (artifact.isLocked) {
          set({ error: `Artifact "${artifact.name}" is locked. Unlock to regenerate.` });
          return false;
        }

        const fresh = ConsistencyGuardian.generateDefaultArtifact(artifact.artifactType, project);
        const now = new Date().toISOString();

        const updatedHistory = [
          ...artifact.versionHistory,
          {
            version: artifact.versionHistory.length + 1,
            content: fresh.content,
            editedAt: now,
            editReason: 'Regenerated from current brand state',
            editedBy: 'regeneration' as const,
          },
        ];

        const updatedArtifact: BrandArtifact = {
          ...artifact,
          content: fresh.content,
          versionHistory: updatedHistory,
          status: 'under_review',
          isApproved: false,
          updatedAt: now,
        };

        const report = ConsistencyGuardian.evaluateArtifact(updatedArtifact, project);
        updatedArtifact.validationReport = report;

        set((s) => ({
          project: {
            ...s.project,
            brandArtifacts: (s.project.brandArtifacts || []).map((a) => (a.id === artifactId ? updatedArtifact : a)),
            metadata: { ...s.project.metadata, updatedAt: now },
          },
        }));

        return true;
      },

      ignoreFinding: (artifactId: string, findingId: string, reason: string) => {
        set((s) => {
          const artifacts = s.project.brandArtifacts || [];
          const updated = artifacts.map((art) => {
            if (art.id !== artifactId || !art.validationReport) return art;

            const updatedFindings = art.validationReport.findings.map((f) =>
              f.id === findingId ? { ...f, status: 'ignored' as const, ignoredReason: reason } : f
            );

            const activeBlocking = updatedFindings.filter(
              (f) => f.severity === 'blocking' && f.status !== 'ignored'
            ).length;
            const activeHigh = updatedFindings.filter(
              (f) => f.severity === 'high' && f.status !== 'ignored'
            ).length;

            return {
              ...art,
              validationReport: {
                ...art.validationReport,
                findings: updatedFindings,
                passed: activeBlocking === 0 && activeHigh === 0,
                blockingFindingsCount: activeBlocking,
              },
              updatedAt: new Date().toISOString(),
            };
          });

          return {
            project: {
              ...s.project,
              brandArtifacts: updated,
              metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
            },
          };
        });
      },

      lockApprovedArtifact: (artifactId: string, rationale = 'Approved by founder as canonical brand asset.') => {
        const { project } = get();
        const artifact = (project.brandArtifacts || []).find((a) => a.id === artifactId);
        if (!artifact) return;

        const now = new Date().toISOString();
        const newVersion = project.metadata.version + 1;
        const decisionId = `decision-artifact-${Date.now()}`;

        const decisionNode: DecisionNode = {
          id: decisionId,
          category: 'value_proposition',
          title: `Canonical Artifact: ${artifact.name}`,
          approvedValue: artifact.content,
          rationale: `${rationale} (Artifact Type: ${artifact.artifactType})`,
          evidenceIds: [],
          rejectedAlternatives: artifact.versionHistory.slice(0, -1).map((v) => ({
            id: `v-${v.version}`,
            title: `Draft v${v.version}`,
            whyRejected: v.editReason || 'Superseded by approved canonical version',
          })),
          tradeoff: 'Locked canonical copy format across marketing channels.',
          dependsOn: Object.keys(project.decisionGraph?.nodes || {}).slice(0, 2),
          governs: ['external_publishing'],
          status: 'approved',
          approvedAt: now,
          version: newVersion,
        };

        const updatedArtifacts = (project.brandArtifacts || []).map((a) =>
          a.id === artifactId
            ? {
                ...a,
                isApproved: true,
                isLocked: true,
                status: 'locked' as const,
                approvedAt: now,
                lockedAt: now,
                updatedAt: now,
              }
            : a
        );

        set((s) => ({
          project: {
            ...s.project,
            stage: 'guardian_locked',
            brandArtifacts: updatedArtifacts,
            decisionGraph: {
              nodes: {
                ...s.project.decisionGraph.nodes,
                [decisionId]: decisionNode,
              },
              edges: s.project.decisionGraph.edges,
            },
            decisions: {
              ...s.project.decisions,
              [decisionId]: {
                id: decisionId,
                category: 'voice',
                title: decisionNode.title,
                value: decisionNode.approvedValue,
                rationale: decisionNode.rationale,
                approvedAt: now,
                approvedBy: 'founder',
                version: newVersion,
              },
            },
            metadata: {
              ...s.project.metadata,
              updatedAt: now,
            },
          },
        }));

        get().createSnapshot(`Locked Canonical Artifact: ${artifact.name}`);
      },

      unlockArtifact: (artifactId: string) => {
        set((s) => ({
          project: {
            ...s.project,
            brandArtifacts: (s.project.brandArtifacts || []).map((a) =>
              a.id === artifactId ? { ...a, isLocked: false, status: 'under_review' as const } : a
            ),
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));
      },

      updateFact: (factId: string, statement: string, verified: boolean) => {
        set((s) => ({
          project: {
            ...s.project,
            extractedFacts: s.project.extractedFacts.map((f) =>
              f.id === factId
                ? { ...f, statement, verifiedByUser: verified, source: 'user_edited' as const }
                : f
            ),
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));
      },

      deleteFact: (factId: string) => {
        set((s) => ({
          project: {
            ...s.project,
            extractedFacts: s.project.extractedFacts.filter((f) => f.id !== factId),
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));
      },

      addFact: (statement: string) => {
        const newFact: ExtractedFact = {
          id: `fact-${Date.now()}`,
          statement,
          source: 'founder_input',
          confidence: 1.0,
          verifiedByUser: true,
          createdAt: new Date().toISOString(),
        };

        set((s) => ({
          project: {
            ...s.project,
            extractedFacts: [...s.project.extractedFacts, newFact],
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));
      },

      updateHypothesis: (hypId: string, claim: string, riskLevel: Hypothesis['riskLevel']) => {
        set((s) => ({
          project: {
            ...s.project,
            hypotheses: s.project.hypotheses.map((h) =>
              h.id === hypId ? { ...h, claim, riskLevel, status: 'refined' as const } : h
            ),
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));
      },

      updateIdeaBriefField: <K extends keyof IdeaBrief>(field: K, value: IdeaBrief[K]) => {
        const brief = get().project.ideaBrief;
        if (!brief) return;

        set((s) => ({
          project: {
            ...s.project,
            ideaBrief: {
              ...brief,
              [field]: value,
            },
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));
      },

      approveIdeaBrief: (rationale = 'Founder approved strategic brief baseline.') => {
        const brief = get().project.ideaBrief;
        if (!brief) return;

        const decisionId = `decision-brief-${Date.now()}`;
        const newDecision: ApprovedDecision = {
          id: decisionId,
          category: 'problem_framing',
          title: 'Core Problem & Value Baseline',
          value: brief.problem.corePain,
          rationale,
          approvedAt: new Date().toISOString(),
          approvedBy: 'founder',
          version: brief.version,
        };

        const briefBaselineNode: DecisionNode = {
          id: 'brief-baseline',
          category: 'problem_framing',
          title: 'Strategic Brief Baseline',
          approvedValue: brief.problem.corePain,
          rationale,
          evidenceIds: [],
          rejectedAlternatives: [],
          tradeoff: 'Established baseline constraints from approved Idea Brief',
          dependsOn: [],
          governs: ['positioning_world', 'target_niche'],
          status: 'approved',
          approvedAt: new Date().toISOString(),
          version: brief.version,
        };

        set((s) => ({
          project: {
            ...s.project,
            stage: 'strategy_locked',
            ideaBrief: {
              ...brief,
              status: 'approved',
              approvedAt: new Date().toISOString(),
            },
            decisions: {
              ...s.project.decisions,
              [decisionId]: newDecision,
            },
            decisionGraph: {
              nodes: {
                ...(s.project.decisionGraph?.nodes || {}),
                'brief-baseline': briefBaselineNode,
              },
              edges: s.project.decisionGraph?.edges || [],
            },
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));

        // Take automatic snapshot of approved baseline
        get().createSnapshot('Approved Strategic Idea Brief Baseline');
      },

      rejectIdeaBrief: (reason: string) => {
        const brief = get().project.ideaBrief;
        if (!brief) return;

        set((s) => ({
          project: {
            ...s.project,
            ideaBrief: {
              ...brief,
              status: 'rejected',
              rejectionReason: reason,
            },
            metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
          },
        }));
      },

      regenerateIdeaBrief: async () => {
        return get().synthesizeBrief();
      },

      // Scenario Lab Actions (Prompt 10)
      runScenarioTest: async (scenarioType: ScenarioTemplateType) => {
        get().setLoading(true, `Simulating realistic ${scenarioType} scenario...`);
        try {
          let scenario: ScenarioArtifact;
          try {
            const res = await fetch('/api/evolution', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'generate_scenario',
                scenarioType,
                brandState: get().project,
              }),
            });
            const json = await res.json();
            if (res.ok && json.success && json.data) {
              scenario = json.data;
            } else {
              throw new Error(json.error || 'Failed to generate scenario via API');
            }
          } catch {
            scenario = ScenarioLabEngine.generateScenario(scenarioType, get().project);
          }

          set((s) => {
            const currentScenarios = s.scenarioArtifacts.filter((sc) => sc.scenarioType !== scenarioType);
            const updated = [scenario, ...currentScenarios];
            return {
              scenarioArtifacts: updated,
              selectedScenarioId: scenario.id,
              project: {
                ...s.project,
                scenarioArtifacts: updated,
                selectedScenarioId: scenario.id,
                stage: 'scenario_lab',
                metadata: { ...s.project.metadata, updatedAt: new Date().toISOString() },
              },
            };
          });
          return true;
        } catch (err) {
          get().setError(err instanceof Error ? err.message : 'Failed to run scenario');
          return false;
        } finally {
          get().setLoading(false);
        }
      },

      selectScenario: (scenarioId: string) => {
        set((s) => ({
          selectedScenarioId: scenarioId,
          project: {
            ...s.project,
            selectedScenarioId: scenarioId,
          },
        }));
      },

      repairScenario: (scenarioId: string, findingId: string) => {
        const scenario = get().scenarioArtifacts.find((s) => s.id === scenarioId);
        if (!scenario) return;

        const repaired = ScenarioLabEngine.applyRepairToScenario(scenario, findingId, get().project);
        set((s) => {
          const updated = s.scenarioArtifacts.map((sc) => (sc.id === scenarioId ? repaired : sc));
          return {
            scenarioArtifacts: updated,
            project: {
              ...s.project,
              scenarioArtifacts: updated,
            },
          };
        });
      },

      manuallyEditScenario: (scenarioId: string, newContent: string) => {
        const scenario = get().scenarioArtifacts.find((s) => s.id === scenarioId);
        if (!scenario) return;

        const updatedScenario = ScenarioLabEngine.manuallyEditScenario(scenario, newContent, get().project);
        set((s) => {
          const updated = s.scenarioArtifacts.map((sc) => (sc.id === scenarioId ? updatedScenario : sc));
          return {
            scenarioArtifacts: updated,
            project: {
              ...s.project,
              scenarioArtifacts: updated,
            },
          };
        });
      },

      // Assumption Evolution Engine Actions
      proposeAssumptionChange: (category: AssumptionCategory, proposedValue: string, rationale: string) => {
        const currentWorld = get().project.positioningWorlds.find((w) => w.id === get().project.selectedWorldId);
        const identity = get().project.creativeIdentity;
        const selectedTagline = identity?.taglineCandidates.find((t) => t.id === identity.selectedTaglineId)?.tagline;
        let currentValue = '';
        if (category === 'target_audience') {
          currentValue = currentWorld?.targetAudience || get().project.ideaBrief?.targetUser.primaryNiche || 'Target Customer';
        } else if (category === 'pricing_tier') {
          currentValue = 'Mid-Market / Premium Tier';
        } else if (category === 'emotional_territory') {
          currentValue = currentWorld?.emotionalTerritory || selectedTagline || 'Core Brand Purpose';
        } else if (category === 'primary_problem') {
          currentValue = currentWorld?.problemFraming || get().project.ideaBrief?.problem.corePain || 'Primary Customer Pain';
        } else {
          currentValue = currentWorld?.categoryFraming || get().project.ideaBrief?.context.industryOrCategory || 'Category Context';
        }

        const request: AssumptionChangeRequest = {
          id: `req-${category}-${Date.now()}`,
          category,
          title: `Evolve ${category.replace(/_/g, ' ')}`,
          currentValue,
          proposedValue,
          rationale,
          requestedAt: new Date().toISOString(),
        };

        const impact = BrandEvolutionEngine.analyzeAssumptionImpact(request, get().project);
        set({
          activeChangeRequest: request,
          impactReport: impact,
        });

        if (typeof window !== 'undefined') {
          fetch('/api/evolution', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'analyze_impact',
              changeRequest: request,
              brandState: get().project,
            }),
          })
            .then((res) => res.json())
            .then((json) => {
              if (json?.success && json?.data) {
                set({ impactReport: json.data });
              }
            })
            .catch(() => {});
        }
      },

      clearProposedAssumption: () => {
        set({
          activeChangeRequest: null,
          impactReport: null,
        });
      },

      approveEvolution: (choice: EvolutionApprovalChoice, branchName?: string) => {
        const request = get().activeChangeRequest;
        if (!request) return;

        if (choice === 'keep_old_decision') {
          set({
            activeChangeRequest: null,
            impactReport: null,
          });
          return;
        }

        const baselineProject = get().project;
        const result = BrandEvolutionEngine.applyEvolution(request, baselineProject, choice, branchName);

        // Apply update or branch
        set((s) => {
          const newBranches = result.newBranch ? [...s.branches, result.newBranch] : s.branches;
          return {
            project: {
              ...result.updatedState,
              stage: 'evolution',
              branches: newBranches,
            },
            branches: newBranches,
            activeBranchId: result.newBranch ? result.newBranch.id : s.activeBranchId,
            activeChangeRequest: null,
            impactReport: null,
          };
        });

        // Create automatic version snapshot
        get().createSnapshot(`Evolved Brand: ${request.title} (${request.proposedValue})`);

        if (typeof window !== 'undefined') {
          fetch('/api/evolution', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'apply_evolution',
              changeRequest: request,
              brandState: baselineProject,
              choice,
              branchName,
            }),
          }).catch((err) => {
            logger.warn('Backend evolution sync encountered an error, local state preserved:', {
              error: err instanceof Error ? err.message : String(err),
            });
          });
        }
      },

      // Branching Actions
      createBranch: (name: string, description = '') => {
        const currentProject = get().project;
        const newBranch: BrandBranch = {
          id: `branch-${Date.now()}`,
          name,
          description: description || `Branch created from v${currentProject.metadata.version}`,
          parentBranchId: get().activeBranchId || 'main',
          createdAt: new Date().toISOString(),
          snapshot: {
            id: `snap-branch-${Date.now()}`,
            version: currentProject.metadata.version,
            label: `Branch snapshot: ${name}`,
            timestamp: new Date().toISOString(),
            state: JSON.parse(JSON.stringify(currentProject)),
          },
        };

        set((s) => {
          const updated = [...s.branches, newBranch].slice(-5); // cap branches to 5 to protect memory & quota
          return {
            branches: updated,
            activeBranchId: newBranch.id,
            project: {
              ...s.project,
              branches: updated,
            },
          };
        });
      },

      switchBranch: (branchId: string) => {
        const targetBranch = get().branches.find((b) => b.id === branchId);
        if (!targetBranch) return false;

        // Snapshot current active state before switching
        get().createSnapshot(`Pre-switch state (switching to ${targetBranch.name})`);

        const restoredProject = JSON.parse(JSON.stringify(targetBranch.snapshot.state));
        set({
          project: restoredProject,
          activeBranchId: branchId,
          scenarioArtifacts: restoredProject.scenarioArtifacts || [],
          launchKit: (restoredProject.launchKit as LaunchKit | null) || null,
          selectedLaunchItemId: restoredProject.launchKit?.items?.[0]?.id || null,
        });
        return true;
      },

      compareBranches: (baseBranchId: string, targetBranchId: string) => {
        const base = get().branches.find((b) => b.id === baseBranchId);
        const target = get().branches.find((b) => b.id === targetBranchId);
        if (!base || !target) return null;

        return BrandEvolutionEngine.compareBranches(base, target);
      },

      generateLaunchKit: async () => {
        set({ isLoading: true, loadingMessage: 'Synthesizing Launch Kit & Brand Guidelines...', error: null });
        const signal = getAbortSignal('launch_kit');

        try {
          const state = get().project;
          let launchKit: LaunchKit;

          try {
            const res = await fetch('/api/launch-kit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'generate', state }),
              signal,
            });
            if (res.ok) {
              const data = await res.json();
              launchKit = data.launchKit;
            } else {
              launchKit = LaunchKitEngine.generateLaunchKit(state);
            }
          } catch (fetchErr) {
            if (isAbortError(fetchErr)) return false;
            launchKit = LaunchKitEngine.generateLaunchKit(state);
          }

          clearAbortSignal('launch_kit');

          set((s) => ({
            launchKit,
            selectedLaunchItemId: launchKit.items[0]?.id || null,
            project: {
              ...s.project,
              stage: 'launch_kit',
              launchKit,
            },
            isLoading: false,
            loadingMessage: '',
          }));
          return true;
        } catch (err: unknown) {
          clearAbortSignal('launch_kit');
          if (isAbortError(err)) {
            return false;
          }
          set({
            error: err instanceof Error ? err.message : 'Failed to generate Launch Kit',
            isLoading: false,
            loadingMessage: '',
          });
          return false;
        }
      },

      selectLaunchItem: (itemId: string | null) => {
        set({ selectedLaunchItemId: itemId });
      },

      exportLaunchKit: (format: 'markdown' | 'json') => {
        const kit = get().launchKit || (get().project.launchKit as LaunchKit | null);
        if (!kit) return '';
        const content =
          format === 'markdown'
            ? LaunchKitEngine.exportToMarkdown(kit)
            : LaunchKitEngine.exportToJson(kit);
        set({ exportContent: { format, content } });
        return content;
      },

      togglePresentationMode: (open?: boolean) => {
        set((s) => ({
          isPresentationModeOpen: open !== undefined ? open : !s.isPresentationModeOpen,
        }));
      },

      clearExport: () => set({ exportContent: null }),
    }),
    {
      name: 'kintra_brand_state_v1',
      storage: createJSONStorage(() => ({
        getItem: (name: string): string | null => {
          if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
            return null;
          }
          return window.localStorage.getItem(name);
        },
        setItem: (name: string, value: string): void => {
          if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
            return;
          }
          try {
            window.localStorage.setItem(name, value);
          } catch (storageErr) {
            console.warn('LocalStorage write failed or quota exceeded:', storageErr);
            // Multi-tier recovery: progressively prune snapshots, branches, and deep snapshots
            try {
              const parsed = JSON.parse(value);
              if (parsed?.state) {
                // Tier 1: Prune historical snapshots to 1 latest
                if (Array.isArray(parsed.state.snapshots) && parsed.state.snapshots.length > 1) {
                  parsed.state.snapshots = parsed.state.snapshots.slice(-1);
                }

                // Tier 2: Prune historical branches to active branch + 1 most recent
                if (Array.isArray(parsed.state.branches) && parsed.state.branches.length > 2) {
                  const activeId = parsed.state.activeBranchId;
                  const active = parsed.state.branches.find((b: { id?: string }) => b.id === activeId);
                  const others = parsed.state.branches.filter((b: { id?: string }) => b.id !== activeId).slice(-1);
                  parsed.state.branches = active ? [active, ...others] : parsed.state.branches.slice(-2);
                  if (parsed.state.project?.branches) {
                    parsed.state.project.branches = parsed.state.branches;
                  }
                }

                try {
                  window.localStorage.setItem(name, JSON.stringify(parsed));
                  return;
                } catch {
                  // Tier 3: Strip redundant history if still failing
                  parsed.state.snapshots = [];
                  if (Array.isArray(parsed.state.branches)) {
                    parsed.state.branches = parsed.state.branches.slice(-1);
                    if (parsed.state.project?.branches) {
                      parsed.state.project.branches = parsed.state.branches;
                    }
                  }
                  window.localStorage.setItem(name, JSON.stringify(parsed));
                }
              }
            } catch (recoveryErr) {
              console.warn('LocalStorage quota recovery fallback failed:', recoveryErr);
            }
          }
        },
        removeItem: (name: string): void => {
          if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
            return;
          }
          window.localStorage.removeItem(name);
        },
      })),
      partialize: (state) => ({
        project: state.project,
        snapshots: state.snapshots,
        scenarioArtifacts: state.scenarioArtifacts,
        branches: state.branches,
        activeBranchId: state.activeBranchId,
        launchKit: state.launchKit,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

