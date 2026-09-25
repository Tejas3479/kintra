import { PositioningWorld, DecisionNode, DecisionEdge } from '@/types/strategy';
import { IdeaBrief } from '@/types/brand';
import { EvidenceRecord } from '@/types/research';
import { ContradictionDetector } from './contradiction-detector';
import { logger } from '../logger';
import { getAIProvider } from '../ai-provider';
import { PositioningWorldsOutputSchema } from '../schemas/strategy-schemas';
import { getServerEnv } from '../env';

export class StrategyService {
  /**
   * Generates 3-5 strategically divergent Positioning Worlds
   */
  static generateWorlds(
    brief: IdeaBrief,
    evidenceRecords: EvidenceRecord[] = []
  ): PositioningWorld[] {
    logger.info('Generating divergent Positioning Worlds from IdeaBrief:', { briefId: brief.id });

    const evidenceIds = evidenceRecords.slice(0, 3).map((e) => e.id);

    // World A: The Engineering Purist (Zero Fluff, Surgical Precision)
    const worldA: PositioningWorld = {
      id: 'world-purist',
      title: 'The Engineering Purist',
      archetype: 'The Engineering Purist',
      targetAudience: 'Senior staff engineers, tech leads, and open-source maintainers.',
      problemFraming:
        'Noisy SAST linters spam pull requests with 20+ false alarms, training engineers to ignore security warnings completely.',
      valueProposition:
        'A deterministic, zero-fluff reviewer that only posts when a critical logic flaw is mathematically verifiable. Never more than 3 comments per PR.',
      differentiator:
        'Zero false alarms: Every finding includes an executable repro unit test demonstrating the exact bug.',
      categoryFraming: 'Deterministic Pull Request Intelligence',
      emotionalTerritory: 'Quiet technical mastery, unshakeable confidence, zero corporate theater.',
      proofMechanism: 'Synthesizes reproducible failing test cases directly inside GitHub comments.',
      supportingEvidenceIds: evidenceIds,
      assumptions: [
        'Engineers value high precision over exhaustive, noisy false alarms.',
        'Teams will pay a premium for a tool that promises to comment less often.',
      ],
      risks: [
        'May miss subtle stylistic issues that traditional linters would catch.',
        'Niche appeal limited to highly technical engineering cultures.',
      ],
      tradeoffs: {
        whatWeEmphasize: 'Absolute signal-to-noise ratio and verifiable proof.',
        whatWeSacrifice: 'Mass-market non-technical appeal and broad surface-level feature checklists.',
      },
      challenges: [
        {
          evaluatorRole: 'Contrarian',
          perspective: 'If you refuse to comment on low-severity warnings, compliance auditors will accuse you of being incomplete.',
          potentialTrap: 'Enterprise buyers often mandate 100% rule coverage even if engineers hate the noise.',
          unforgivingQuestion: 'How will you survive procurement when an auditor demands a 50-page PDF report?',
        },
        {
          evaluatorRole: 'Audience Advocate',
          perspective: 'Developers want fast merges, not a lecture from an AI bot.',
          potentialTrap: 'Even 3 comments can cause friction if developers feel judged.',
          unforgivingQuestion: 'Will developers feel empowered or micromanaged by a bot posting failing unit tests?',
        },
        {
          evaluatorRole: 'Competitive Challenger',
          perspective: 'GitHub and Snyk can easily adjust their threshold slider to filter out low-confidence warnings.',
          potentialTrap: 'Incumbents adding a "strict mode" toggle could neutralize your core differentiator.',
          unforgivingQuestion: 'What prevents GitHub Copilot from adding "repro test generation" directly into pull requests?',
        },
      ],
      status: 'candidate',
    };

    // World B: The Frictionless Velocity Partner (Speed & Flow)
    const worldB: PositioningWorld = {
      id: 'world-partner',
      title: 'The Frictionless Velocity Partner',
      archetype: 'The Frictionless Partner',
      targetAudience: 'High-velocity startup engineering teams shipping 10+ pull requests daily.',
      problemFraming:
        'Senior engineers spend 12 hours a week manually reviewing routine pull requests, creating release bottlenecks and burnout.',
      valueProposition:
        'An in-flow AI peer reviewer that pre-approves routine logic and summarizes diff risks so senior engineers can approve in 60 seconds.',
      differentiator:
        'Contextual 60-second review summaries and auto-drafted approval comments directly in Slack and GitHub.',
      categoryFraming: 'Continuous PR Velocity Accelerator',
      emotionalTerritory: 'Momentum, relief, ship-without-fear velocity.',
      proofMechanism: 'Tracks and displays median PR turnaround reduction from 8 hours down to 45 minutes.',
      supportingEvidenceIds: evidenceIds,
      assumptions: [
        'Teams are willing to delegate first-pass review to automated agents to protect senior developer focus.',
      ],
      risks: [
        'Risk of rubber-stamping if reviewers become over-reliant on the summary.',
      ],
      tradeoffs: {
        whatWeEmphasize: 'Turnaround speed, team shipping velocity, and developer happiness.',
        whatWeSacrifice: 'Ultra-strict compliance checklists and exhaustive security guarantees.',
      },
      challenges: [
        {
          evaluatorRole: 'Strategist',
          perspective: 'Speed alone is a weak moat; productivity tools suffer high churn unless tied to business continuity.',
          potentialTrap: 'If a major bug slips through an expedited review, the product gets blamed instantly.',
          unforgivingQuestion: 'What is your legal liability when a fast-tracked PR causes production downtime?',
        },
        {
          evaluatorRole: 'Contrarian',
          perspective: 'Review latency is often caused by ambiguous requirements, not slow reading of diffs.',
          potentialTrap: 'Faster PR reviews do not fix flawed product specifications.',
          unforgivingQuestion: 'Are you solving the real bottleneck or just accelerating the merge of questionable features?',
        },
      ],
      status: 'candidate',
    };

    // World C: The Sovereign Gatekeeper (Enterprise Compliance & Policy)
    const worldC: PositioningWorld = {
      id: 'world-gatekeeper',
      title: 'The Sovereign Gatekeeper',
      archetype: 'The Sovereign Gatekeeper',
      targetAudience: 'VP of Engineering, CISOs, and compliance managers in regulated tech (fintech, healthtech).',
      problemFraming:
        'AI code generation tools are flooding repositories with unverified external dependencies and logic hallucinations.',
      valueProposition:
        'The uncompromised policy enforcement gate that guarantees zero untested AI code enters production branches.',
      differentiator:
        'Cryptographic audit trail and zero-retention code privacy with immutable governance logs.',
      categoryFraming: 'AI-Era Code Governance & Policy Engine',
      emotionalTerritory: 'Impenetrable authority, institutional calm, verified compliance.',
      proofMechanism: 'SOC2 Type II verifiable compliance attestations generated on every git merge.',
      supportingEvidenceIds: evidenceIds,
      assumptions: [
        'Enterprise engineering leaders care more about avoiding catastrophic regulatory fines than developer merge speed.',
      ],
      risks: [
        'Developer friction and resistance if the gate blocks legitimate releases.',
      ],
      tradeoffs: {
        whatWeEmphasize: 'Institutional governance, regulatory defensibility, and data sovereignty.',
        whatWeSacrifice: 'Casual indie developer adoption and sub-minute frictionless setup.',
      },
      challenges: [
        {
          evaluatorRole: 'Audience Advocate',
          perspective: 'Engineers will aggressively bypass or work around any gatekeeper that slows down their deployment cadence.',
          potentialTrap: 'Shadow IT and repository forks to evade strict gatekeeper rules.',
          unforgivingQuestion: 'How do you prevent engineering mutiny when your gate blocks a Friday afternoon hotfix?',
        },
        {
          evaluatorRole: 'Competitive Challenger',
          perspective: 'Enterprise platforms like GitLab and SonarQube already own the compliance procurement relationship.',
          potentialTrap: 'Long 9-month enterprise sales cycles kill early startup runway.',
          unforgivingQuestion: 'How will you displace SonarQube when enterprise procurement already has a multi-year master agreement?',
        },
      ],
      status: 'candidate',
    };

    const isSecurity =
      brief.id === 'brief-prguard-1' ||
      /pull\s*request|sast|linter|security|ci\/cd|code\s*review/i.test(
        brief.context.industryOrCategory + ' ' + brief.problem.corePain + ' ' + brief.proposedValue.mechanicOrSolution
      );

    if (isSecurity) {
      return [worldA, worldB, worldC];
    }

    // Dynamic brief-derived worlds for offline / fallback execution
    const worldCustomA: PositioningWorld = {
      id: `world-purist-${Date.now()}`,
      title: 'The Uncompromising Purist',
      archetype: 'The Engineering Purist',
      targetAudience: brief.targetUser.primaryNiche,
      problemFraming: brief.problem.corePain,
      valueProposition: `${brief.proposedValue.keyBenefit}. Engineered with uncompromising standards and zero commodity shortcuts.`,
      differentiator: brief.proposedValue.unfairAdvantage,
      categoryFraming: `Craft-Grade ${brief.context.industryOrCategory}`,
      emotionalTerritory: 'Quiet technical mastery, unvarnished integrity, zero decorative theater.',
      proofMechanism: `Verifiable quality metrics delivering ${brief.proposedValue.keyBenefit}.`,
      supportingEvidenceIds: evidenceIds,
      assumptions: [
        `Target users in ${brief.context.industryOrCategory} will pay a premium for verified craftsmanship over cheap mass-market alternatives.`,
      ],
      risks: ['Niche appeal requiring ongoing education of mainstream buyers.'],
      tradeoffs: {
        whatWeEmphasize: 'Absolute craft purity, radical transparency, and highest execution standards.',
        whatWeSacrifice: 'Mass-market commodity volume and cheap promotional discounting.',
      },
      challenges: [
        {
          evaluatorRole: 'Contrarian',
          perspective: 'Mainstream buyers often prioritize convenience and low pricing over craft purity.',
          potentialTrap: 'Trapped in an ultra-niche boutique customer segment that limits venture scale.',
          unforgivingQuestion: `How will you expand beyond early adopters in ${brief.targetUser.primaryNiche} without compromising your core craft standards?`,
        },
        {
          evaluatorRole: 'Audience Advocate',
          perspective: 'Extreme purity can intimidate everyday consumers looking for a simple solution.',
          potentialTrap: 'Elitist brand tone alienating approachable potential advocates.',
          unforgivingQuestion: 'How do you welcome curious newcomers without diluting your strict craft positioning?',
        },
        {
          evaluatorRole: 'Competitive Challenger',
          perspective: 'Category giants will launch a faux-craft imitation with 10x your marketing budget.',
          potentialTrap: 'Incumbent co-opting craft terminology without bearing the cost of genuine sourcing.',
          unforgivingQuestion: 'What prevents mass-market incumbents from co-opting your positioning with superficial claims?',
        },
      ],
      status: 'candidate',
    };

    const worldCustomB: PositioningWorld = {
      id: `world-partner-${Date.now()}`,
      title: 'The Frictionless Partner',
      archetype: 'The Frictionless Partner',
      targetAudience: `Time-constrained customers seeking ${brief.proposedValue.keyBenefit} without tedious friction.`,
      problemFraming: `Legacy solutions in ${brief.context.industryOrCategory} require painful manual effort and fragmented tools.`,
      valueProposition: `The fastest, most seamless way to achieve ${brief.proposedValue.keyBenefit} in seconds.`,
      differentiator: `Single-step workflow solving ${brief.problem.corePain} directly in existing customer routines.`,
      categoryFraming: `Frictionless ${brief.context.industryOrCategory} Accelerator`,
      emotionalTerritory: 'Effortless flow, instant relief, reliable momentum.',
      proofMechanism: `Direct time-to-value benchmarks demonstrating measurable reduction in user friction.`,
      supportingEvidenceIds: evidenceIds,
      assumptions: [
        `Customers value immediate speed and ease-of-use above all other product attributes.`,
      ],
      risks: ['Commoditization pressure from fast-following copycats if technical moat is low.'],
      tradeoffs: {
        whatWeEmphasize: 'Instant setup, frictionless daily adoption, and immediate time-to-value.',
        whatWeSacrifice: 'Exhaustive edge-case customization and complex ceremonial procedures.',
      },
      challenges: [
        {
          evaluatorRole: 'Strategist',
          perspective: 'Convenience alone is a fragile moat; users will churn to whichever app is 5% cheaper.',
          potentialTrap: 'Competing purely on ease-of-use invites aggressive commoditization.',
          unforgivingQuestion: 'What prevents well-funded competitors from cloning your frictionless user experience?',
        },
        {
          evaluatorRole: 'Contrarian',
          perspective: 'Advanced power users often demand manual fine-tuning and reject oversimplified workflows.',
          potentialTrap: 'Alienating high-LTV power users by enforcing an overly automated flow.',
          unforgivingQuestion: 'How will you retain advanced users when they outgrow your simplified workflow?',
        },
      ],
      status: 'candidate',
    };

    const worldCustomC: PositioningWorld = {
      id: `world-challenger-${Date.now()}`,
      title: 'The Rebellious Challenger',
      archetype: 'The Rebellious Challenger',
      targetAudience: `Frustrated users fed up with incumbent monopolies in ${brief.context.industryOrCategory}.`,
      problemFraming: `Incumbent platforms exploit customer lock-in with inflated pricing and mediocre service.`,
      valueProposition: `Tearing down the outdated conventions of ${brief.context.industryOrCategory} with radical transparency and customer sovereignty.`,
      differentiator: `Open, fair, customer-aligned economics with zero hidden fees or lock-in traps.`,
      categoryFraming: `Next-Generation ${brief.context.industryOrCategory} Alternative`,
      emotionalTerritory: 'Bold defiance, authentic community, unvarnished truth.',
      proofMechanism: `Open-ledger transparency and public customer bill-of-rights.`,
      supportingEvidenceIds: evidenceIds,
      assumptions: [
        `Market dissatisfaction with legacy players has reached a tipping point, creating strong demand for a rebellious alternative.`,
      ],
      risks: [
        'Risk of brand perception being defined purely by opposition rather than enduring standalone value.',
      ],
      tradeoffs: {
        whatWeEmphasize: 'Radical customer alignment, transparent pricing, and anti-establishment boldness.',
        whatWeSacrifice: 'Comfortable legacy enterprise distribution and conservative corporate partnerships.',
      },
      challenges: [
        {
          evaluatorRole: 'Audience Advocate',
          perspective: 'Outrage and rebellion generate clicks, but long-term retention requires undeniable utility.',
          potentialTrap: 'Becoming an exhausting protest brand that customers abandon once the novelty fades.',
          unforgivingQuestion: 'What is your product moat once the novelty of attacking incumbents wears off?',
        },
        {
          evaluatorRole: 'Competitive Challenger',
          perspective: 'Incumbents have deep balance sheets to match pricing cuts or launch predatory retaliation.',
          potentialTrap: 'Getting dragged into a price war with an incumbent who has 100x your capital.',
          unforgivingQuestion: 'How will you survive if the dominant incumbent slashes prices to starve your runway?',
        },
      ],
      status: 'candidate',
    };

    return [worldCustomA, worldCustomB, worldCustomC];
  }

  /**
   * Generates 3-5 strategically divergent Positioning Worlds asynchronously using AI (Gemini)
   * with deterministic fallback for offline/demo reliability.
   */
  static async generateWorldsAsync(
    brief: IdeaBrief,
    evidenceRecords: EvidenceRecord[] = []
  ): Promise<PositioningWorld[]> {
    logger.info('Generating Positioning Worlds asynchronously:', { briefId: brief.id });

    const env = getServerEnv();
    if (env.isDemoMode || !env.geminiApiKey) {
      return this.generateWorlds(brief, evidenceRecords);
    }

    try {
      const provider = getAIProvider();
      const prompt = `Synthesize 3 divergent, high-contrast Positioning Worlds for the following startup Idea Brief.

IDEA BRIEF CONTEXT:
- Problem Core Pain: "${brief.problem.corePain}"
- Who Suffers: "${brief.problem.whoSuffers}"
- Trigger Event: "${brief.problem.triggerEvent}"
- Target User Primary Niche: "${brief.targetUser.primaryNiche}"
- Current Workarounds: ${brief.targetUser.currentWorkarounds.join(', ')}
- Industry / Category: "${brief.context.industryOrCategory}"
- Proposed Solution: "${brief.proposedValue.mechanicOrSolution}"
- Key Benefit: "${brief.proposedValue.keyBenefit}"
- Unfair Advantage: "${brief.proposedValue.unfairAdvantage}"

EVIDENCE RECORDS:
${evidenceRecords.slice(0, 3).map((e) => `- ${e.publisher}: ${e.extractedClaim}`).join('\n') || 'No external records provided.'}

INSTRUCTIONS:
Generate 3 distinct, highly divergent Positioning Worlds.
Each world MUST:
1. Select one of the 5 archetypes: 'The Rebellious Challenger', 'The Engineering Purist', 'The Frictionless Partner', 'The Sovereign Gatekeeper', 'The Human-Centric Mentor'.
2. Make distinct strategic tradeoffs with explicit 'whatWeEmphasize' and 'whatWeSacrifice' (the sacrifice must be painful and genuine).
3. Include 2-3 tough challenges with evaluatorRole ('Contrarian', 'Audience Advocate', 'Competitive Challenger'), perspective, potentialTrap, and an unforgivingQuestion.
4. Set status: 'candidate'.
5. Include id starting with 'world-'.`;

      const result = await provider.generateStructured(
        prompt,
        PositioningWorldsOutputSchema,
        'You are an elite Brand Strategist and Positioning Architect. Generate high-contrast, deeply strategic positioning options for startups.'
      );

      if (result.success && result.data && result.data.worlds.length >= 3) {
        return result.data.worlds;
      }
    } catch (err) {
      logger.warn('AI Positioning Worlds generation failed, falling back to deterministic generation:', {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    return this.generateWorlds(brief, evidenceRecords);
  }

  /**
   * Commits a selected Positioning World into the canonical Decision Graph
   */
  static commitWorldToDecisionGraph(
    selectedWorld: PositioningWorld,
    allCandidateWorlds: PositioningWorld[],
    version = 1
  ): { node: DecisionNode; edges: DecisionEdge[] } {
    const rejectedWorlds = allCandidateWorlds
      .filter((w) => w.id !== selectedWorld.id)
      .map((w) => ({
        id: w.id,
        title: w.title,
        whyRejected:
          w.rejectionReason ||
          `Rejected in favor of ${selectedWorld.title} (${selectedWorld.tradeoffs.whatWeEmphasize}).`,
      }));

    const node: DecisionNode = {
      id: `decision-world-${Date.now()}`,
      category: 'positioning_world',
      title: `Selected Brand Strategy: ${selectedWorld.title}`,
      approvedValue: selectedWorld.valueProposition,
      rationale: `Selected ${selectedWorld.archetype}. We explicitly choose to emphasize ${selectedWorld.tradeoffs.whatWeEmphasize} while sacrificing ${selectedWorld.tradeoffs.whatWeSacrifice}.`,
      evidenceIds: selectedWorld.supportingEvidenceIds,
      rejectedAlternatives: rejectedWorlds,
      tradeoff: selectedWorld.tradeoffs.whatWeSacrifice,
      dependsOn: ['brief-baseline'],
      governs: ['naming_territory', 'voice_sliders', 'hero_headline'],
      status: 'approved',
      approvedAt: new Date().toISOString(),
      version,
    };

    const edges: DecisionEdge[] = [
      {
        id: `edge-brief-to-world-${Date.now()}`,
        source: 'brief-baseline',
        target: node.id,
        relation: 'supports',
      },
    ];

    return { node, edges };
  }

  /**
   * Runs contradiction checks across all candidate or active worlds
   */
  static auditWorlds(worlds: PositioningWorld[], evidence: EvidenceRecord[]) {
    return worlds.flatMap((w) => ContradictionDetector.auditPositioningWorld(w, evidence));
  }
}
