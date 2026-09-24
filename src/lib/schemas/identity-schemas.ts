import { z } from 'zod';

export const BrandPersonalityTraitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  definition: z.string().min(10),
  audienceRelevance: z.string().min(10),
  strategicBasis: z.string().min(5),
  behaviorExamples: z.array(z.string().min(5)).min(1),
  traitToAvoid: z.string().min(5),
  confidence: z.number().min(0).max(1),
});

export const NamingTerritorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  semanticLogic: z.string().min(10),
  phoneticLogic: z.string().min(5),
  emotionalEffect: z.string().min(5),
  risks: z.string().min(5),
  categoryFit: z.string().min(5),
  distinctivenessConsiderations: z.string().min(5),
});

export const NamingCandidateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  territoryId: z.string().min(1),
  territoryName: z.string().min(2),
  rationale: z.string().min(10),
  semanticAssociation: z.string().min(5),
  pronunciation: z.string().min(2),
  possibleAmbiguity: z.string().min(2),
  genericnessRisk: z.enum(['low', 'medium', 'high']),
  antiGenericFlags: z.array(z.string()),
  strategicFit: z.string().min(5),
  confidence: z.number().min(0).max(1),
  status: z.enum(['candidate', 'shortlisted', 'selected', 'rejected']),
  rejectionReason: z.string().optional(),
  legalDisclaimer: z.string().min(10),
});

export const TaglineCandidateSchema = z.object({
  id: z.string().min(1),
  tagline: z.string().min(5),
  supportingWorldId: z.string().min(1),
  strategicMechanism: z.string().min(5),
  falsifiabilityScore: z.number().min(0).max(1),
  status: z.enum(['candidate', 'selected', 'rejected']),
  rejectionReason: z.string().optional(),
});

export const WeSayVsWeAvoidPairSchema = z.object({
  weSay: z.string().min(3),
  weAvoid: z.string().min(3),
  why: z.string().min(5),
});

export const VoiceExampleSchema = z.object({
  channel: z.enum(['pr_comment', 'technical_docs', 'hero_copy', 'changelog', 'social']),
  sampleText: z.string().min(10),
  annotation: z.string().min(5),
});

export const VoiceSystemSchema = z.object({
  tonalSliders: z.object({
    precision: z.number().min(0).max(100),
    warmth: z.number().min(0).max(100),
    authority: z.number().min(0).max(100),
    energy: z.number().min(0).max(100),
  }),
  sentenceBehavior: z.object({
    averageLength: z.enum(['concise', 'balanced', 'elaborate']),
    voicePreference: z.enum(['active_direct', 'collaborative', 'formal']),
    cadenceDescription: z.string().min(5),
  }),
  vocabulary: z.object({
    preferredTerms: z.array(z.string()).min(1),
    technicalDensity: z.enum(['accessible', 'practitioner', 'academic']),
    signaturePhrases: z.array(z.string()).min(1),
  }),
  bannedPatterns: z.array(z.string()).min(1),
  weSayVsWeAvoid: z.array(WeSayVsWeAvoidPairSchema).min(1),
  examples: z.array(VoiceExampleSchema).min(1),
  channelAdaptations: z.record(z.string(), z.string()),
});

export const ColorTokenSchema = z.object({
  name: z.string().min(1),
  hex: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color code'),
  role: z.string().min(2),
  contrastOnDark: z.string().min(1),
});

export const FontTokenSchema = z.object({
  family: z.string().min(1),
  weights: z.array(z.string()).min(1),
  category: z.enum(['sans', 'serif', 'mono', 'display']),
  rationale: z.string().min(5),
});

export const VisualSystemSchema = z.object({
  palette: z.object({
    primary: ColorTokenSchema,
    secondary: ColorTokenSchema,
    accent: ColorTokenSchema,
    neutralDark: ColorTokenSchema,
    neutralLight: ColorTokenSchema,
    semantic: z.object({
      success: ColorTokenSchema,
      warning: ColorTokenSchema,
      error: ColorTokenSchema,
    }),
  }),
  typography: z.object({
    headline: FontTokenSchema,
    body: FontTokenSchema,
    code: FontTokenSchema,
    scaleNotes: z.string().min(5),
  }),
  shapes: z.object({
    borderRadius: z.string().min(1),
    geometryNotes: z.string().min(5),
    borderStyle: z.string().min(1),
  }),
  layoutBehavior: z.object({
    density: z.enum(['compact', 'balanced', 'spacious']),
    gridPrinciples: z.string().min(5),
  }),
  imagery: z.object({
    artDirection: z.string().min(5),
    renderingStyle: z.string().min(5),
    contrastLevel: z.string().min(3),
  }),
  texture: z.object({
    surface: z.string().min(3),
    grainLevel: z.string().min(3),
    glassmorphism: z.boolean(),
  }),
  motionPrinciples: z.object({
    timing: z.string().min(3),
    easing: z.string().min(3),
    purpose: z.string().min(5),
  }),
  visualMetaphors: z.array(z.string()).min(1),
  thingsToAvoid: z.array(z.string()).min(1),
});

export const GeneratedVisualAssetSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(5),
  svgContent: z.string().optional(),
  imageUrl: z.string().optional(),
  assetType: z.enum(['brand_mark', 'hero_graphic', 'system_badge']),
  inheritedConstraints: z.array(z.string()),
  createdAt: z.string().min(1),
  isFallback: z.boolean(),
});

export const IdentityConsistencyConflictSchema = z.object({
  id: z.string().min(1),
  layerA: z.enum(['name', 'tagline', 'voice', 'visual', 'positioning']),
  layerB: z.enum(['name', 'tagline', 'voice', 'visual', 'positioning']),
  conflictDescription: z.string().min(10),
  severity: z.enum(['warning', 'blocking']),
  suggestedAlignment: z.string().min(10),
  detectedAt: z.string().min(1),
});

export const CreativeIdentitySchema = z.object({
  personalityTraits: z.array(BrandPersonalityTraitSchema).min(3).max(5),
  namingTerritories: z.array(NamingTerritorySchema).min(2),
  namingCandidates: z.array(NamingCandidateSchema).min(3),
  selectedNameId: z.string().nullable(),
  taglineCandidates: z.array(TaglineCandidateSchema).min(2),
  selectedTaglineId: z.string().nullable(),
  voiceSystem: VoiceSystemSchema,
  visualSystem: VisualSystemSchema,
  generatedVisuals: z.array(GeneratedVisualAssetSchema),
  consistencyConflicts: z.array(IdentityConsistencyConflictSchema),
  status: z.enum(['draft', 'under_review', 'approved']),
  approvedAt: z.string().optional(),
});
