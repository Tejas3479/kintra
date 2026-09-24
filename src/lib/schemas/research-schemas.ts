import { z } from 'zod';

export const SourceCategorySchema = z.enum([
  'primary_competitor',
  'secondary_alternative',
  'market_data',
  'customer_voice',
]);

export const PageTypeSchema = z.enum([
  'competitor_homepage',
  'pricing_page',
  'industry_report',
  'forum_discussion',
  'news_article',
  'review_site',
]);

export const FreshnessSchema = z.enum(['recent', 'moderate', 'stale', 'undated']);

export const EvidenceRecordSchema = z.object({
  id: z.string().min(1),
  url: z.string().optional(),
  title: z.string().min(1),
  publisher: z.string().min(1),
  pageType: PageTypeSchema,
  publishedAt: z.string().optional(),
  observedAt: z.string(),
  extractedClaim: z.string().min(5),
  supportingExcerpt: z.string().min(5),
  confidence: z.number().min(0).max(1),
  relevance: z.number().min(0).max(1),
  freshness: FreshnessSchema,
  sourceCategory: SourceCategorySchema,
  limitations: z.string().min(3),
  verifiedSubstring: z.boolean(),
});

export const CompetitorProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().optional(),
  claimedPositioning: z.string().min(5),
  targetAudience: z.string().min(3),
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  clichePhrases: z.array(z.string()),
  sourceIds: z.array(z.string()),
});

export const ConflictingEvidenceSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(3),
  claimA: z.object({
    statement: z.string().min(5),
    sourceTitle: z.string().min(1),
    sourceId: z.string().min(1),
  }),
  claimB: z.object({
    statement: z.string().min(5),
    sourceTitle: z.string().min(1),
    sourceId: z.string().min(1),
  }),
  strategicImplication: z.string().min(10),
});

export const MarketLandscapeSchema = z.object({
  id: z.string().min(1),
  categoryName: z.string().min(3),
  competitors: z.array(CompetitorProfileSchema).min(1),
  evidenceRecords: z.array(EvidenceRecordSchema).min(1),
  categoryDefaults: z.array(z.string()).min(1),
  differentiatorGaps: z.array(z.string()).min(1),
  conflicts: z.array(ConflictingEvidenceSchema),
  overallUncertainty: z.string().min(5),
  analyzedAt: z.string(),
});
