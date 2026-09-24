import { z } from 'zod';

export const LaunchKitArtifactTypeSchema = z.enum([
  'one_line_pitch',
  'homepage_hero',
  'homepage_supporting_copy',
  'launch_announcement',
  'social_post',
  'launch_email',
  'elevator_pitch',
  'brand_summary',
]);

export const LaunchKitLineageSchema = z.object({
  worldId: z.string().min(1),
  worldArchetype: z.string().min(1),
  governingDecisionIds: z.array(z.string()),
  identityTraitIds: z.array(z.string()),
  evidenceIds: z.array(z.string()),
  generatedAt: z.string().datetime(),
});

export const LaunchKitItemSchema = z.object({
  id: z.string().min(1),
  type: LaunchKitArtifactTypeSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  content: z.string().min(1),
  suggestedChannels: z.array(z.string()).min(1),
  targetAudience: z.string().min(1),
  lineage: LaunchKitLineageSchema,
});

export const DoDontExampleSchema = z.object({
  category: z.enum([
    'Headline Copy',
    'Technical Claims',
    'Social Engagement',
    'Product Onboarding',
    'Support & Comms',
  ]),
  doExample: z.string().min(1),
  dontExample: z.string().min(1),
  explanation: z.string().min(1),
});

export const BrandGuidelinesSchema = z.object({
  brandName: z.string().min(1),
  tagline: z.string().min(1),
  version: z.string().min(1),
  positioning: z.object({
    archetype: z.string().min(1),
    targetAudience: z.string().min(1),
    problemFraming: z.string().min(1),
    valueProposition: z.string().min(1),
    differentiator: z.string().min(1),
    proofMechanism: z.string().min(1),
    categoryFraming: z.string().min(1),
  }),
  personality: z.object({
    traits: z.array(
      z.object({
        name: z.string().min(1),
        definition: z.string().min(1),
        behavior: z.string().min(1),
        avoid: z.string().min(1),
      })
    ).min(1),
  }),
  messaging: z.object({
    coreMessage: z.string().min(1),
    pillars: z.array(
      z.object({
        pillar: z.string().min(1),
        proof: z.string().min(1),
      })
    ).min(1),
    bannedBuzzwords: z.array(z.string()),
  }),
  voice: z.object({
    tonalRegister: z.string().min(1),
    attributes: z.array(z.string()).min(1),
    vocabularyRules: z.object({
      preferredWords: z.array(z.string()),
      forbiddenWords: z.array(z.string()),
    }),
  }),
  visualDirection: z.object({
    primaryColor: z.string().min(1),
    secondaryColor: z.string().min(1),
    accentColor: z.string().min(1),
    backgroundStyle: z.string().min(1),
    typographyPairing: z.object({
      headingFont: z.string().min(1),
      bodyFont: z.string().min(1),
      monoFont: z.string().min(1),
    }),
    uiCornerRadius: z.string().min(1),
    logoRules: z.string().min(1),
  }),
  naming: z.object({
    approvedName: z.string().min(1),
    pronunciation: z.string().min(1),
    semanticRationale: z.string().min(1),
    usageRules: z.array(z.string()).min(1),
  }),
  usagePrinciples: z.array(z.string()).min(1),
  doAndDontExamples: z.array(DoDontExampleSchema).min(1),
});

export const LaunchKitSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  brandName: z.string().min(1),
  version: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(LaunchKitItemSchema).min(8), // At minimum the 8 core launch artifacts
  guidelines: BrandGuidelinesSchema,
});
