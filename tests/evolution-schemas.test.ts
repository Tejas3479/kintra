import { describe, it, expect } from 'vitest';
import {
  ScenarioTemplateTypeSchema,
  ScenarioArtifactSchema,
  AssumptionCategorySchema,
  AssumptionChangeRequestSchema,
  DependencyImpactReportSchema,
  BranchComparisonDiffSchema,
} from '@/lib/schemas/evolution-schemas';
import { ScenarioArtifact, AssumptionChangeRequest, DependencyImpactReport } from '@/types/evolution';

describe('Evolution & Scenario Lab Schemas Suite (Prompt 10)', () => {
  it('validates all 7 supported scenario template types', () => {
    const templates = [
      'website_launch',
      'social_announcement',
      'onboarding_screen',
      'sales_email',
      'investor_pitch',
      'advertisement',
      'support_response',
    ];
    templates.forEach((t) => {
      expect(ScenarioTemplateTypeSchema.parse(t)).toBe(t);
    });
  });

  it('validates a complete ScenarioArtifact with tri-state generations', () => {
    const validScenarioArtifact: ScenarioArtifact = {
      id: 'scen-123',
      scenarioType: 'website_launch',
      title: 'Production Launch Hero Headline',
      targetAudience: 'Senior Infrastructure Engineers',
      rawGeneration: {
        content: 'Supercharge your pull requests with our 10x AI copilot for ultimate developer speed!',
        detectedFlaws: ['generic hype terms (supercharge, 10x)', 'unsupported claims', 'wrong audience tone'],
        description: 'Raw ungrounded LLM output without brand memory or decision graph context.',
      },
      brandAwareGeneration: {
        content: 'Deterministic AST-level pull request security. Zero silent logic escapes before production merge.',
        alignedDecisions: ['differentiator: AST-level semantic analysis', 'voice: quiet engineering rigor'],
        description: 'Directly synthesized from locked Positioning World and Voice System.',
      },
      validatedFinal: {
        content: 'Deterministic AST-level pull request security. Zero silent logic escapes before production merge.',
        repairedFindingsCount: 0,
        validationReport: {
          id: 'rep-scen-123',
          artifactId: 'scen-123',
          evaluatedAt: '2026-09-24T12:00:00Z',
          passed: true,
          blockingFindingsCount: 0,
          totalFindings: 0,
          summary: '100% Brand Consistent across all 9 validation dimensions.',
          dimensions: {
            strategic_alignment: { dimension: 'strategic_alignment', label: 'Strategic Alignment', status: 'pass', score: 100, rationale: 'Aligned with core value proposition.', findingsCount: 0, criticalIssues: [] },
            audience_alignment: { dimension: 'audience_alignment', label: 'Audience Alignment', status: 'pass', score: 100, rationale: 'Targeted directly at Senior Engineers.', findingsCount: 0, criticalIssues: [] },
            voice_alignment: { dimension: 'voice_alignment', label: 'Voice Alignment', status: 'pass', score: 100, rationale: 'Follows rigorous engineering tone.', findingsCount: 0, criticalIssues: [] },
            message_alignment: { dimension: 'message_alignment', label: 'Message Alignment', status: 'pass', score: 100, rationale: 'Affirms AST analysis pillar.', findingsCount: 0, criticalIssues: [] },
            visual_alignment: { dimension: 'visual_alignment', label: 'Visual Alignment', status: 'pass', score: 100, rationale: 'Matches terminal aesthetics.', findingsCount: 0, criticalIssues: [] },
            distinctiveness: { dimension: 'distinctiveness', label: 'Distinctiveness', status: 'pass', score: 100, rationale: 'Zero buzzwords or generic startup clichés.', findingsCount: 0, criticalIssues: [] },
            unsupported_claims: { dimension: 'unsupported_claims', label: 'Unsupported Claims', status: 'pass', score: 100, rationale: 'All claims grounded in evidence.', findingsCount: 0, criticalIssues: [] },
            contradiction_risk: { dimension: 'contradiction_risk', label: 'Contradiction Risk', status: 'pass', score: 100, rationale: 'Zero contradictions with approved decisions.', findingsCount: 0, criticalIssues: [] },
            brand_rule_violations: { dimension: 'brand_rule_violations', label: 'Brand Rule Violations', status: 'pass', score: 100, rationale: 'Complies with all style guardrails.', findingsCount: 0, criticalIssues: [] },
          },
          findings: [],
        },
      },
      lineage: {
        originScenario: 'website_launch',
        governingDecisionIds: ['dec-pos-1', 'dec-voice-1'],
        worldId: 'world-purist',
        identityArchetype: 'The Engineering Purist',
        version: 1,
        createdAt: '2026-09-24T12:00:00Z',
        updatedAt: '2026-09-24T12:00:00Z',
      },
      status: 'approved',
    };

    const parsed = ScenarioArtifactSchema.parse(validScenarioArtifact);
    expect(parsed.id).toBe('scen-123');
    expect(parsed.validatedFinal.validationReport.passed).toBe(true);
  });

  it('validates AssumptionChangeRequest and DependencyImpactReport', () => {
    const request: AssumptionChangeRequest = {
      id: 'req-evolve-1',
      category: 'target_audience',
      title: 'Pivot Audience: Senior Engineers → Enterprise CISOs',
      currentValue: 'Senior Infrastructure & Platform Engineers',
      proposedValue: 'Enterprise CISOs & Compliance Officers',
      rationale: 'Top-down compliance budgets are 5x larger than bottom-up developer tooling allowances.',
      requestedAt: '2026-09-24T12:00:00Z',
    };

    expect(AssumptionCategorySchema.parse(request.category)).toBe('target_audience');
    const parsedReq = AssumptionChangeRequestSchema.parse(request);
    expect(parsedReq.category).toBe('target_audience');

    const report: DependencyImpactReport = {
      changeRequestId: request.id,
      assumptionCategory: 'target_audience',
      currentValue: request.currentValue,
      proposedValue: request.proposedValue,
      blastRadius: {
        changedAssumption: 'Target Audience: Senior Engineers → Enterprise CISOs',
        affectedDecisions: [
          {
            nodeId: 'node-target-niche',
            title: 'Target Audience Decision',
            nodeType: 'decision',
            impactStatus: 'must_regenerate',
            causalReason: 'Direct foundational pivot in target buyer persona.',
            recommendedAction: 'Update target buyer to Enterprise CISOs with SOC2/ISO27001 focus.',
          },
          {
            nodeId: 'node-proof-model',
            title: 'Core AST Proof Model',
            nodeType: 'decision',
            impactStatus: 'remains_valid',
            causalReason: 'Underlying deterministic AST verification remains the core moat regardless of buyer.',
            recommendedAction: 'Retain without changes.',
          },
        ],
        affectedArtifacts: [
          {
            nodeId: 'art-sales-email',
            title: 'Outbound Sales Pitch',
            nodeType: 'artifact',
            impactStatus: 'must_regenerate',
            causalReason: 'Pitch was addressed to IC developers rather than compliance officers.',
            recommendedAction: 'Regenerate with executive compliance framing.',
          },
        ],
        reviewRequiredCount: 2,
        remainsValidCount: 1,
        mustRegenerateCount: 2,
      },
      summary: 'Target audience pivot impacts persona decisions and outbound copy, but core technology proof remains valid.',
      analyzedAt: '2026-09-24T12:00:00Z',
    };

    const parsedReport = DependencyImpactReportSchema.parse(report);
    expect(parsedReport.blastRadius.remainsValidCount).toBe(1);
    expect(parsedReport.blastRadius.mustRegenerateCount).toBe(2);
  });
});
