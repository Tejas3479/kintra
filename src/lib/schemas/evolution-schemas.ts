import { z } from 'zod';
import type { BrandBranch } from '@/types/evolution';
import { ArtifactValidationReportSchema } from './guardian-schemas';

export const ScenarioTemplateTypeSchema = z.enum([
  'website_launch',
  'social_announcement',
  'onboarding_screen',
  'sales_email',
  'investor_pitch',
  'advertisement',
  'support_response',
]);

export const ScenarioRawGenerationSchema = z.object({
  content: z.string().min(5),
  detectedFlaws: z.array(z.string()),
  description: z.string(),
});

export const ScenarioBrandAwareGenerationSchema = z.object({
  content: z.string().min(5),
  alignedDecisions: z.array(z.string()),
  description: z.string(),
});

export const ScenarioValidatedFinalSchema = z.object({
  content: z.string().min(5),
  validationReport: ArtifactValidationReportSchema,
  lockedAt: z.string().optional(),
  repairedFindingsCount: z.number().int().nonnegative(),
});

export const ScenarioArtifactLineageSchema = z.object({
  originScenario: ScenarioTemplateTypeSchema,
  governingDecisionIds: z.array(z.string()),
  worldId: z.string(),
  identityArchetype: z.string(),
  version: z.number().int().positive(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ScenarioArtifactSchema = z.object({
  id: z.string().min(1),
  scenarioType: ScenarioTemplateTypeSchema,
  title: z.string().min(2),
  targetAudience: z.string().min(2),
  rawGeneration: ScenarioRawGenerationSchema,
  brandAwareGeneration: ScenarioBrandAwareGenerationSchema,
  validatedFinal: ScenarioValidatedFinalSchema,
  lineage: ScenarioArtifactLineageSchema,
  status: z.enum(['draft', 'audited', 'repaired', 'approved']),
});

export const AssumptionCategorySchema = z.enum([
  'target_audience',
  'pricing_tier',
  'market_motion',
  'emotional_territory',
  'primary_problem',
  'category_frame',
]);

export const AssumptionChangeRequestSchema = z.object({
  id: z.string().min(1),
  category: AssumptionCategorySchema,
  title: z.string().min(3),
  currentValue: z.string().min(1),
  proposedValue: z.string().min(1),
  rationale: z.string().min(5),
  requestedAt: z.string(),
});

export const NodeImpactStatusSchema = z.enum([
  'remains_valid',
  'needs_revision',
  'questionable',
  'must_regenerate',
  'unchanged',
]);

export const ImpactedNodeSchema = z.object({
  nodeId: z.string().min(1),
  title: z.string().min(1),
  nodeType: z.enum(['decision', 'artifact', 'voice', 'visual', 'world']),
  impactStatus: NodeImpactStatusSchema,
  causalReason: z.string().min(5),
  recommendedAction: z.string().min(5),
});

export const DependencyImpactReportSchema = z.object({
  changeRequestId: z.string().min(1),
  assumptionCategory: AssumptionCategorySchema,
  currentValue: z.string().min(1),
  proposedValue: z.string().min(1),
  blastRadius: z.object({
    changedAssumption: z.string(),
    affectedDecisions: z.array(ImpactedNodeSchema),
    affectedArtifacts: z.array(ImpactedNodeSchema),
    reviewRequiredCount: z.number().int().nonnegative(),
    remainsValidCount: z.number().int().nonnegative(),
    mustRegenerateCount: z.number().int().nonnegative(),
  }),
  summary: z.string().min(5),
  analyzedAt: z.string(),
});

export const EvolutionApprovalChoiceSchema = z.enum([
  'apply_update',
  'keep_old_decision',
  'branch_brand',
  'review_individually',
]);

export const BranchDiffItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  baseValue: z.string(),
  targetValue: z.string(),
  status: z.enum(['identical', 'modified', 'added', 'removed']),
});

export const BranchComparisonDiffSchema = z.object({
  baseBranchId: z.string(),
  baseBranchName: z.string(),
  targetBranchId: z.string(),
  targetBranchName: z.string(),
  assumptionDiffs: z.array(BranchDiffItemSchema),
  decisionDiffs: z.array(BranchDiffItemSchema),
  artifactDiffs: z.array(BranchDiffItemSchema),
  divergenceScore: z.number().min(0).max(100),
  generatedAt: z.string(),
});

export const BrandBranchSchema: z.ZodType<BrandBranch> = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  parentBranchId: z.string().optional(),
  createdAt: z.string(),
  snapshot: z.object({
    id: z.string(),
    version: z.number(),
    label: z.string(),
    timestamp: z.string(),
    state: z.any(),
  }),
}) as unknown as z.ZodType<BrandBranch>;
