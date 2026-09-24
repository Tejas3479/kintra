/**
 * KINTRA Consistency Guardian & Artifact Validation Types
 * Independent 9-dimension brand verification, causal explainability, and non-destructive repair mode
 */

export type GuardianArtifactType =
  | 'website_headline'
  | 'landing_page_section'
  | 'linkedin_post'
  | 'social_caption'
  | 'launch_email'
  | 'pitch_paragraph'
  | 'product_onboarding_copy'
  | 'support_response';

export type ValidationDimension =
  | 'strategic_alignment'
  | 'audience_alignment'
  | 'voice_alignment'
  | 'message_alignment'
  | 'visual_alignment'
  | 'distinctiveness'
  | 'unsupported_claims'
  | 'contradiction_risk'
  | 'brand_rule_violations';

export type FindingSeverity = 'low' | 'medium' | 'high' | 'blocking';

export type FindingStatus = 'open' | 'applied' | 'ignored' | 'custom_edited';

export interface StructuredExplanation {
  whatIsWrong: string;
  whyItMatters: string;
  whichDecisionConflicts: string;
  conflictingDecisionId?: string;
  howToCorrect: string;
}

export interface GuardianFinding {
  id: string;
  dimension: ValidationDimension;
  issue: string; // WHAT is wrong summary
  severity: FindingSeverity;
  violatedRule: string;
  evidence: string; // Excerpt or detected pattern
  explanation: StructuredExplanation; // Complete 4-part causal explanation
  suggestedRepair: string; // HOW to correct it with replacement text
  status: FindingStatus;
  ignoredReason?: string;
  appliedAt?: string;
}

export interface DimensionEvaluation {
  dimension: ValidationDimension;
  label: string;
  status: 'pass' | 'warning' | 'fail';
  score: number; // 0 - 100
  rationale: string;
  findingsCount: number;
  criticalIssues: string[];
}

export interface ArtifactValidationReport {
  id: string;
  artifactId: string;
  evaluatedAt: string;
  passed: boolean;
  totalFindings: number;
  blockingFindingsCount: number;
  // All 9 dimensions evaluated INDEPENDENTLY (never collapsed into a single magical score)
  dimensions: Record<ValidationDimension, DimensionEvaluation>;
  findings: GuardianFinding[];
  summary: string;
}

export interface ArtifactVersionRecord {
  version: number;
  content: string;
  editedAt: string;
  editReason?: string;
  editedBy: 'user' | 'auto_repair' | 'regeneration';
}

export interface VisualSpecOverride {
  dominantHex?: string;
  accentHex?: string;
  geometryStyle?: 'sharp_angled' | 'rounded_organic' | 'minimalist_swiss';
  fontFamily?: string;
  layoutDensity?: 'compact' | 'balanced' | 'spacious';
}

export interface BrandArtifact {
  id: string;
  name: string;
  artifactType: GuardianArtifactType;
  content: string;
  targetAudience?: string;
  channelContext?: string;
  visualSpec?: VisualSpecOverride;
  validationReport?: ArtifactValidationReport;
  versionHistory: ArtifactVersionRecord[];
  status: 'draft' | 'under_review' | 'changes_requested' | 'approved' | 'locked';
  isApproved: boolean;
  isLocked: boolean; // Locked versions cannot be overwritten silently
  approvedAt?: string;
  lockedAt?: string;
  createdAt: string;
  updatedAt: string;
}
