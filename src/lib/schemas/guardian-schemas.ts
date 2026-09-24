import { z } from 'zod';

export const GuardianArtifactTypeSchema = z.enum([
  'website_headline',
  'landing_page_section',
  'linkedin_post',
  'social_caption',
  'launch_email',
  'pitch_paragraph',
  'product_onboarding_copy',
  'support_response',
]);

export const ValidationDimensionSchema = z.enum([
  'strategic_alignment',
  'audience_alignment',
  'voice_alignment',
  'message_alignment',
  'visual_alignment',
  'distinctiveness',
  'unsupported_claims',
  'contradiction_risk',
  'brand_rule_violations',
]);

export const FindingSeveritySchema = z.enum(['low', 'medium', 'high', 'blocking']);

export const FindingStatusSchema = z.enum(['open', 'applied', 'ignored', 'custom_edited']);

export const StructuredExplanationSchema = z.object({
  whatIsWrong: z.string().min(5),
  whyItMatters: z.string().min(5),
  whichDecisionConflicts: z.string().min(3),
  conflictingDecisionId: z.string().optional(),
  howToCorrect: z.string().min(5),
});

export const GuardianFindingSchema = z.object({
  id: z.string().min(1),
  dimension: ValidationDimensionSchema,
  issue: z.string().min(3),
  severity: FindingSeveritySchema,
  violatedRule: z.string().min(3),
  evidence: z.string().min(1),
  explanation: StructuredExplanationSchema,
  suggestedRepair: z.string().min(1),
  status: FindingStatusSchema,
  ignoredReason: z.string().optional(),
  appliedAt: z.string().optional(),
});

export const DimensionEvaluationSchema = z.object({
  dimension: ValidationDimensionSchema,
  label: z.string().min(2),
  status: z.enum(['pass', 'warning', 'fail']),
  score: z.number().min(0).max(100),
  rationale: z.string().min(3),
  findingsCount: z.number().min(0),
  criticalIssues: z.array(z.string()),
});

export const ArtifactValidationReportSchema = z.object({
  id: z.string().min(1),
  artifactId: z.string().min(1),
  evaluatedAt: z.string().min(1),
  passed: z.boolean(),
  totalFindings: z.number().min(0),
  blockingFindingsCount: z.number().min(0),
  dimensions: z.record(ValidationDimensionSchema, DimensionEvaluationSchema),
  findings: z.array(GuardianFindingSchema),
  summary: z.string().min(5),
});

export const ArtifactVersionRecordSchema = z.object({
  version: z.number().min(1),
  content: z.string(),
  editedAt: z.string().min(1),
  editReason: z.string().optional(),
  editedBy: z.enum(['user', 'auto_repair', 'regeneration']),
});

export const VisualSpecOverrideSchema = z.object({
  dominantHex: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional(),
  accentHex: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional(),
  geometryStyle: z.enum(['sharp_angled', 'rounded_organic', 'minimalist_swiss']).optional(),
  fontFamily: z.string().optional(),
  layoutDensity: z.enum(['compact', 'balanced', 'spacious']).optional(),
});

export const BrandArtifactSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  artifactType: GuardianArtifactTypeSchema,
  content: z.string().min(1),
  targetAudience: z.string().optional(),
  channelContext: z.string().optional(),
  visualSpec: VisualSpecOverrideSchema.optional(),
  validationReport: ArtifactValidationReportSchema.optional(),
  versionHistory: z.array(ArtifactVersionRecordSchema),
  status: z.enum(['draft', 'under_review', 'changes_requested', 'approved', 'locked']),
  isApproved: z.boolean(),
  isLocked: z.boolean(),
  approvedAt: z.string().optional(),
  lockedAt: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
