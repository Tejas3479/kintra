/**
 * KINTRA — Scenario Lab Engine
 *
 * Implements realistic scenario testing with Tri-State comparison:
 * 1. RAW GENERATION (ungrounded, cliché-ridden, buzzword-heavy AI generation)
 * 2. BRAND-AWARE GENERATION (grounded in locked Brand Decision Graph & Voice tokens)
 * 3. VALIDATED FINAL (audited through Consistency Guardian with 9 dimensions & repair mode)
 *
 * Preserves full causal lineage back to governing strategic decisions.
 */

import {
  ScenarioTemplateType,
  ScenarioArtifact,
  ScenarioRawGeneration,
  ScenarioBrandAwareGeneration,
  ScenarioValidatedFinal,
  ScenarioArtifactLineage,
} from '@/types/evolution';
import { CanonicalBrandState } from '@/types/brand';
import { BrandArtifact, GuardianArtifactType } from '@/types/guardian';
import { ConsistencyGuardian } from '@/lib/guardian/consistency-guardian';
import { logger } from '@/lib/logger';

export interface ScenarioTemplateDefinition {
  type: ScenarioTemplateType;
  label: string;
  icon: string;
  purpose: string;
  defaultTitle: string;
  guardianMapping: GuardianArtifactType;
}

export const SCENARIO_TEMPLATES: Record<ScenarioTemplateType, ScenarioTemplateDefinition> = {
  website_launch: {
    type: 'website_launch',
    label: 'Website Launch Hero',
    icon: '🌐',
    purpose: 'Homepage hero headline, value deck, and proof anchor for technical buyers.',
    defaultTitle: 'Website Launch Headline & Hero Subdeck',
    guardianMapping: 'website_headline',
  },
  social_announcement: {
    type: 'social_announcement',
    label: 'Social Announcement',
    icon: '📣',
    purpose: 'Founder broadcast or launch thread articulating the core problem and why now.',
    defaultTitle: 'Public Beta Announcement Post',
    guardianMapping: 'linkedin_post',
  },
  onboarding_screen: {
    type: 'onboarding_screen',
    label: 'Onboarding Screen',
    icon: '🚀',
    purpose: 'First-run setup instructions emphasizing determinism and safety.',
    defaultTitle: 'CLI / GitHub App Setup Flow',
    guardianMapping: 'product_onboarding_copy',
  },
  sales_email: {
    type: 'sales_email',
    label: 'Sales Outreach Email',
    icon: '✉️',
    purpose: 'Direct outbound message to decision-makers highlighting architectural ROI.',
    defaultTitle: 'Enterprise Lead Intro Email',
    guardianMapping: 'launch_email',
  },
  investor_pitch: {
    type: 'investor_pitch',
    label: 'Investor Pitch Memo',
    icon: '🎯',
    purpose: 'Executive problem-solution memo summarizing moats and market wedge.',
    defaultTitle: 'Seed / Series A Executive Narrative',
    guardianMapping: 'pitch_paragraph',
  },
  advertisement: {
    type: 'advertisement',
    label: 'Developer Ad Copy',
    icon: '⚡',
    purpose: 'Punchy technical hook for search or developer newsletter sponsorship.',
    defaultTitle: 'Sponsored Technical Newsletter Snippet',
    guardianMapping: 'social_caption',
  },
  support_response: {
    type: 'support_response',
    label: 'Support Response',
    icon: '🎧',
    purpose: 'Technical reply resolving edge cases without corporate boilerplate.',
    defaultTitle: 'Technical Issue Escalation Reply',
    guardianMapping: 'support_response',
  },
};

export class ScenarioLabEngine {
  /**
   * Generates a complete ScenarioArtifact with Tri-State comparison and lineage
   */
  static generateScenario(
    scenarioType: ScenarioTemplateType,
    state: CanonicalBrandState
  ): ScenarioArtifact {
    const template = SCENARIO_TEMPLATES[scenarioType];
    const selectedWorld = state.positioningWorlds.find((w) => w.id === state.selectedWorldId);
    const brandName =
      state.creativeIdentity?.namingCandidates.find((n) => n.id === state.creativeIdentity?.selectedNameId)?.name ||
      'Kintra';
    const tagline =
      state.creativeIdentity?.taglineCandidates.find((t) => t.id === state.creativeIdentity?.selectedTaglineId)?.tagline ||
      'Deterministic Pull Request Intelligence';
    const targetAudience = selectedWorld?.targetAudience || 'Senior Software Engineers & Platform Architects';
    const differentiator = selectedWorld?.differentiator || 'AST-level deterministic analysis';
    const proofMechanism = selectedWorld?.proofMechanism || 'Inspectable AST telemetry logs';

    logger.info(`Scenario Lab generating scenario: ${scenarioType} for ${brandName}`);

    // 1. Synthesize RAW GENERATION (Typical ungrounded AI output)
    const rawGeneration = this.synthesizeRawGeneration(scenarioType, brandName, targetAudience);

    // 2. Synthesize BRAND-AWARE GENERATION (Grounded in approved Brand State)
    const brandAwareGeneration = this.synthesizeBrandAwareGeneration(
      scenarioType,
      brandName,
      tagline,
      targetAudience,
      differentiator,
      proofMechanism,
      state
    );

    // 3. Synthesize and Audit VALIDATED FINAL (Passes Consistency Guardian)
    const validatedFinal = this.synthesizeValidatedFinal(
      scenarioType,
      brandAwareGeneration.content,
      template.guardianMapping,
      targetAudience,
      state
    );

    // 4. Lineage Tracking
    const governingDecisionIds: string[] = [];
    if (selectedWorld) governingDecisionIds.push(selectedWorld.id);
    if (state.creativeIdentity?.selectedNameId) governingDecisionIds.push(state.creativeIdentity.selectedNameId);
    if (state.creativeIdentity?.selectedTaglineId) governingDecisionIds.push(state.creativeIdentity.selectedTaglineId);

    const lineage: ScenarioArtifactLineage = {
      originScenario: scenarioType,
      governingDecisionIds,
      worldId: selectedWorld?.id || 'world-default',
      identityArchetype: selectedWorld?.archetype || 'The Engineering Purist',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      id: `scen-${scenarioType}-${Date.now()}`,
      scenarioType,
      title: template.defaultTitle,
      targetAudience,
      rawGeneration,
      brandAwareGeneration,
      validatedFinal,
      lineage,
      status: validatedFinal.validationReport.passed ? 'approved' : 'audited',
    };
  }

  /**
   * Synthesizes RAW GENERATION (ungrounded LLM clichés)
   */
  private static synthesizeRawGeneration(
    type: ScenarioTemplateType,
    brandName: string,
    targetAudience: string
  ): ScenarioRawGeneration {
    switch (type) {
      case 'website_launch':
        return {
          content: `Supercharge your developer workflow with ${brandName} — the all-in-one 10x AI copilot that revolutionizes team synergy and guarantees 100% bug-free deployments!`,
          detectedFlaws: [
            'Banned marketing hype words ("supercharge", "10x", "copilot")',
            'Overused startup cliché ("all-in-one platform", "revolutionizes")',
            'Unsubstantiated absolute guarantee ("guarantees 100% bug-free deployments")',
            'Vague generic audience calibration with zero technical depth',
          ],
          description: 'Ungrounded generic LLM prompt lacking decision graph context and brand guardrails.',
        };

      case 'social_announcement':
        return {
          content: `Thrilled and excited to announce that we just dropped ${brandName}! 🎉🚀 It's the most game-changing AI platform out there. Take your business to the next level today!`,
          detectedFlaws: [
            'Excessive decorative emoji and hype tone ("Thrilled and excited", "🚀")',
            'Generic startup trope ("game-changing", "take your business to the next level")',
            'Complete absence of problem framing or technical mechanism',
          ],
          description: 'Standard synthetic social post devoid of authentic brand perspective.',
        };

      case 'onboarding_screen':
        return {
          content: `Welcome to ${brandName}! Sit back and relax while our autonomous magic AI bot takes over your code and does everything for you in seconds.`,
          detectedFlaws: [
            'Patronizing framing ("Sit back and relax", "magic AI")',
            'Direct contradiction of deterministic human-in-the-loop control ("bot takes over everything")',
            'No inspectable configuration or setup instructions',
          ],
          description: 'Dangerous black-box automation pitch that repels security-conscious engineers.',
        };

      case 'sales_email':
        return {
          content: `Hi there, Hope you're crushing it! I noticed your team builds tools for ${targetAudience}. Do you want to 10x your output and eliminate all bugs forever? Let's hop on a quick 15-min chat next week!`,
          detectedFlaws: [
            'High-pressure spam tone ("crushing it", "hop on a quick 15-min chat")',
            'Unrealistic promise ("eliminate all bugs forever")',
            'Completely wrong persona calibration for senior technical buyers',
          ],
          description: 'Aggressive boilerplate SDR cadence lacking credibility or problem specificity.',
        };

      case 'investor_pitch':
        return {
          content: `${brandName} is the Uber for software security. We combine Generative AI, Big Data, and the Blockchain to build an unstoppable defensible moat with limitless TAM.`,
          detectedFlaws: [
            'Empty analogy ("Uber for software security")',
            'Buzzword soup ("Blockchain", "Big Data", "Generative AI")',
            'Zero defensible proof mechanism or unit economics grounding',
          ],
          description: 'Hallucinated VC pitch that fails technical due diligence within 30 seconds.',
        };

      case 'advertisement':
        return {
          content: `Tired of slow coding? Try ${brandName}. Click here to revolutionize your entire company's developer velocity instantly!`,
          detectedFlaws: [
            'Lazy clickbait format ("Click here to revolutionize")',
            'Shallow problem statement ("slow coding")',
            'No mention of architectural code safety or pull request reviews',
          ],
          description: 'Generic banner ad copy that generates high bounce rates.',
        };

      case 'support_response':
        return {
          content: `Dear customer, We are deeply sorry for any inconvenience caused. Our apologies! Please rest assured our team is working hard to resolve this immediately.`,
          detectedFlaws: [
            'Excessive corporate subservience and hollow apologies',
            'Zero actionable diagnostic information or telemetry links',
            'Contradicts the direct engineering problem-solving ethos',
          ],
          description: 'Impersonal corporate call-center boilerplate.',
        };
    }
  }

  /**
   * Synthesizes BRAND-AWARE GENERATION (grounded in approved decisions)
   */
  private static synthesizeBrandAwareGeneration(
    type: ScenarioTemplateType,
    brandName: string,
    tagline: string,
    targetAudience: string,
    differentiator: string,
    proofMechanism: string,
    state: CanonicalBrandState
  ): ScenarioBrandAwareGeneration {
    const toneDescription =
      state.creativeIdentity?.personalityTraits?.map((t) => t.name).join(', ') ||
      'Direct, unadorned engineering precision';

    const isSecurityOrDemo =
      state.metadata?.isDemoProject ||
      state.selectedWorldId === 'world-purist' ||
      /pull\s*request|sast|linter|security|ast|code\s*review/i.test(differentiator || '') ||
      /pull\s*request|sast|linter|security|ast|code\s*review/i.test(proofMechanism || '') ||
      /pull\s*request|sast|linter|security|ast|code\s*review/i.test(tagline || '');

    if (isSecurityOrDemo) {
      switch (type) {
        case 'website_launch':
          return {
            content: `${tagline}.\n\n${brandName} runs ${differentiator} on every code change before merge. Stop relying on fuzzy LLM summaries; verify structural diff invariants with ${proofMechanism}.`,
            alignedDecisions: [
              `Audience: Explicitly crafted for ${targetAudience}`,
              `Differentiator: ${differentiator}`,
              `Proof Mechanism: ${proofMechanism}`,
              `Tone: ${toneDescription}`,
            ],
            description: 'Directly grounded in the approved Positioning World and Voice System.',
          };

        case 'social_announcement':
          return {
            content: `Fuzzy code summaries don't catch silent logic flaws. Today we are launching ${brandName}: deterministic pull request intelligence powered by ${differentiator}.\n\nInspect your first repository telemetry at ${brandName.toLowerCase()}.dev.`,
            alignedDecisions: [
              'Avoids all hype adjectives and vanity emojis',
              `Articulates the sacrifice: Rejects speculative AI wrappers in favor of ${proofMechanism}`,
              'Direct call to action to inspect real technical telemetry',
            ],
            description: 'Authentic practitioner broadcast honoring the brand voice rules.',
          };

        case 'onboarding_screen':
          return {
            content: `Connect your GitHub repository. ${brandName} executes local AST syntax verification within your CI pipeline. Telemetry remains fully inspectable in your workflow runner with zero code egress.`,
            alignedDecisions: [
              'Empowers the engineer with transparent execution details',
              'Affirms the privacy and zero code-egress invariant',
              'Eliminates black-box automation anxiety',
            ],
            description: 'Technical onboarding copy respecting developer agency and security boundaries.',
          };

        case 'sales_email':
          return {
            content: `Subject: Eliminating pull request logic escapes in high-throughput repos\n\nI reviewed your team's open-source release velocity. Traditional linters miss multi-file semantic mutations, while generalist LLMs hallucinate false positives.\n\n${brandName} provides ${differentiator} with ${proofMechanism}. If you're auditing PR safety this quarter, here is the technical benchmark documentation.`,
            alignedDecisions: [
              `Calibrated specifically for ${targetAudience}`,
              'Offers peer-level technical documentation over sales pressure',
              'Identifies the exact problem trigger without sensationalism',
            ],
            description: 'Respectful, highly credible technical outreach to architectural decision makers.',
          };

        case 'investor_pitch':
          return {
            content: `${brandName} replaces probabilistic code guessers with deterministic semantic verification in the developer pull request lifecycle. As automated code generation explodes 10x, verifying correctness at merge becomes the mission-critical bottleneck. Our ${differentiator} provides verifiable guarantees backed by ${proofMechanism}.`,
            alignedDecisions: [
              'Grounds the market thesis in macroeconomic developer trends',
              'Defends the technical moat with deterministic AST architecture',
              'Presents unambiguous category leadership positioning',
            ],
            description: 'Rigorous strategic narrative ready for technical partner review.',
          };

        case 'advertisement':
          return {
            content: `Fuzzy summaries don't prevent production incidents. Run ${differentiator} on every pull request with ${brandName}. Inspect the AST diff telemetry.`,
            alignedDecisions: [
              'High-contrast contrarian hook against commodity AI bots',
              'Short, punchy technical vocabulary',
              'Affirms proof mechanism in under 25 words',
            ],
            description: 'High-signal developer advertisement emphasizing verification over speed.',
          };

        case 'support_response':
          return {
            content: `We analyzed the AST parser trace from your CI run #89412 using ${brandName}'s diagnostic engine. The issue stems from an unhandled conditional mutation in the TypeScript compiler pass. Here is the exact AST node diff and the patch: [Diff Trace].`,
            alignedDecisions: [
              'Zero corporate apology filler; immediate root-cause telemetry',
              'Provides concrete reproducible diff trace',
              'Reinforces the technical partner relationship',
            ],
            description: 'Surgical problem-solving that elevates technical support into a brand asset.',
          };
      }
    } else {
      const cleanSlug = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');

      switch (type) {
        case 'website_launch':
          return {
            content: `${tagline}.\n\n${brandName} delivers ${differentiator}. Engineered from first principles to solve persistent category challenges with ${proofMechanism}.`,
            alignedDecisions: [
              `Audience: Explicitly crafted for ${targetAudience}`,
              `Differentiator: ${differentiator}`,
              `Proof Mechanism: ${proofMechanism}`,
              `Tone: ${toneDescription}`,
            ],
            description: 'Directly grounded in the approved Positioning World and Voice System.',
          };

        case 'social_announcement':
          return {
            content: `Generic compromises fail when quality matters. Today we are launching ${brandName}: engineered around ${differentiator} and verified through ${proofMechanism}.\n\nExplore our architecture at ${cleanSlug}.com.`,
            alignedDecisions: [
              'Avoids superficial hype and vanity buzzwords',
              `Articulates the sacrifice: Prioritizes ${proofMechanism} over generic commodity features`,
              `Clear call to action targeted directly at ${targetAudience}`,
            ],
            description: 'Authentic practitioner broadcast honoring the brand voice rules.',
          };

        case 'onboarding_screen':
          return {
            content: `Welcome to ${brandName}. Your environment is calibrated for ${differentiator}. All workflows are governed by ${proofMechanism} to guarantee measurable outcomes.`,
            alignedDecisions: [
              'Empowers the user with transparent operational clarity',
              `Affirms the invariant of ${proofMechanism}`,
              'Eliminates workflow friction and uncertainty',
            ],
            description: 'High-clarity onboarding copy respecting user agency and brand integrity.',
          };

        case 'sales_email':
          return {
            content: `Subject: Introducing ${brandName}: ${differentiator}\n\nHi {{first_name}},\n\nIf you deal with the ongoing challenges of existing legacy alternatives, we built ${brandName} specifically for ${targetAudience}.\n\n${brandName} delivers ${differentiator} backed by ${proofMechanism}. If you are evaluating strategic improvements this quarter, here is our technical brief.`,
            alignedDecisions: [
              `Calibrated specifically for ${targetAudience}`,
              'Offers rigorous documentation over superficial sales pressure',
              'Identifies the core operational bottleneck without sensationalism',
            ],
            description: 'Respectful, highly credible outreach to key decision makers.',
          };

        case 'investor_pitch':
          return {
            content: `${brandName} redefines the standard for ${targetAudience}. While legacy incumbents rely on outdated, fragmented approaches, ${brandName} delivers ${differentiator} powered by ${proofMechanism}. We are turning systemic inefficiency into an enduring, defensible advantage.`,
            alignedDecisions: [
              'Grounds the market thesis in macroeconomic shifts',
              `Defends the defensible moat with ${proofMechanism}`,
              'Presents unambiguous category leadership positioning',
            ],
            description: 'Rigorous strategic narrative ready for institutional partner review.',
          };

        case 'advertisement':
          return {
            content: `Eliminate compromises with ${differentiator}. Experience ${brandName}, engineered exclusively for ${targetAudience}.`,
            alignedDecisions: [
              'High-contrast hook highlighting core differentiation',
              'Crisp, high-signal positioning',
              'Affirms value proposition in under 25 words',
            ],
            description: 'High-signal advertisement emphasizing verified differentiation over vanity.',
          };

        case 'support_response':
          return {
            content: `Hi there,\n\nWe investigated your inquiry using ${brandName}'s diagnostic telemetry. Grounded in our commitment to ${differentiator}, we isolated the root cause and verified the resolution with ${proofMechanism}.\n\nPlease let us know if you need any additional assistance.\n\nBest,\nThe ${brandName} Team`,
            alignedDecisions: [
              'Zero corporate fluff; immediate root-cause transparency',
              `Reinforces ${proofMechanism} during customer touchpoints`,
              'Upholds practitioner-level credibility',
            ],
            description: 'Rigorous problem-solving that elevates customer support into a brand asset.',
          };
      }
    }
  }

  /**
   * Synthesizes and Audits VALIDATED FINAL (Guarantees zero blocking findings)
   */
  private static synthesizeValidatedFinal(
    scenarioType: ScenarioTemplateType,
    brandAwareContent: string,
    guardianType: GuardianArtifactType,
    targetAudience: string,
    state: CanonicalBrandState
  ): ScenarioValidatedFinal {
    // Construct temporary BrandArtifact to run through ConsistencyGuardian
    let tempArtifact: BrandArtifact = {
      id: `scen-eval-${scenarioType}-${Date.now()}`,
      name: SCENARIO_TEMPLATES[scenarioType].defaultTitle,
      artifactType: guardianType,
      content: brandAwareContent,
      targetAudience,
      versionHistory: [
        {
          version: 1,
          content: brandAwareContent,
          editedAt: new Date().toISOString(),
          editedBy: 'user',
        },
      ],
      status: 'draft',
      isApproved: false,
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Run Consistency Guardian audit
    let report = ConsistencyGuardian.evaluateArtifact(tempArtifact, state);
    tempArtifact.validationReport = report;
    let repairedCount = 0;

    // If any blocking findings exist, apply suggested repairs
    if (!report.passed && report.findings.length > 0) {
      for (const finding of report.findings) {
        if (finding.status === 'open' && finding.suggestedRepair) {
          tempArtifact = ConsistencyGuardian.applyRepair(tempArtifact, finding.id);
          repairedCount++;
        }
      }

      // Re-audit with repairs applied
      report = ConsistencyGuardian.evaluateArtifact(tempArtifact, state);
    }

    return {
      content: tempArtifact.content,
      validationReport: report,
      lockedAt: report.passed ? new Date().toISOString() : undefined,
      repairedFindingsCount: repairedCount,
    };
  }

  /**
   * Applies an in-place repair to a ScenarioArtifact
   */
  static applyRepairToScenario(
    artifact: ScenarioArtifact,
    findingId: string,
    state: CanonicalBrandState
  ): ScenarioArtifact {
    const template = SCENARIO_TEMPLATES[artifact.scenarioType];

    const tempBrandArtifact: BrandArtifact = {
      id: artifact.id,
      name: artifact.title,
      artifactType: template.guardianMapping,
      content: artifact.validatedFinal.content,
      targetAudience: artifact.targetAudience,
      validationReport: artifact.validatedFinal.validationReport,
      versionHistory: [
        {
          version: artifact.lineage.version,
          content: artifact.validatedFinal.content,
          editedAt: artifact.lineage.updatedAt,
          editedBy: 'user',
        },
      ],
      status: 'draft',
      isApproved: false,
      isLocked: false,
      createdAt: artifact.lineage.createdAt,
      updatedAt: new Date().toISOString(),
    };

    const repairedArtifact = ConsistencyGuardian.applyRepair(tempBrandArtifact, findingId);
    const newReport = ConsistencyGuardian.evaluateArtifact(repairedArtifact, state);

    return {
      ...artifact,
      validatedFinal: {
        content: repairedArtifact.content,
        validationReport: newReport,
        lockedAt: newReport.passed ? new Date().toISOString() : undefined,
        repairedFindingsCount: artifact.validatedFinal.repairedFindingsCount + 1,
      },
      lineage: {
        ...artifact.lineage,
        version: artifact.lineage.version + 1,
        updatedAt: new Date().toISOString(),
      },
      status: newReport.passed ? 'approved' : 'audited',
    };
  }

  /**
   * Allows manual editing of the validated final content with re-audit
   */
  static manuallyEditScenario(
    artifact: ScenarioArtifact,
    newContent: string,
    state: CanonicalBrandState
  ): ScenarioArtifact {
    const template = SCENARIO_TEMPLATES[artifact.scenarioType];
    const tempBrandArtifact: BrandArtifact = {
      id: artifact.id,
      name: artifact.title,
      artifactType: template.guardianMapping,
      content: newContent,
      targetAudience: artifact.targetAudience,
      versionHistory: [
        {
          version: artifact.lineage.version + 1,
          content: newContent,
          editedAt: new Date().toISOString(),
          editedBy: 'user',
        },
      ],
      status: 'draft',
      isApproved: false,
      isLocked: false,
      createdAt: artifact.lineage.createdAt,
      updatedAt: new Date().toISOString(),
    };

    const newReport = ConsistencyGuardian.evaluateArtifact(tempBrandArtifact, state);

    return {
      ...artifact,
      validatedFinal: {
        content: newContent,
        validationReport: newReport,
        lockedAt: newReport.passed ? new Date().toISOString() : undefined,
        repairedFindingsCount: artifact.validatedFinal.repairedFindingsCount,
      },
      lineage: {
        ...artifact.lineage,
        version: artifact.lineage.version + 1,
        updatedAt: new Date().toISOString(),
      },
      status: newReport.passed ? 'approved' : 'audited',
    };
  }
}
