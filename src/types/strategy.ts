/**
 * KINTRA Strategic Layer & Decision Graph Domain Types
 */

export interface StrategicTradeoffs {
  whatWeEmphasize: string;
  whatWeSacrifice: string; // The explicit sacrifice that makes it a real strategy
}

export interface StrategicChallenge {
  evaluatorRole: 'Strategist' | 'Contrarian' | 'Audience Advocate' | 'Competitive Challenger';
  perspective: string;
  potentialTrap: string;
  unforgivingQuestion: string;
}

export interface PositioningWorld {
  id: string;
  title: string;
  archetype: 'The Rebellious Challenger' | 'The Engineering Purist' | 'The Frictionless Partner' | 'The Sovereign Gatekeeper' | 'The Human-Centric Mentor';
  targetAudience: string;
  problemFraming: string;
  valueProposition: string;
  differentiator: string;
  categoryFraming: string;
  emotionalTerritory: string;
  proofMechanism: string;
  supportingEvidenceIds: string[]; // Links directly to EvidenceRecord.id
  assumptions: string[];
  risks: string[];
  tradeoffs: StrategicTradeoffs;
  challenges: StrategicChallenge[];
  status: 'candidate' | 'selected' | 'rejected' | 'custom_hybrid';
  userCustomizations?: string;
  rejectionReason?: string;
}

export type ContradictionType =
  | 'audience_tone_mismatch'
  | 'premium_commodity_mismatch'
  | 'trust_evidence_gap'
  | 'broad_narrow_conflict';

export interface ContradictionAlert {
  id: string;
  conflictType: ContradictionType;
  exactContradiction: string;
  severity: 'warning' | 'blocking';
  suggestedResolution: string;
  affectedField: string;
}

export interface DecisionNode {
  id: string;
  category:
    | 'positioning_world'
    | 'value_proposition'
    | 'target_niche'
    | 'category_frame'
    | 'proof_model'
    | 'brand_name'
    | 'tagline'
    | 'voice_system'
    | 'visual_system'
    | 'problem_framing'
    | 'pricing_tier'
    | 'market_motion';
  title: string;
  approvedValue: string;
  rationale: string;
  evidenceIds: string[];
  rejectedAlternatives: {
    id: string;
    title: string;
    whyRejected: string;
  }[];
  tradeoff: string;
  dependsOn: string[];
  governs: string[];
  status: 'candidate' | 'approved' | 'invalidated';
  approvedAt?: string;
  version: number;
}

export interface DecisionEdge {
  id: string;
  source: string; // DecisionNode.id
  target: string; // DecisionNode.id
  relation: 'supports' | 'depends_on' | 'governs' | 'contradicts' | 'replaces';
}

export interface DecisionGraphState {
  nodes: Record<string, DecisionNode>;
  edges: DecisionEdge[];
}
