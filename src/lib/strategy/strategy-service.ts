import { PositioningWorld, DecisionNode, DecisionEdge } from '@/types/strategy';
import { IdeaBrief } from '@/types/brand';
import { EvidenceRecord } from '@/types/research';
import { ContradictionDetector } from './contradiction-detector';
import { logger } from '../logger';

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

    return [worldA, worldB, worldC];
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
