import { z } from 'zod';

export const StrategicTradeoffsSchema = z.object({
  whatWeEmphasize: z.string().min(5),
  whatWeSacrifice: z.string().min(5),
});

export const StrategicChallengeSchema = z.object({
  evaluatorRole: z.enum([
    'Strategist',
    'Contrarian',
    'Audience Advocate',
    'Competitive Challenger',
  ]),
  perspective: z.string().min(5),
  potentialTrap: z.string().min(5),
  unforgivingQuestion: z.string().min(10),
});

export const PositioningWorldSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  archetype: z.enum([
    'The Rebellious Challenger',
    'The Engineering Purist',
    'The Frictionless Partner',
    'The Sovereign Gatekeeper',
    'The Human-Centric Mentor',
  ]),
  targetAudience: z.string().min(5),
  problemFraming: z.string().min(10),
  valueProposition: z.string().min(10),
  differentiator: z.string().min(5),
  categoryFraming: z.string().min(3),
  emotionalTerritory: z.string().min(3),
  proofMechanism: z.string().min(5),
  supportingEvidenceIds: z.array(z.string()),
  assumptions: z.array(z.string()).min(1),
  risks: z.array(z.string()).min(1),
  tradeoffs: StrategicTradeoffsSchema,
  challenges: z.array(StrategicChallengeSchema),
  status: z.enum(['candidate', 'selected', 'rejected', 'custom_hybrid']),
  userCustomizations: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const ContradictionAlertSchema = z.object({
  id: z.string().min(1),
  conflictType: z.enum([
    'audience_tone_mismatch',
    'premium_commodity_mismatch',
    'trust_evidence_gap',
    'broad_narrow_conflict',
  ]),
  exactContradiction: z.string().min(10),
  severity: z.enum(['warning', 'blocking']),
  suggestedResolution: z.string().min(10),
  affectedField: z.string().min(1),
});

export const DecisionNodeSchema = z.object({
  id: z.string().min(1),
  category: z.enum([
    'positioning_world',
    'value_proposition',
    'target_niche',
    'category_frame',
    'proof_model',
  ]),
  title: z.string().min(1),
  approvedValue: z.string().min(1),
  rationale: z.string().min(1),
  evidenceIds: z.array(z.string()),
  rejectedAlternatives: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      whyRejected: z.string().min(1),
    })
  ),
  tradeoff: z.string().min(1),
  dependsOn: z.array(z.string()),
  governs: z.array(z.string()),
  status: z.enum(['candidate', 'approved', 'invalidated']),
  approvedAt: z.string().optional(),
  version: z.number().int().positive(),
});

export const DecisionEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  relation: z.enum(['supports', 'depends_on', 'governs', 'contradicts', 'replaces']),
});

export const DecisionGraphStateSchema = z.object({
  nodes: z.record(z.string(), DecisionNodeSchema),
  edges: z.array(DecisionEdgeSchema),
});
