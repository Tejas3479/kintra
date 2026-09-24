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
import { CanonicalBrandStateSchema } from '@/lib/schemas/brand-schemas';
import { INITIAL_DEMO_PROJECT } from '@/fixtures/demo-brands';

interface BrandStoreState {
  // Active Project State
  project: CanonicalBrandState;
  // History & Snapshots
  snapshots: ProjectSnapshot[];
  // UI Loading & Errors
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;

  // Actions: Project Management
  createProject: (name: string, initialIdea?: string) => void;
  loadDemoProject: () => void;
  createSnapshot: (label: string) => void;
  rollbackToSnapshot: (snapshotId: string) => boolean;
  exportProjectJSON: () => string;
  importProjectJSON: (jsonString: string) => { success: boolean; error?: string };
  resetProject: () => void;

  // Actions: Discovery Flow
  setRawFounderInput: (input: string) => void;
  runIntakeAnalysis: (rawIdea: string) => Promise<boolean>;
  answerInterviewQuestion: (questionId: string, answer: string) => Promise<void>;
  skipInterviewQuestion: (questionId: string) => Promise<void>;
  generateNextQuestion: () => Promise<void>;
  synthesizeBrief: () => Promise<boolean>;

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
  ideaBrief: null,
  decisions: {},
  artifacts: [],
  validationHistory: [],
};

export const useBrandStore = create<BrandStoreState>()(
  persist(
    (set, get) => ({
      project: DEFAULT_EMPTY_PROJECT,
      snapshots: [],
      isLoading: false,
      loadingMessage: '',
      error: null,

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
          error: null,
        });
      },

      loadDemoProject: () => {
        set({
          project: INITIAL_DEMO_PROJECT,
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
          snapshots: [snapshot, ...s.snapshots].slice(0, 10), // keep last 10 snapshots
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

        set({
          project: JSON.parse(JSON.stringify(target.state)),
          error: null,
        });
        return true;
      },

      exportProjectJSON: () => {
        return JSON.stringify(get().project, null, 2);
      },

      importProjectJSON: (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString);
          const validated = CanonicalBrandStateSchema.parse(parsed);
          set({
            project: validated,
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
          error: null,
        }));
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

        try {
          const res = await fetch('/api/discovery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'intake', rawIdea }),
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

          return true;
        } catch (err: unknown) {
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

        try {
          const res = await fetch('/api/discovery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'next_question',
              rawIdea: rawFounderInput,
              history: interviewState.history,
            }),
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
        } catch {
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

          return true;
        } catch (err: unknown) {
          set({
            isLoading: false,
            loadingMessage: '',
            error: err instanceof Error ? err.message : 'Brief synthesis failed.',
          });
          return false;
        }
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
          window.localStorage.setItem(name, value);
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
      }),
    }
  )
);

