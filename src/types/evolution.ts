/**
 * KINTRA — Scenario Lab & Brand Evolution Engine Domain Types
 *
 * Covers:
 * Part A: Realistic Scenario Lab (Tri-State comparison: Raw vs Brand-Aware vs Validated)
 * Part B & C: Controlled Assumption Evolution & Dependency Analysis Graph
 * Part D: Blast Radius & Impact Preview (remains_valid, needs_revision, questionable, must_regenerate, unchanged)
 * Part E: User Approval Controls (Update, Keep, Branch, Review Individually)
 * Part F: Brand Branching, Versioning & Historical Diffing
 */

import { ArtifactValidationReport } from './guardian';
import { ProjectSnapshot } from './brand';

export type ScenarioTemplateType =
  | 'website_launch'
  | 'social_announcement'
  | 'onboarding_screen'
  | 'sales_email'
  | 'investor_pitch'
  | 'advertisement'
  | 'support_response';

export interface ScenarioRawGeneration {
  content: string;
  detectedFlaws: string[];
  description: string;
}

export interface ScenarioBrandAwareGeneration {
  content: string;
  alignedDecisions: string[];
  description: string;
}

export interface ScenarioValidatedFinal {
  content: string;
  validationReport: ArtifactValidationReport;
  lockedAt?: string;
  repairedFindingsCount: number;
}

export interface ScenarioArtifactLineage {
  originScenario: ScenarioTemplateType;
  governingDecisionIds: string[];
  worldId: string;
  identityArchetype: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioArtifact {
  id: string;
  scenarioType: ScenarioTemplateType;
  title: string;
  targetAudience: string;
  rawGeneration: ScenarioRawGeneration;
  brandAwareGeneration: ScenarioBrandAwareGeneration;
  validatedFinal: ScenarioValidatedFinal;
  lineage: ScenarioArtifactLineage;
  status: 'draft' | 'audited' | 'repaired' | 'approved';
}

export type AssumptionCategory =
  | 'target_audience'
  | 'pricing_tier'
  | 'market_motion'
  | 'emotional_territory'
  | 'primary_problem'
  | 'category_frame';

export interface AssumptionChangeRequest {
  id: string;
  category: AssumptionCategory;
  title: string;
  currentValue: string;
  proposedValue: string;
  rationale: string;
  requestedAt: string;
}

export type NodeImpactStatus =
  | 'remains_valid'
  | 'needs_revision'
  | 'questionable'
  | 'must_regenerate'
  | 'unchanged';

export interface ImpactedNode {
  nodeId: string;
  title: string;
  nodeType: 'decision' | 'artifact' | 'voice' | 'visual' | 'world';
  impactStatus: NodeImpactStatus;
  causalReason: string;
  recommendedAction: string;
}

export interface DependencyImpactReport {
  changeRequestId: string;
  assumptionCategory: AssumptionCategory;
  currentValue: string;
  proposedValue: string;
  blastRadius: {
    changedAssumption: string;
    affectedDecisions: ImpactedNode[];
    affectedArtifacts: ImpactedNode[];
    reviewRequiredCount: number;
    remainsValidCount: number;
    mustRegenerateCount: number;
  };
  summary: string;
  analyzedAt: string;
}

export type EvolutionApprovalChoice =
  | 'apply_update'
  | 'keep_old_decision'
  | 'branch_brand'
  | 'review_individually';

export interface BrandBranch {
  id: string;
  name: string;
  description: string;
  parentBranchId?: string;
  createdAt: string;
  snapshot: ProjectSnapshot;
}

export interface BranchDiffItem {
  key: string;
  label: string;
  baseValue: string;
  targetValue: string;
  status: 'identical' | 'modified' | 'added' | 'removed';
}

export interface BranchComparisonDiff {
  baseBranchId: string;
  baseBranchName: string;
  targetBranchId: string;
  targetBranchName: string;
  assumptionDiffs: BranchDiffItem[];
  decisionDiffs: BranchDiffItem[];
  artifactDiffs: BranchDiffItem[];
  divergenceScore: number; // 0 - 100% divergent
  generatedAt: string;
}
