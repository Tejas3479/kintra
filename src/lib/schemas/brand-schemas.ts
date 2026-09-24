import { z } from 'zod';

export const EpistemicSourceSchema = z.enum([
  'founder_input',
  'ai_extracted',
  'ai_generated',
  'user_approved',
  'user_edited',
]);

export const AssumptionRiskLevelSchema = z.enum(['low', 'medium', 'critical']);

export const ExtractedFactSchema = z.object({
  id: z.string().min(1),
  statement: z.string().min(1),
  source: EpistemicSourceSchema,
  confidence: z.number().min(0).max(1),
  verifiedByUser: z.boolean(),
  createdAt: z.string(),
});

export const InterviewTopicSchema = z.enum([
  'idea',
  'problem',
  'audience',
  'context',
  'alternatives',
  'value',
  'constraints',
  'desired_perception',
  'founder_intent',
]);

export const InterviewQuestionSchema = z.object({
  id: z.string().min(1),
  topic: InterviewTopicSchema,
  question: z.string().min(10),
  whyAsking: z.string().min(10),
  suggestedAnswers: z.array(z.string()).optional(),
  answerType: z.enum(['text', 'choice', 'hybrid']),
  userAnswer: z.string().optional(),
  skipped: z.boolean().default(false),
  askedAt: z.string().optional(),
  answeredAt: z.string().optional(),
});

export const UnresolvedQuestionSchema = z.object({
  id: z.string().min(1),
  topic: InterviewTopicSchema,
  question: z.string().min(1),
  strategicImportance: z.enum(['essential', 'helpful', 'optional']),
  whyItMatters: z.string().min(1),
  answer: z.string().optional(),
  resolved: z.boolean().default(false),
});

export const HypothesisSchema = z.object({
  id: z.string().min(1),
  claim: z.string().min(1),
  riskLevel: AssumptionRiskLevelSchema,
  potentialConsequenceIfFalse: z.string().min(1),
  status: z.enum(['untested', 'confirmed', 'disproven', 'refined']),
  userNote: z.string().optional(),
});

export const IdeaBriefSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  problem: z.object({
    corePain: z.string().min(5),
    whoSuffers: z.string().min(3),
    triggerEvent: z.string().min(3),
  }),
  targetUser: z.object({
    primaryNiche: z.string().min(3),
    currentWorkarounds: z.array(z.string()).min(1),
    buyingTrigger: z.string().min(3),
  }),
  context: z.object({
    industryOrCategory: z.string().min(3),
    marketDynamics: z.string().min(3),
  }),
  proposedValue: z.object({
    mechanicOrSolution: z.string().min(5),
    keyBenefit: z.string().min(5),
    unfairAdvantage: z.string().min(3),
  }),
  constraints: z.array(z.string()),
  assumptions: z.array(HypothesisSchema),
  openQuestions: z.array(UnresolvedQuestionSchema),
  confidenceScore: z.number().min(0).max(1),
  status: z.enum(['draft', 'under_review', 'approved', 'rejected']),
  generatedAt: z.string(),
  approvedAt: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const ApprovedDecisionSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['problem_framing', 'target_audience', 'positioning', 'name', 'voice', 'visual']),
  title: z.string().min(1),
  value: z.string().min(1),
  rationale: z.string().min(1),
  approvedAt: z.string(),
  approvedBy: z.literal('founder'),
  version: z.number().int().positive(),
  supersedesId: z.string().optional(),
});

export const GeneratedArtifactSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    'idea_brief',
    'positioning_statement',
    'tagline',
    'voice_rules',
    'landing_page_hero',
    'launch_post',
  ]),
  title: z.string().min(1),
  content: z.string().min(1),
  governingDecisionIds: z.array(z.string()),
  status: z.enum(['draft', 'reviewed', 'approved', 'stale']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ValidationViolationSchema = z.object({
  id: z.string().min(1),
  rule: z.string().min(1),
  severity: z.enum(['warning', 'blocking']),
  message: z.string().min(1),
  detectedText: z.string().optional(),
  suggestedFix: z.string().optional(),
});

export const ValidationResultSchema = z.object({
  id: z.string().min(1),
  stage: z.string().min(1),
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  violations: z.array(ValidationViolationSchema),
  auditedAt: z.string(),
});

export const AdaptiveInterviewStateSchema = z.object({
  currentQuestionIndex: z.number().int().min(0),
  history: z.array(InterviewQuestionSchema),
  isComplete: z.boolean(),
  lastUpdated: z.string(),
});

export const ProjectMetadataSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  version: z.number().int().positive(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isDemoProject: z.boolean().optional(),
});

import { MarketLandscapeSchema } from './research-schemas';
import {
  PositioningWorldSchema,
  DecisionGraphStateSchema,
  ContradictionAlertSchema,
} from './strategy-schemas';

export const CanonicalBrandStateSchema = z.object({
  metadata: ProjectMetadataSchema,
  stage: z.enum(['intake', 'discovery', 'research', 'positioning', 'brief_review', 'strategy_locked']),
  rawFounderInput: z.string(),
  extractedFacts: z.array(ExtractedFactSchema),
  unresolvedQuestions: z.array(UnresolvedQuestionSchema),
  hypotheses: z.array(HypothesisSchema),
  interviewState: AdaptiveInterviewStateSchema,
  marketLandscape: MarketLandscapeSchema.nullable().default(null),
  positioningWorlds: z.array(PositioningWorldSchema).default([]),
  selectedWorldId: z.string().nullable().default(null),
  decisionGraph: DecisionGraphStateSchema.default({ nodes: {}, edges: [] }),
  contradictions: z.array(ContradictionAlertSchema).default([]),
  ideaBrief: IdeaBriefSchema.nullable(),
  decisions: z.record(z.string(), ApprovedDecisionSchema),
  artifacts: z.array(GeneratedArtifactSchema),
  validationHistory: z.array(ValidationResultSchema),
});

/**
 * AI Structured Output Schemas
 */
export const IntakeExtractionOutputSchema = z.object({
  extractedFacts: z.array(
    z.object({
      statement: z.string().min(5),
      confidence: z.number().min(0).max(1),
    })
  ).min(1),
  unvalidatedAssumptions: z.array(
    z.object({
      claim: z.string().min(5),
      riskLevel: AssumptionRiskLevelSchema,
      potentialConsequenceIfFalse: z.string().min(5),
    })
  ).min(1),
  initialQuestions: z.array(
    z.object({
      topic: InterviewTopicSchema,
      question: z.string().min(10),
      whyAsking: z.string().min(10),
      suggestedAnswers: z.array(z.string()).optional(),
      answerType: z.enum(['text', 'choice', 'hybrid']),
    })
  ).min(1).max(3),
});

export const NextAdaptiveQuestionOutputSchema = z.object({
  hasMoreQuestions: z.boolean(),
  reasonForCompletionOrNext: z.string(),
  nextQuestion: z.object({
    topic: InterviewTopicSchema,
    question: z.string().min(10),
    whyAsking: z.string().min(10),
    suggestedAnswers: z.array(z.string()).optional(),
    answerType: z.enum(['text', 'choice', 'hybrid']),
  }).optional(),
});
