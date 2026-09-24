/**
 * KINTRA — Launch Kit & Brand Guidelines Domain Types
 * Prompt 11: Final Practical Output Layer
 */

export type LaunchKitArtifactType =
  | 'one_line_pitch'
  | 'homepage_hero'
  | 'homepage_supporting_copy'
  | 'launch_announcement'
  | 'social_post'
  | 'launch_email'
  | 'elevator_pitch'
  | 'brand_summary';

export interface LaunchKitLineage {
  worldId: string;
  worldArchetype: string;
  governingDecisionIds: string[];
  identityTraitIds: string[];
  evidenceIds: string[];
  generatedAt: string;
}

export interface LaunchKitItem {
  id: string;
  type: LaunchKitArtifactType;
  title: string;
  summary: string;
  content: string;
  suggestedChannels: string[];
  targetAudience: string;
  lineage: LaunchKitLineage;
}

export interface DoDontExample {
  category: 'Headline Copy' | 'Technical Claims' | 'Social Engagement' | 'Product Onboarding' | 'Support & Comms';
  doExample: string;
  dontExample: string;
  explanation: string;
}

export interface BrandGuidelines {
  brandName: string;
  tagline: string;
  version: string;
  positioning: {
    archetype: string;
    targetAudience: string;
    problemFraming: string;
    valueProposition: string;
    differentiator: string;
    proofMechanism: string;
    categoryFraming: string;
  };
  personality: {
    traits: Array<{
      name: string;
      definition: string;
      behavior: string;
      avoid: string;
    }>;
  };
  messaging: {
    coreMessage: string;
    pillars: Array<{
      pillar: string;
      proof: string;
    }>;
    bannedBuzzwords: string[];
  };
  voice: {
    tonalRegister: string;
    attributes: string[];
    vocabularyRules: {
      preferredWords: string[];
      forbiddenWords: string[];
    };
  };
  visualDirection: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundStyle: string;
    typographyPairing: {
      headingFont: string;
      bodyFont: string;
      monoFont: string;
    };
    uiCornerRadius: string;
    logoRules: string;
  };
  naming: {
    approvedName: string;
    pronunciation: string;
    semanticRationale: string;
    usageRules: string[];
  };
  usagePrinciples: string[];
  doAndDontExamples: DoDontExample[];
}

export interface LaunchKit {
  id: string;
  projectId: string;
  brandName: string;
  version: string;
  generatedAt: string;
  items: LaunchKitItem[];
  guidelines: BrandGuidelines;
}
