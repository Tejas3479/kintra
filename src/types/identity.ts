/**
 * KINTRA Creative Identity Domain Types
 * Naming, Personality, Voice, Visual System, Image Provider & Consistency Audits
 */

export interface BrandPersonalityTrait {
  id: string;
  name: string;
  definition: string;
  audienceRelevance: string;
  strategicBasis: string; // Grounded in the selected PositioningWorld
  behaviorExamples: string[];
  traitToAvoid: string; // The boundary / anti-trait
  confidence: number; // 0.0 - 1.0
}

export interface NamingTerritory {
  id: string;
  name: string;
  semanticLogic: string;
  phoneticLogic: string;
  emotionalEffect: string;
  risks: string;
  categoryFit: string;
  distinctivenessConsiderations: string;
}

export interface NamingCandidate {
  id: string;
  name: string;
  territoryId: string;
  territoryName: string;
  rationale: string;
  semanticAssociation: string;
  pronunciation: string;
  possibleAmbiguity: string;
  genericnessRisk: 'low' | 'medium' | 'high';
  antiGenericFlags: string[];
  strategicFit: string;
  confidence: number;
  status: 'candidate' | 'shortlisted' | 'selected' | 'rejected';
  rejectionReason?: string;
  legalDisclaimer: string; // Non-negotiable: Present result as current check, not legal clearance
}

export interface TaglineCandidate {
  id: string;
  tagline: string;
  supportingWorldId: string;
  strategicMechanism: string;
  falsifiabilityScore: number; // 0.0 - 1.0; a competitor could NOT also say it
  status: 'candidate' | 'selected' | 'rejected';
  rejectionReason?: string;
}

export interface WeSayVsWeAvoidPair {
  weSay: string;
  weAvoid: string;
  why: string;
}

export interface VoiceExample {
  channel: 'pr_comment' | 'technical_docs' | 'hero_copy' | 'changelog' | 'social';
  sampleText: string;
  annotation: string;
}

export interface VoiceSystem {
  tonalSliders: {
    precision: number; // 0-100
    warmth: number; // 0-100
    authority: number; // 0-100
    energy: number; // 0-100
  };
  sentenceBehavior: {
    averageLength: 'concise' | 'balanced' | 'elaborate';
    voicePreference: 'active_direct' | 'collaborative' | 'formal';
    cadenceDescription: string;
  };
  vocabulary: {
    preferredTerms: string[];
    technicalDensity: 'accessible' | 'practitioner' | 'academic';
    signaturePhrases: string[];
  };
  bannedPatterns: string[]; // Cliché buzzwords, passive hedging, empty marketing filler
  weSayVsWeAvoid: WeSayVsWeAvoidPair[];
  examples: VoiceExample[];
  channelAdaptations: Record<string, string>;
}

export interface ColorToken {
  name: string;
  hex: string;
  role: string;
  contrastOnDark: string;
}

export interface FontToken {
  family: string;
  weights: string[];
  category: 'sans' | 'serif' | 'mono' | 'display';
  rationale: string;
}

export interface VisualSystem {
  palette: {
    primary: ColorToken;
    secondary: ColorToken;
    accent: ColorToken;
    neutralDark: ColorToken;
    neutralLight: ColorToken;
    semantic: {
      success: ColorToken;
      warning: ColorToken;
      error: ColorToken;
    };
  };
  typography: {
    headline: FontToken;
    body: FontToken;
    code: FontToken;
    scaleNotes: string;
  };
  shapes: {
    borderRadius: string; // e.g., 'rounded-none' | 'rounded-md' | 'rounded-xl'
    geometryNotes: string;
    borderStyle: string;
  };
  layoutBehavior: {
    density: 'compact' | 'balanced' | 'spacious';
    gridPrinciples: string;
  };
  imagery: {
    artDirection: string;
    renderingStyle: string;
    contrastLevel: string;
  };
  texture: {
    surface: string;
    grainLevel: string;
    glassmorphism: boolean;
  };
  motionPrinciples: {
    timing: string;
    easing: string;
    purpose: string;
  };
  visualMetaphors: string[];
  thingsToAvoid: string[];
}

export interface GeneratedVisualAsset {
  id: string;
  prompt: string;
  svgContent?: string;
  imageUrl?: string;
  assetType: 'brand_mark' | 'hero_graphic' | 'system_badge';
  inheritedConstraints: string[];
  createdAt: string;
  isFallback: boolean;
}

export interface IdentityConsistencyConflict {
  id: string;
  layerA: 'name' | 'tagline' | 'voice' | 'visual' | 'positioning';
  layerB: 'name' | 'tagline' | 'voice' | 'visual' | 'positioning';
  conflictDescription: string;
  severity: 'warning' | 'blocking';
  suggestedAlignment: string;
  detectedAt: string;
}

export interface CreativeIdentity {
  personalityTraits: BrandPersonalityTrait[];
  namingTerritories: NamingTerritory[];
  namingCandidates: NamingCandidate[];
  selectedNameId: string | null;
  taglineCandidates: TaglineCandidate[];
  selectedTaglineId: string | null;
  voiceSystem: VoiceSystem;
  visualSystem: VisualSystem;
  generatedVisuals: GeneratedVisualAsset[];
  consistencyConflicts: IdentityConsistencyConflict[];
  status: 'draft' | 'under_review' | 'approved';
  approvedAt?: string;
}
