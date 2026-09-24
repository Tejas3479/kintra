/**
 * KINTRA Research & Evidence Ledger Domain Types
 */

export type SourceCategory =
  | 'primary_competitor'
  | 'secondary_alternative'
  | 'market_data'
  | 'customer_voice';

export type PageType =
  | 'competitor_homepage'
  | 'pricing_page'
  | 'industry_report'
  | 'forum_discussion'
  | 'news_article'
  | 'review_site';

export type Freshness = 'recent' | 'moderate' | 'stale' | 'undated';

export interface EvidenceRecord {
  id: string;
  url?: string;
  title: string;
  publisher: string;
  pageType: PageType;
  publishedAt?: string;
  observedAt: string;
  extractedClaim: string;
  supportingExcerpt: string;
  confidence: number; // 0.0 - 1.0 (epistemic confidence score)
  relevance: number;  // 0.0 - 1.0 (relevance to user idea)
  freshness: Freshness;
  sourceCategory: SourceCategory;
  limitations: string; // Explicit statement of bias or methodological limit
  verifiedSubstring: boolean; // True if excerpt was verified in raw page
}

export interface CompetitorProfile {
  id: string;
  name: string;
  url?: string;
  claimedPositioning: string;
  targetAudience: string;
  strengths: string[];
  weaknesses: string[];
  clichePhrases: string[];
  sourceIds: string[]; // Provenance links to EvidenceRecord
}

export interface ConflictingEvidence {
  id: string;
  topic: string;
  claimA: {
    statement: string;
    sourceTitle: string;
    sourceId: string;
  };
  claimB: {
    statement: string;
    sourceTitle: string;
    sourceId: string;
  };
  strategicImplication: string; // Explains how the founder can leverage this split
}

export interface MarketLandscape {
  id: string;
  categoryName: string;
  competitors: CompetitorProfile[];
  evidenceRecords: EvidenceRecord[];
  categoryDefaults: string[]; // Clichés and default assumptions made by incumbents
  differentiatorGaps: string[]; // Unclaimed positioning angles
  conflicts: ConflictingEvidence[];
  overallUncertainty: string;
  analyzedAt: string;
}
