import { z } from 'zod';
import { getServerEnv } from './env';
import { logger } from './logger';
import { DEMO_BRAND_PRGUARD } from '@/fixtures/demo-brands';
import {
  IntakeExtractionOutputSchema,
  NextAdaptiveQuestionOutputSchema,
  IdeaBriefSchema,
} from './schemas/brand-schemas';
import { PositioningWorldsOutputSchema } from './schemas/strategy-schemas';
import { IdentitySynthesisOutputSchema } from './schemas/identity-schemas';


export interface AIServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    type: 'parse_error' | 'timeout' | 'provider_error';
    message: string;
    retryable: boolean;
  };
  metadata: {
    model: string;
    latencyMs: number;
    isFallback: boolean;
    retries: number;
  };
}

export interface AIProvider {
  generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    systemPrompt?: string
  ): Promise<AIServiceResult<T>>;
}

function extractDomainSnippet(prompt: string, maxLen = 45): string {
  const cleaned = prompt
    .replace(/Analyze the following raw idea:?/gi, '')
    .replace(/Extract facts and unvalidated assumptions from the following founder idea:?/gi, '')
    .replace(/Synthesize divergent Positioning Worlds:?/gi, '')
    .replace(/Generate creative identity:?/gi, '')
    .replace(/Idea Brief:?/gi, '')
    .replace(/User Request:?/gi, '')
    .replace(/["\n\r]/g, ' ')
    .trim();
  const firstChunk = cleaned.split(/[.?!]/)[0]?.trim() || cleaned;
  const words = firstChunk.split(/\s+/).slice(0, 5).join(' ');
  return words.slice(0, maxLen).trim() || 'Modern Innovation';
}

function deriveRootWord(domain: string): string {
  const words = domain
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 3 &&
        !/^(with|from|that|this|about|into|over|your|their|platform|system|application|tool)$/i.test(w)
    );
  const chosen = words[0] || 'Venture';
  return chosen.charAt(0).toUpperCase() + chosen.slice(1).toLowerCase().replace(/[^a-zA-Z]/g, '');
}

/**
 * Deterministic Mock AI Provider
 * Provides realistic, intelligent responses for demo stability, tests, and offline runs
 */
export class MockAIProvider implements AIProvider {
  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _systemPrompt?: string
  ): Promise<AIServiceResult<T>> {
    const startTime = Date.now();
    const isSecurity =
      prompt.toLowerCase().includes('pull request') ||
      prompt.toLowerCase().includes('security') ||
      prompt.toLowerCase().includes('code review') ||
      prompt.includes('brief-prguard-1');
    const domainSnippet = extractDomainSnippet(prompt);
    const rootWord = deriveRootWord(domainSnippet);

    // Check which schema is being requested
    if ((schema as unknown) === IntakeExtractionOutputSchema || prompt.includes('intake') || prompt.includes('Extract facts')) {
      const mockData = isSecurity
        ? {
            extractedFacts: [
              {
                statement: 'Core product purpose identified: Pull request review intelligence and automated logic verification.',
                confidence: 0.95,
              },
              {
                statement: 'Founder is targeting rapid time-to-market without traditional agency overhead.',
                confidence: 0.9,
              },
              {
                statement: 'Value proposition relies on automated intelligence rather than manual service delivery.',
                confidence: 0.85,
              },
            ],
            unvalidatedAssumptions: [
              {
                claim: 'Target customers already experience this pain acutely and actively search for a software solution.',
                riskLevel: 'critical' as const,
                potentialConsequenceIfFalse: 'Product struggles with customer acquisition and high bounce rates.',
              },
              {
                claim: 'Users will trust an AI-driven workflow for strategic or high-consequence decisions.',
                riskLevel: 'medium' as const,
                potentialConsequenceIfFalse: 'Adoption stalls unless manual override and explanation controls are visible.',
              },
            ],
            initialQuestions: [
              {
                topic: 'audience' as const,
                question: 'Who is the exact individual that suffers most from this problem on a daily basis?',
                whyAsking: 'Clarifying the specific human avatar anchors the tone and messaging before choosing brand archetypes.',
                suggestedAnswers: [
                  'Senior DevOps and Platform Architects',
                  'Engineering Leads and Staff Engineers',
                  'Open Source Maintainers',
                ],
                answerType: 'hybrid' as const,
              },
              {
                topic: 'alternatives' as const,
                question: 'What is the current, painful workaround they use when your product is not available?',
                whyAsking: 'Every successful brand positions against a concrete enemy: either a competitor or a messy manual routine.',
                suggestedAnswers: [
                  'Noisy SAST linters spamming false alarms',
                  'Senior engineers spending 12h/week on manual reviews',
                  'Ignoring subtle race conditions until production incidents',
                ],
                answerType: 'choice' as const,
              },
            ],
          }
        : {
            extractedFacts: [
              {
                statement: `Core venture purpose identified: ${domainSnippet}.`,
                confidence: 0.95,
              },
              {
                statement: `Targeting high-conviction differentiation in the ${domainSnippet} space without legacy bloat.`,
                confidence: 0.9,
              },
              {
                statement: 'Value proposition delivers verified outcomes rather than generic uncalibrated claims.',
                confidence: 0.85,
              },
            ],
            unvalidatedAssumptions: [
              {
                claim: `Target customers in ${domainSnippet} experience acute friction with incumbent solutions.`,
                riskLevel: 'critical' as const,
                potentialConsequenceIfFalse: 'Product struggles with customer acquisition and high bounce rates.',
              },
              {
                claim: `Buyers will trust a modern specialized platform designed specifically for ${domainSnippet}.`,
                riskLevel: 'medium' as const,
                potentialConsequenceIfFalse: 'Adoption stalls unless manual override and explanation controls are visible.',
              },
            ],
            initialQuestions: [
              {
                topic: 'audience' as const,
                question: `Who is the primary individual or team that struggles most with current ${domainSnippet} alternatives?`,
                whyAsking: 'Clarifying the specific human avatar anchors the tone and messaging before choosing brand archetypes.',
                suggestedAnswers: [
                  `Specialized operators and practitioners in ${domainSnippet}`,
                  'Modern teams and business decision makers',
                  'Discerning end consumers',
                ],
                answerType: 'hybrid' as const,
              },
              {
                topic: 'alternatives' as const,
                question: 'What is the current, painful workaround they use when your solution is not available?',
                whyAsking: 'Every successful brand positions against a concrete enemy: either a legacy competitor or a messy manual routine.',
                suggestedAnswers: [
                  'Cobbling together generic fragmented tools',
                  'Paying high agency or consultant fees',
                  'Settling for poor quality and slow turnaround',
                ],
                answerType: 'choice' as const,
              },
            ],
          };

      return {
        success: true,
        data: schema.parse(mockData),
        metadata: {
          model: 'mock-deterministic-v1',
          latencyMs: Date.now() - startTime + 150,
          isFallback: true,
          retries: 0,
        },
      };
    }

    if ((schema as unknown) === NextAdaptiveQuestionOutputSchema || prompt.includes('adaptive_question')) {
      const mockNext = {
        hasMoreQuestions: false,
        reasonForCompletionOrNext: 'Sufficient context gathered across audience, alternatives, and value proposition.',
      };
      return {
        success: true,
        data: schema.parse(mockNext),
        metadata: {
          model: 'mock-deterministic-v1',
          latencyMs: Date.now() - startTime + 100,
          isFallback: true,
          retries: 0,
        },
      };
    }

    if ((schema as unknown) === IdeaBriefSchema || prompt.includes('Idea Brief')) {
      const mockBrief = isSecurity
        ? {
            ...DEMO_BRAND_PRGUARD.ideaBrief,
            id: `brief-${Date.now()}`,
            generatedAt: new Date().toISOString(),
          }
        : {
            id: `brief-${Date.now()}`,
            version: 1,
            problem: {
              corePain: `Current alternatives in ${domainSnippet} are fragmented, inconsistent, and lack modern craftsmanship.`,
              whoSuffers: `Practitioners, operators, and discerning customers in the ${domainSnippet} space.`,
              triggerEvent: 'When managing day-to-day operations or attempting to differentiate against mass-market commodity options.',
            },
            targetUser: {
              primaryNiche: `Forward-thinking teams and demanding customers seeking uncompromising excellence in ${domainSnippet}.`,
              currentWorkarounds: ['Generic mass-market providers', 'Fragmented manual routines', 'Uncalibrated DIY hacks'],
              buyingTrigger: 'Acute frustration with mediocre quality, hidden compromises, and generic experiences.',
            },
            context: {
              industryOrCategory: `${domainSnippet} Craft & Innovation`,
              marketDynamics: 'Fragmented category ripe for high-conviction, differentiated brand leadership.',
            },
            proposedValue: {
              mechanicOrSolution: `Purpose-built experience engineered specifically for the operational nuances of ${domainSnippet}.`,
              keyBenefit: 'Verifiable quality, effortless clarity, and zero status-quo compromises.',
              unfairAdvantage: 'Deep category dedication, authentic craft, and transparent execution standards.',
            },
            constraints: [
              `Never compromise on the core quality standard for ${domainSnippet}.`,
              'Maintain transparent pricing and authentic customer communication.',
              'Avoid generic corporate buzzwords and unverified claims.',
            ],
            assumptions: [
              {
                id: 'hyp-1',
                claim: `Target customers in ${domainSnippet} are willing to switch to a specialized provider for higher quality.`,
                riskLevel: 'critical' as const,
                potentialConsequenceIfFalse: 'Slower initial traction if customers prioritize low cost over quality.',
                status: 'untested' as const,
              },
              {
                id: 'hyp-2',
                claim: `A direct, craft-grade brand voice resonates better than generic corporate marketing in ${domainSnippet}.`,
                riskLevel: 'medium' as const,
                potentialConsequenceIfFalse: 'Brand tone may require calibration if audience prefers conventional corporate style.',
                status: 'untested' as const,
              },
            ],
            openQuestions: [],
            confidenceScore: 0.9,
            status: 'draft' as const,
            generatedAt: new Date().toISOString(),
          };

      return {
        success: true,
        data: schema.parse(mockBrief),
        metadata: {
          model: 'mock-deterministic-v1',
          latencyMs: Date.now() - startTime + 250,
          isFallback: true,
          retries: 0,
        },
      };
    }

    if ((schema as unknown) === PositioningWorldsOutputSchema || prompt.includes('Positioning Worlds') || prompt.includes('PositioningWorld')) {
      const isSecurity = prompt.toLowerCase().includes('pull request') || prompt.toLowerCase().includes('security') || prompt.toLowerCase().includes('code');
      const mockWorlds = isSecurity
        ? [
            {
              id: 'world-purist',
              title: 'The Engineering Purist',
              archetype: 'The Engineering Purist' as const,
              targetAudience: 'Senior staff engineers, tech leads, and open-source maintainers.',
              problemFraming: 'Noisy SAST linters spam pull requests with 20+ false alarms, training engineers to ignore security warnings completely.',
              valueProposition: 'A deterministic, zero-fluff reviewer that only posts when a critical logic flaw is mathematically verifiable. Never more than 3 comments per PR.',
              differentiator: 'Zero false alarms: Every finding includes an executable repro unit test demonstrating the exact bug.',
              categoryFraming: 'Deterministic Pull Request Intelligence',
              emotionalTerritory: 'Quiet technical mastery, unshakeable confidence, zero corporate theater.',
              proofMechanism: 'Synthesizes reproducible failing test cases directly inside GitHub comments.',
              supportingEvidenceIds: [],
              assumptions: ['Engineers value high precision over exhaustive, noisy false alarms.'],
              risks: ['May miss subtle stylistic issues that traditional linters catch.'],
              tradeoffs: {
                whatWeEmphasize: 'Absolute signal-to-noise ratio and verifiable proof.',
                whatWeSacrifice: 'Mass-market non-technical appeal and broad surface-level feature checklists.',
              },
              challenges: [
                {
                  evaluatorRole: 'Contrarian' as const,
                  perspective: 'If you refuse to comment on low-severity warnings, compliance auditors will accuse you of being incomplete.',
                  potentialTrap: 'Enterprise buyers often mandate 100% rule coverage even if engineers hate the noise.',
                  unforgivingQuestion: 'How will you survive procurement when an auditor demands a 50-page PDF report?',
                },
                {
                  evaluatorRole: 'Audience Advocate' as const,
                  perspective: 'Developers want fast merges, not a lecture from an AI bot.',
                  potentialTrap: 'Even 3 comments can cause friction if developers feel judged.',
                  unforgivingQuestion: 'Will developers feel empowered or micromanaged by a bot posting failing unit tests?',
                },
                {
                  evaluatorRole: 'Competitive Challenger' as const,
                  perspective: 'Incumbents like GitHub Copilot can easily adjust threshold sliders to suppress noise.',
                  potentialTrap: 'Incumbents adding a strict-mode toggle could neutralize your core differentiator.',
                  unforgivingQuestion: 'What prevents GitHub from shipping automated test repro generation inside pull requests?',
                },
              ],
              status: 'candidate' as const,
            },
            {
              id: 'world-partner',
              title: 'The Frictionless Velocity Partner',
              archetype: 'The Frictionless Partner' as const,
              targetAudience: 'High-velocity startup engineering teams shipping 10+ pull requests daily.',
              problemFraming: 'Senior engineers spend 12 hours a week manually reviewing routine pull requests, creating release bottlenecks and burnout.',
              valueProposition: 'An in-flow AI peer reviewer that pre-approves routine logic and summarizes diff risks so senior engineers can approve in 60 seconds.',
              differentiator: 'Contextual 60-second review summaries and auto-drafted approval comments directly in Slack and GitHub.',
              categoryFraming: 'Continuous PR Velocity Accelerator',
              emotionalTerritory: 'Momentum, relief, ship-without-fear velocity.',
              proofMechanism: 'Tracks and displays median PR turnaround reduction from 8 hours down to 45 minutes.',
              supportingEvidenceIds: [],
              assumptions: ['Teams are willing to delegate first-pass review to automated agents to protect senior developer focus.'],
              risks: ['Risk of rubber-stamping if reviewers become over-reliant on the summary.'],
              tradeoffs: {
                whatWeEmphasize: 'Turnaround speed, team shipping velocity, and developer happiness.',
                whatWeSacrifice: 'Ultra-strict compliance checklists and exhaustive security guarantees.',
              },
              challenges: [
                {
                  evaluatorRole: 'Strategist' as const,
                  perspective: 'Speed alone is a weak moat; productivity tools suffer high churn unless tied to business continuity.',
                  potentialTrap: 'If a major bug slips through an expedited review, the product gets blamed instantly.',
                  unforgivingQuestion: 'What is your legal liability when a fast-tracked PR causes production downtime?',
                },
                {
                  evaluatorRole: 'Contrarian' as const,
                  perspective: 'Review latency is often caused by ambiguous requirements, not slow reading of diffs.',
                  potentialTrap: 'Faster PR reviews do not fix flawed product specifications.',
                  unforgivingQuestion: 'Are you solving the real bottleneck or just accelerating the merge of questionable features?',
                },
              ],
              status: 'candidate' as const,
            },
            {
              id: 'world-gatekeeper',
              title: 'The Sovereign Gatekeeper',
              archetype: 'The Sovereign Gatekeeper' as const,
              targetAudience: 'VP of Engineering, CISOs, and compliance managers in regulated tech (fintech, healthtech).',
              problemFraming: 'AI code generation tools are flooding repositories with unverified external dependencies and logic hallucinations.',
              valueProposition: 'The uncompromised policy enforcement gate that guarantees zero untested AI code enters production branches.',
              differentiator: 'Cryptographic audit trail and zero-retention code privacy with immutable governance logs.',
              categoryFraming: 'AI-Era Code Governance & Policy Engine',
              emotionalTerritory: 'Impenetrable authority, institutional calm, verified compliance.',
              proofMechanism: 'SOC2 Type II verifiable compliance attestations generated on every git merge.',
              supportingEvidenceIds: [],
              assumptions: ['Enterprise engineering leaders care more about avoiding catastrophic regulatory fines than developer merge speed.'],
              risks: ['Developer friction and resistance if the gate blocks legitimate releases.'],
              tradeoffs: {
                whatWeEmphasize: 'Institutional governance, regulatory defensibility, and data sovereignty.',
                whatWeSacrifice: 'Casual indie developer adoption and sub-minute frictionless setup.',
              },
              challenges: [
                {
                  evaluatorRole: 'Audience Advocate' as const,
                  perspective: 'Engineers will aggressively bypass or work around any gatekeeper that slows down their deployment cadence.',
                  potentialTrap: 'Shadow IT and repository forks to evade strict gatekeeper rules.',
                  unforgivingQuestion: 'How do you prevent engineering mutiny when your gate blocks a Friday afternoon hotfix?',
                },
                {
                  evaluatorRole: 'Competitive Challenger' as const,
                  perspective: 'Enterprise platforms like GitLab and SonarQube already own the compliance procurement relationship.',
                  potentialTrap: 'Long 9-month enterprise sales cycles kill early startup runway.',
                  unforgivingQuestion: 'How will you displace SonarQube when enterprise procurement already has a multi-year master agreement?',
                },
              ],
              status: 'candidate' as const,
            },
          ]
        : [
            {
              id: 'world-purist',
              title: `The Uncompromising ${rootWord} Purist`,
              archetype: 'The Engineering Purist' as const,
              targetAudience: `Discerning practitioners and power users seeking master-grade excellence in ${domainSnippet}.`,
              problemFraming: `Mass-market options in ${domainSnippet} cut corners on craft and reliability, delivering commoditized experiences.`,
              valueProposition: `Surgical dedication to verifiable quality, radical transparency, and precision execution standards for ${domainSnippet}.`,
              differentiator: `Direct unvarnished provenance and rigorous standards purpose-built for ${domainSnippet}.`,
              categoryFraming: `Craft-Grade ${rootWord} Specialization`,
              emotionalTerritory: 'Quiet technical mastery, unvarnished integrity, zero decorative theater.',
              proofMechanism: `Auditable performance metrics and verified outcomes with zero intermediary compromises.`,
              supportingEvidenceIds: [],
              assumptions: [`Customers in ${domainSnippet} will pay for verifiable craftsmanship over uncalibrated mass convenience.`],
              risks: ['Niche appeal requiring ongoing education of mainstream buyers.'],
              tradeoffs: {
                whatWeEmphasize: 'Uncompromising craft purity and radical transparency.',
                whatWeSacrifice: 'Mass-market commodity volume and cheap promotional discounting.',
              },
              challenges: [
                {
                  evaluatorRole: 'Contrarian' as const,
                  perspective: 'Most mainstream customers prioritize quick convenience and lower price over deep craft.',
                  potentialTrap: 'Trapped in a tiny boutique niche that limits growth velocity.',
                  unforgivingQuestion: `Can you build a defensible, scalable venture selling exclusively to ${domainSnippet} purists?`,
                },
                {
                  evaluatorRole: 'Audience Advocate' as const,
                  perspective: 'Purism often intimidates beginner and intermediate buyers.',
                  potentialTrap: 'Elitist brand tone alienating approachable potential advocates.',
                  unforgivingQuestion: 'How do you welcome curious newcomers without diluting your strict craft standards?',
                },
                {
                  evaluatorRole: 'Competitive Challenger' as const,
                  perspective: `Category giants will launch a feature that mimics ${domainSnippet} with 10x your marketing budget.`,
                  potentialTrap: 'Incumbent co-opting terminology without bearing the operational discipline of genuine craft.',
                  unforgivingQuestion: 'How will you defend against large incumbents copying your surface-level claims?',
                },
              ],
              status: 'candidate' as const,
            },
            {
              id: 'world-partner',
              title: `The Frictionless ${rootWord} Partner`,
              archetype: 'The Frictionless Partner' as const,
              targetAudience: `Demanding professionals who need high-performance outcomes in ${domainSnippet} without operational friction.`,
              problemFraming: `Existing approaches to ${domainSnippet} demand complex setup, manual oversight, and tedious configuration.`,
              valueProposition: 'Effortless, streamlined access to exceptional quality tailored to modern workflow velocity.',
              differentiator: `Pre-calibrated, single-step integration engineered specifically for ${domainSnippet}.`,
              categoryFraming: `Accessible Modern ${rootWord} Platform`,
              emotionalTerritory: 'Effortless calm, seamless routine, reliable satisfaction.',
              proofMechanism: 'Zero-overhead calibration guaranteeing consistent high-fidelity results every single time.',
              supportingEvidenceIds: [],
              assumptions: [`Operators want top-tier results in ${domainSnippet} without cumbersome manual setup rituals.`],
              risks: ['Perception of convenience eroding premium positioning.'],
              tradeoffs: {
                whatWeEmphasize: 'Frictionless workflow integration and operational convenience.',
                whatWeSacrifice: 'Complex manual customization and elaborate ceremonial rituals.',
              },
              challenges: [
                {
                  evaluatorRole: 'Strategist' as const,
                  perspective: 'Convenience products face constant commoditization from cheap instant substitutes.',
                  potentialTrap: 'Compromising too much on the core depth to maintain convenience.',
                  unforgivingQuestion: 'What prevents low-end competitors from undercutting your unit economics?',
                },
                {
                  evaluatorRole: 'Contrarian' as const,
                  perspective: 'True domain connoisseurs demand deep manual control and transparency.',
                  potentialTrap: 'Losing high-reputation early adopters who want granular knobs.',
                  unforgivingQuestion: 'Will you lose high-conviction power users by over-simplifying the interface?',
                },
              ],
              status: 'candidate' as const,
            },
            {
              id: 'world-challenger',
              title: `The Open ${rootWord} Challenger`,
              archetype: 'The Rebellious Challenger' as const,
              targetAudience: `Forward-thinking operators fed up with closed proprietary ecosystems and vendor lock-in in ${domainSnippet}.`,
              problemFraming: `Legacy incumbents in ${domainSnippet} lock customers into opaque black boxes with inflated renewal pricing.`,
              valueProposition: 'Democratizing transparent, modern workflows with open standards and community-first empowerment.',
              differentiator: 'Radical openness and transparent pricing with zero proprietary lock-in.',
              categoryFraming: `Decentralized Modern ${rootWord} Movement`,
              emotionalTerritory: 'Bold defiance, authentic community, unfiltered truth.',
              proofMechanism: 'Open architecture, transparent benchmarks, and auditable metrics published openly.',
              supportingEvidenceIds: [],
              assumptions: ['Modern buyers actively favor open, transparent alternatives over legacy corporate gatekeepers.'],
              risks: ['Antagonizing incumbent channel partners and legacy distributors.'],
              tradeoffs: {
                whatWeEmphasize: 'Radical openness and bold anti-establishment identity.',
                whatWeSacrifice: 'Traditional enterprise reseller deals and conservative corporate partnerships.',
              },
              challenges: [
                {
                  evaluatorRole: 'Audience Advocate' as const,
                  perspective: 'Rebellion attracts early attention but rarely sustains enterprise customer loyalty.',
                  potentialTrap: 'Becoming an exhausting protest brand rather than an enduring daily utility.',
                  unforgivingQuestion: 'How does your brand evolve when rebellion becomes yesterday’s novelty?',
                },
                {
                  evaluatorRole: 'Competitive Challenger' as const,
                  perspective: 'Incumbents can slash prices or launch open tiers to undercut your thesis.',
                  potentialTrap: 'Mainstream buyers accepting free incumbent tiers over independent challengers.',
                  unforgivingQuestion: 'Can open transparency alone beat massive enterprise distribution?',
                },
              ],
              status: 'candidate' as const,
            },
          ];

      return {
        success: true,
        data: schema.parse({ worlds: mockWorlds }),
        metadata: {
          model: 'mock-deterministic-v1',
          latencyMs: Date.now() - startTime + 200,
          isFallback: true,
          retries: 0,
        },
      };
    }

    if ((schema as unknown) === IdentitySynthesisOutputSchema || prompt.includes('Creative Identity') || prompt.includes('IdentitySynthesis')) {
      const isSecurity =
        prompt.toLowerCase().includes('pull request') ||
        prompt.toLowerCase().includes('security') ||
        prompt.toLowerCase().includes('code review') ||
        prompt.includes('brief-prguard-1');
      const mockIdentityOutput = isSecurity
        ? {
            personalityTraits: [
              {
                id: 'trait-rigor',
                name: 'Deterministic Rigor',
                definition: 'Refuses to speculate, hedge, or output probabilistic hunches. Speaks only in mathematically verifiable facts.',
                audienceRelevance: 'Senior engineers distrust vague AI claims.',
                strategicBasis: 'Anchored in zero false alarm differentiator.',
                behaviorExamples: [
                  'Synthesizes an executable repro test case before filing any PR review comment.',
                  'Limits comments to high-severity logic bugs; suppresses subjective styling debates.',
                ],
                traitToAvoid: 'Never post speculative warnings with "might", "could possibly", or "consider checking".',
                confidence: 0.95,
              },
              {
                id: 'trait-candor',
                name: 'Surgical Candor',
                definition: 'Communicates with zero corporate theater, zero decorative adjectives, and total transparency.',
                audienceRelevance: 'Senior engineers appreciate concise technical respect over patronizing encouragement.',
                strategicBasis: 'Derived from quiet technical mastery.',
                behaviorExamples: [
                  'Declares exact failing line and root cause in single sentence.',
                  'Aknowledges tool limitations and out-of-scope files without defensive rhetoric.',
                ],
                traitToAvoid: 'Never use cheerful cheerleader filler like "Awesome work rockstar!" or "Almost there!"',
                confidence: 0.92,
              },
              {
                id: 'trait-pragmatism',
                name: 'Defensible Pragmatism',
                definition: 'Optimizes for production stability and team shipping momentum over academic theoretical perfection.',
                audienceRelevance: 'High-velocity teams cannot tolerate blockers on harmless style decisions.',
                strategicBasis: 'Aligns with team velocity and focus protection.',
                behaviorExamples: [
                  'Focuses exclusively on critical regressions, race conditions, and contract breaches.',
                ],
                traitToAvoid: 'Never block a production release for whitespace or subjective formatting preference.',
                confidence: 0.88,
              },
            ],
            namingTerritories: [
              {
                id: 'territory-1',
                name: 'Structural Logic & Verifiable Axioms',
                semanticLogic: 'Constructed from morphemes of formal logic, invariants, and deterministic computation.',
                phoneticLogic: 'Hard plosives (K, T, X) combined with crisp dental stops.',
                emotionalEffect: 'Instills feelings of unshakeable structural integrity and mathematical precision.',
                risks: 'Could sound overly austere if paired with cold visual framing.',
                categoryFit: 'High resonance with senior systems engineers.',
                distinctivenessConsiderations: 'Rejects startup tropes in favor of classical mathematical stems.',
              },
              {
                id: 'territory-2',
                name: 'Continuous Kinetic Verification',
                semanticLogic: 'Derived from velocity, active rails, and continuous automated guardrails.',
                phoneticLogic: 'Flowing sibilants balanced by definitive final consonants.',
                emotionalEffect: 'Communicates rapid momentum without sacrificing safety.',
                risks: 'Risk of blurring into generic DevOps tooling if too broad.',
                categoryFit: 'High resonance with startup teams shipping multiple times per day.',
                distinctivenessConsiderations: 'Rejects "-ify" and "-ly" suffixes in favor of grounded stems.',
              },
            ],
            rawNames: [
              {
                name: 'Kintra',
                territoryName: 'Continuous Kinetic Verification',
                rationale: 'Derived from kinetic and track. Expresses continuous momentum with deterministic rails.',
                semantic: 'Kinetic, track, integrity, focus.',
                pronunciation: 'KIN-truh',
                ambiguity: 'Clean disyllable; no conflicting homophones.',
                strategicFit: 'Embodies zero-fluff deterministic PR review engine.',
              },
              {
                name: 'AxiomPR',
                territoryName: 'Structural Logic & Verifiable Axioms',
                rationale: 'Axiom implies self-evident, mathematically established truth requiring no further proof.',
                semantic: 'Self-evident truth, formal logic, foundational certainty.',
                pronunciation: 'AK-see-um P-R',
                ambiguity: 'Contains explicit "PR" suffix; binds tightly to pull request category.',
                strategicFit: 'Communicates that review comments are mathematical axioms, not opinions.',
              },
              {
                name: 'Verifix',
                territoryName: 'Structural Logic & Verifiable Axioms',
                rationale: 'Portmanteau of verification and fix. Clear, punchy, diagnostic.',
                semantic: 'Verification, precision repair, deterministic check.',
                pronunciation: 'VER-ih-fiks',
                ambiguity: 'Slightly functional; risk of sounding like a static utility.',
                strategicFit: 'Promises that every finding comes with a verified reproducible fix.',
              },
              {
                name: 'PrismLogic',
                territoryName: 'Continuous Kinetic Verification',
                rationale: 'Separates dense, tangled code diffs into clean, observable constituent wavelengths.',
                semantic: 'Refraction, clarity, inspection, multi-spectrum analysis.',
                pronunciation: 'PRIZ-um LAH-jik',
                ambiguity: 'Two words; slightly longer URL footprint.',
                strategicFit: 'Highlights ability to expose hidden logic flaws through deep diff inspection.',
              },
              {
                name: 'ReviewOps',
                territoryName: 'Continuous Kinetic Verification',
                rationale: 'Attempts to frame PR review as an operational discipline like DevOps.',
                semantic: 'Operations, infrastructure, process automation.',
                pronunciation: 'Reh-view-AHPS',
                ambiguity: 'Contains overused suffix "-ops".',
                strategicFit: 'Functional baseline comparison name.',
              },
            ],
            taglineCandidates: [
              {
                tagline: 'Three comments or zero. Mathematically verifiable PR reviews.',
                strategicMechanism: 'Enforces maximum 3-comment signal threshold and reproducible test proof.',
                falsifiabilityScore: 0.96,
              },
              {
                tagline: 'Never more noise than the bug itself.',
                strategicMechanism: 'Articulates sacrifice of styling advice in favor of critical logic integrity.',
                falsifiabilityScore: 0.88,
              },
              {
                tagline: 'Deterministic pull request intelligence for teams that ship.',
                strategicMechanism: 'Frames the category precisely while affirming engineer velocity.',
                falsifiabilityScore: 0.84,
              },
            ],
            voiceSystem: {
              tonalSliders: {
                precision: 92,
                warmth: 35,
                authority: 85,
                energy: 60,
              },
              sentenceBehavior: {
                averageLength: 'concise' as const,
                voicePreference: 'active_direct' as const,
                cadenceDescription: 'Staccato declarations followed by verifiable code evidence.',
              },
              vocabulary: {
                preferredTerms: ['deterministic', 'verifiable', 'signal-to-noise', 'logic flaw', 'reproducible test'],
                technicalDensity: 'practitioner' as const,
                signaturePhrases: ['Executable proof attached.', 'Logic flaw isolated at line {n}.', 'No other warnings found.'],
              },
              bannedPatterns: ['supercharge your workflow', 'next-gen AI copilot', 'game-changer', 'seamless integration'],
              weSayVsWeAvoid: [
                {
                  weSay: 'Line 42 throws NullPointerException when payload is empty. Repro unit test attached.',
                  weAvoid: 'Hey team! Looks like there could maybe be a tiny bug here if you get a chance to check it out!',
                  why: 'Developers respect unambiguous diagnostic proof over conversational fluff.',
                },
                {
                  weSay: 'Zero logic flaws detected across 14 files. Ready to merge.',
                  weAvoid: 'Awesome job rockstar! Your code is looking super clean and sparkly!',
                  why: 'Eliminates patronizing cheerleader AI tropes that degrade tool credibility.',
                },
              ],
              examples: [
                {
                  channel: 'pr_comment' as const,
                  sampleText: '**Critical Logic Flaw Detected** (`src/auth/session.ts:88`)\nConcurrent session invalidation causes race condition under >50 req/sec.\n`npm test tests/auth-race.test.ts` fails with code 1.\nSuggested fix: Wrap token revocation in Redis transaction.',
                  annotation: 'Specific line, empirical repro command, actionable diff fix.',
                },
                {
                  channel: 'hero_copy' as const,
                  sampleText: 'The deterministic PR reviewer that only comments when it has proof.',
                  annotation: 'Immediate contrast against noisy SAST linters.',
                },
              ],
              channelAdaptations: {
                github_pr: 'High density, markdown code blocks, failing test reproduction snippet.',
                terminal_cli: 'Monospace ANSI summary, exit code 0 or 1, single-line error locator.',
                executive_summary: 'Turnaround latency reduction metrics and zero-false-alarm audit score.',
              },
            },
            visualMetaphors: ['Diff visualizers', 'Compiler AST trees', 'Clean monochrome terminal grids'],
            thingsToAvoid: ['Cutesy animated mascot bots', 'Neon gradient party mode', 'Drop shadows on cards'],
          }
        : {
            personalityTraits: [
              {
                id: 'trait-craft',
                name: 'Radical Integrity',
                definition: `Relentless dedication to authentic outcomes, transparent execution, and uncompromising standards in ${domainSnippet}.`,
                audienceRelevance: 'Discerning customers demand verified truth over marketing romance.',
                strategicBasis: `Derived from uncompromising purist differentiator for ${domainSnippet}.`,
                behaviorExamples: [
                  'Publishes auditable metrics and clear benchmarks with zero obfuscation.',
                  'Rejects cheap industrial shortcuts regardless of short-term margin pressure.',
                ],
                traitToAvoid: 'Never make exaggerated wellness, magical transformation, or uncalibrated hype claims.',
                confidence: 0.94,
              },
              {
                id: 'trait-lucidity',
                name: 'Direct Clarity',
                definition: 'Speaks clearly without pretentious jargon, gatekeeping rituals, or decorative corporate theater.',
                audienceRelevance: `Demanding buyers in ${domainSnippet} value accessible mastery and transparent honesty.`,
                strategicBasis: 'Rooted in accessible modern craftsmanship.',
                behaviorExamples: [
                  `Explains technical parameters, origin standards, and workflows in plain, descriptive language.`,
                ],
                traitToAvoid: 'Never demean or condescend to curious beginners.',
                confidence: 0.91,
              },
              {
                id: 'trait-respect',
                name: 'Quiet Defiance',
                definition: `Proudly challenges lazy commodity habits by demonstrating how exceptional honest innovation in ${domainSnippet} can be.`,
                audienceRelevance: 'Conscious operators want to align their daily tools with ethical integrity.',
                strategicBasis: 'Aligns with operational transparency proof mechanism.',
                behaviorExamples: [
                  'Showcases open benchmarks and transparent operational standards openly.',
                ],
                traitToAvoid: 'Never engage in smug moralizing or competitor bashing.',
                confidence: 0.89,
              },
            ],
            namingTerritories: [
              {
                id: 'territory-1',
                name: 'Elemental Provenance & Raw Essence',
                semanticLogic: `Rooted in core category fundamentals, transparent materials, and authentic origins for ${domainSnippet}.`,
                phoneticLogic: 'Deep earthen vowels anchored by crisp dental consonants.',
                emotionalEffect: 'Grounds the brand in timeless authenticity and honest foundation.',
                risks: 'May sound overly industrial if not balanced by modern typographic polish.',
                categoryFit: `High resonance with modern ${domainSnippet} practitioners.`,
                distinctivenessConsiderations: 'Rejects synthetic generic suffixes in favor of rooted nouns.',
              },
              {
                id: 'territory-2',
                name: 'Precision Craft & Modern Velocity',
                semanticLogic: 'Draws from operational discipline, repeatable engineering, and high-velocity workflow.',
                phoneticLogic: 'Balanced cadence with crisp final consonants.',
                emotionalEffect: 'Communicates deliberate mastery and repeatable excellence.',
                risks: 'Risk of sounding clinical if human warmth is not preserved.',
                categoryFit: 'High resonance with demanding operators and connoisseurs.',
                distinctivenessConsiderations: 'Avoids whimsical fantasy words in favor of tactile real-world terms.',
              },
            ],
            rawNames: [
              {
                name: `${rootWord}Craft`,
                territoryName: 'Precision Craft & Modern Velocity',
                rationale: `Combines the category root '${rootWord}' with deliberate artisan craftsmanship.`,
                semantic: `Deliberate craft, repeatable excellence, dedicated focus on ${domainSnippet}.`,
                pronunciation: `${rootWord.toUpperCase()}-kraft`,
                ambiguity: 'Clean disyllable with strong physical resonance.',
                strategicFit: `Signals uncompromising focus on craftsmanship and verifiable quality in ${domainSnippet}.`,
              },
              {
                name: `Vera${rootWord}`,
                territoryName: 'Elemental Provenance & Raw Essence',
                rationale: `Draws from Latin 'veritas' (truth/verifiable) prefixed to '${rootWord}'. Evokes transparent integrity.`,
                semantic: 'Truth, auditable standards, verified reality, zero false hype.',
                pronunciation: `VEH-ruh-${rootWord.toLowerCase()}`,
                ambiguity: 'Memorable brand mark with clear etymology.',
                strategicFit: `Frames product as the honest, transparent standard in ${domainSnippet}.`,
              },
              {
                name: `${rootWord}Pulse`,
                territoryName: 'Precision Craft & Modern Velocity',
                rationale: `Suggests real-time responsiveness and active, living momentum in ${domainSnippet}.`,
                semantic: 'Cadence, momentum, modern responsiveness, live feedback.',
                pronunciation: `${rootWord.toUpperCase()}-puls`,
                ambiguity: 'Direct and energetic.',
                strategicFit: 'Communicates high-velocity operational mastery.',
              },
              {
                name: `Nova${rootWord}`,
                territoryName: 'Elemental Provenance & Raw Essence',
                rationale: `Evokes a new generation of thinking, discarding legacy baggage in ${domainSnippet}.`,
                semantic: 'New standard, clarity, fresh perspective, modern dawn.',
                pronunciation: `NOH-vuh-${rootWord.toLowerCase()}`,
                ambiguity: 'Crisp and globally accessible.',
                strategicFit: 'Positions the brand as the modern challenger against sluggish incumbents.',
              },
            ],
            taglineCandidates: [
              {
                tagline: `Uncompromising craft. Zero compromises. Built for ${domainSnippet}.`,
                strategicMechanism: 'Enforces pure dedication and clear category craft sacrifice.',
                falsifiabilityScore: 0.93,
              },
              {
                tagline: 'Verifiable quality from first touch to delivery. No shortcuts.',
                strategicMechanism: 'Articulates auditable proof mechanism.',
                falsifiabilityScore: 0.91,
              },
              {
                tagline: 'Mastery in every detail. Built for the obsessed.',
                strategicMechanism: 'Anchors the uncompromising purist differentiator.',
                falsifiabilityScore: 0.88,
              },
            ],
            voiceSystem: {
              tonalSliders: {
                precision: 85,
                warmth: 65,
                authority: 80,
                energy: 60,
              },
              sentenceBehavior: {
                averageLength: 'balanced' as const,
                voicePreference: 'active_direct' as const,
                cadenceDescription: `Evocative, high-conviction description anchored by concrete variables in ${domainSnippet}.`,
              },
              vocabulary: {
                preferredTerms: ['verifiable', 'calibrated', 'provenance', 'clarity', 'uncompromising', rootWord.toLowerCase()],
                technicalDensity: 'practitioner' as const,
                signaturePhrases: [`Engineered for ${domainSnippet}.`, 'Crafted without compromise.', 'Auditable by design.'],
              },
              bannedPatterns: ['supercharge your workflow', 'magic button', 'game-changing revolution', 'guaranteed success in minutes'],
              weSayVsWeAvoid: [
                {
                  weSay: `Built specifically for ${domainSnippet}. Delivers verified outcomes with zero fluff.`,
                  weAvoid: 'Get ready for an explosion of mind-blowing transformation that will totally change your life!',
                  why: 'Honest precision builds enduring trust; hyperbolic marketing tropes degrade credibility.',
                },
                {
                  weSay: 'Transparent metrics, open standards, and direct accountability in every interaction.',
                  weAvoid: 'We care super deeply about disruptive synergies and holistic vibes!',
                  why: 'Real numbers and verifiable practices prove value far better than hollow slogans.',
                },
              ],
              examples: [
                {
                  channel: 'hero_copy' as const,
                  sampleText: `Dedicated to ${domainSnippet}. Built with mathematical precision and radical clarity.`,
                  annotation: 'Clear positioning emphasizing both domain integrity and execution craft.',
                },
                {
                  channel: 'social' as const,
                  sampleText: `We measured the outcome across 100 iterations: zero false steps, full audit trail. That is how ${domainSnippet} should be done.`,
                  annotation: 'Technical transparency demonstrating authentic passion.',
                },
              ],
              channelAdaptations: {
                packaging: 'Prominent specification details, verification seals, and batch markers.',
                social: 'Behind-the-scenes engineering logs and objective benchmark comparisons.',
                newsletter: 'In-depth practitioner insights and transparent product changelogs.',
              },
            },
            visualMetaphors: ['Architectural blueprints', 'High-contrast typography grids', 'Crisp tactile material surfaces'],
            thingsToAvoid: ['Cutesy cartoon mascot graphics', 'Chaotic neon gradient clutter', 'Generic stock corporate handshakes'],
          };

      return {
        success: true,
        data: schema.parse(mockIdentityOutput),
        metadata: {
          model: 'mock-deterministic-v1',
          latencyMs: Date.now() - startTime + 250,
          isFallback: true,
          retries: 0,
        },
      };
    }

    // Default fallback
    try {
      const parsed = schema.parse({});
      return {
        success: true,
        data: parsed,
        metadata: { model: 'mock-fallback', latencyMs: 50, isFallback: true, retries: 0 },
      };
    } catch {
      return {
        success: false,
        error: {
          type: 'parse_error',
          message: 'Mock provider could not synthesize empty mock for this schema.',
          retryable: false,
        },
        metadata: { model: 'mock-fallback', latencyMs: 50, isFallback: true, retries: 0 },
      };
    }
  }
}

// JSON Schema representations for Gemini 3.8 Flash constrained decoding
const SCHEMA_BLUEPRINTS: Record<string, object> = {
  IntakeExtraction: {
    type: 'OBJECT',
    properties: {
      extractedFacts: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            statement: { type: 'STRING' },
            confidence: { type: 'NUMBER' },
          },
          required: ['statement', 'confidence'],
        },
      },
      unvalidatedAssumptions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            claim: { type: 'STRING' },
            riskLevel: { type: 'STRING', enum: ['low', 'medium', 'critical'] },
            potentialConsequenceIfFalse: { type: 'STRING' },
          },
          required: ['claim', 'riskLevel', 'potentialConsequenceIfFalse'],
        },
      },
      initialQuestions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            topic: {
              type: 'STRING',
              enum: [
                'idea',
                'problem',
                'audience',
                'context',
                'alternatives',
                'value',
                'constraints',
                'desired_perception',
                'founder_intent',
              ],
            },
            question: { type: 'STRING' },
            whyAsking: { type: 'STRING' },
            suggestedAnswers: { type: 'ARRAY', items: { type: 'STRING' } },
            answerType: { type: 'STRING', enum: ['text', 'choice', 'hybrid'] },
          },
          required: ['topic', 'question', 'whyAsking', 'answerType'],
        },
      },
    },
    required: ['extractedFacts', 'unvalidatedAssumptions', 'initialQuestions'],
  },
  NextAdaptiveQuestion: {
    type: 'OBJECT',
    properties: {
      hasMoreQuestions: { type: 'BOOLEAN' },
      reasonForCompletionOrNext: { type: 'STRING' },
      nextQuestion: {
        type: 'OBJECT',
        properties: {
          topic: {
            type: 'STRING',
            enum: [
              'idea',
              'problem',
              'audience',
              'context',
              'alternatives',
              'value',
              'constraints',
              'desired_perception',
              'founder_intent',
            ],
          },
          question: { type: 'STRING' },
          whyAsking: { type: 'STRING' },
          suggestedAnswers: { type: 'ARRAY', items: { type: 'STRING' } },
          answerType: { type: 'STRING', enum: ['text', 'choice', 'hybrid'] },
        },
        required: ['topic', 'question', 'whyAsking', 'answerType'],
      },
    },
    required: ['hasMoreQuestions', 'reasonForCompletionOrNext'],
  },
  IdeaBrief: {
    type: 'OBJECT',
    properties: {
      id: { type: 'STRING' },
      version: { type: 'INTEGER' },
      problem: {
        type: 'OBJECT',
        properties: {
          corePain: { type: 'STRING' },
          whoSuffers: { type: 'STRING' },
          triggerEvent: { type: 'STRING' },
        },
        required: ['corePain', 'whoSuffers', 'triggerEvent'],
      },
      targetUser: {
        type: 'OBJECT',
        properties: {
          primaryNiche: { type: 'STRING' },
          currentWorkarounds: { type: 'ARRAY', items: { type: 'STRING' } },
          buyingTrigger: { type: 'STRING' },
        },
        required: ['primaryNiche', 'currentWorkarounds', 'buyingTrigger'],
      },
      context: {
        type: 'OBJECT',
        properties: {
          industryOrCategory: { type: 'STRING' },
          marketDynamics: { type: 'STRING' },
        },
        required: ['industryOrCategory', 'marketDynamics'],
      },
      proposedValue: {
        type: 'OBJECT',
        properties: {
          mechanicOrSolution: { type: 'STRING' },
          keyBenefit: { type: 'STRING' },
          unfairAdvantage: { type: 'STRING' },
        },
        required: ['mechanicOrSolution', 'keyBenefit', 'unfairAdvantage'],
      },
      constraints: { type: 'ARRAY', items: { type: 'STRING' } },
      assumptions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            claim: { type: 'STRING' },
            riskLevel: { type: 'STRING', enum: ['low', 'medium', 'critical'] },
            potentialConsequenceIfFalse: { type: 'STRING' },
            status: { type: 'STRING', enum: ['untested', 'confirmed', 'disproven', 'refined'] },
          },
          required: ['id', 'claim', 'riskLevel', 'potentialConsequenceIfFalse', 'status'],
        },
      },
      openQuestions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            topic: { type: 'STRING' },
            question: { type: 'STRING' },
            strategicImportance: { type: 'STRING', enum: ['essential', 'helpful', 'optional'] },
            whyItMatters: { type: 'STRING' },
            resolved: { type: 'BOOLEAN' },
          },
          required: ['id', 'topic', 'question', 'strategicImportance', 'whyItMatters', 'resolved'],
        },
      },
      confidenceScore: { type: 'NUMBER' },
      status: { type: 'STRING', enum: ['draft', 'under_review', 'approved', 'rejected'] },
      generatedAt: { type: 'STRING' },
    },
    required: [
      'id',
      'version',
      'problem',
      'targetUser',
      'context',
      'proposedValue',
      'constraints',
      'assumptions',
      'openQuestions',
      'confidenceScore',
      'status',
      'generatedAt',
    ],
  },
  PositioningWorlds: {
    type: 'OBJECT',
    properties: {
      worlds: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            title: { type: 'STRING' },
            archetype: {
              type: 'STRING',
              enum: [
                'The Rebellious Challenger',
                'The Engineering Purist',
                'The Frictionless Partner',
                'The Sovereign Gatekeeper',
                'The Human-Centric Mentor',
              ],
            },
            targetAudience: { type: 'STRING' },
            problemFraming: { type: 'STRING' },
            valueProposition: { type: 'STRING' },
            differentiator: { type: 'STRING' },
            categoryFraming: { type: 'STRING' },
            emotionalTerritory: { type: 'STRING' },
            proofMechanism: { type: 'STRING' },
            supportingEvidenceIds: { type: 'ARRAY', items: { type: 'STRING' } },
            assumptions: { type: 'ARRAY', items: { type: 'STRING' } },
            risks: { type: 'ARRAY', items: { type: 'STRING' } },
            tradeoffs: {
              type: 'OBJECT',
              properties: {
                whatWeEmphasize: { type: 'STRING' },
                whatWeSacrifice: { type: 'STRING' },
              },
              required: ['whatWeEmphasize', 'whatWeSacrifice'],
            },
            challenges: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  evaluatorRole: {
                    type: 'STRING',
                    enum: [
                      'Strategist',
                      'Contrarian',
                      'Audience Advocate',
                      'Competitive Challenger',
                    ],
                  },
                  perspective: { type: 'STRING' },
                  potentialTrap: { type: 'STRING' },
                  unforgivingQuestion: { type: 'STRING' },
                },
                required: ['evaluatorRole', 'perspective', 'potentialTrap', 'unforgivingQuestion'],
              },
            },
            status: { type: 'STRING', enum: ['candidate', 'selected', 'rejected', 'custom_hybrid'] },
          },
          required: [
            'id',
            'title',
            'archetype',
            'targetAudience',
            'problemFraming',
            'valueProposition',
            'differentiator',
            'categoryFraming',
            'emotionalTerritory',
            'proofMechanism',
            'supportingEvidenceIds',
            'assumptions',
            'risks',
            'tradeoffs',
            'challenges',
            'status',
          ],
        },
      },
    },
    required: ['worlds'],
  },
  IdentitySynthesis: {
    type: 'OBJECT',
    properties: {
      personalityTraits: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            name: { type: 'STRING' },
            definition: { type: 'STRING' },
            audienceRelevance: { type: 'STRING' },
            strategicBasis: { type: 'STRING' },
            behaviorExamples: { type: 'ARRAY', items: { type: 'STRING' } },
            traitToAvoid: { type: 'STRING' },
            confidence: { type: 'NUMBER' },
          },
          required: ['id', 'name', 'definition', 'audienceRelevance', 'strategicBasis', 'behaviorExamples', 'traitToAvoid', 'confidence'],
        },
      },
      namingTerritories: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            name: { type: 'STRING' },
            semanticLogic: { type: 'STRING' },
            phoneticLogic: { type: 'STRING' },
            emotionalEffect: { type: 'STRING' },
            risks: { type: 'STRING' },
            categoryFit: { type: 'STRING' },
            distinctivenessConsiderations: { type: 'STRING' },
          },
          required: ['id', 'name', 'semanticLogic', 'phoneticLogic', 'emotionalEffect', 'risks', 'categoryFit', 'distinctivenessConsiderations'],
        },
      },
      rawNames: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            territoryName: { type: 'STRING' },
            rationale: { type: 'STRING' },
            semantic: { type: 'STRING' },
            pronunciation: { type: 'STRING' },
            ambiguity: { type: 'STRING' },
            strategicFit: { type: 'STRING' },
          },
          required: ['name', 'territoryName', 'rationale', 'semantic', 'pronunciation', 'ambiguity', 'strategicFit'],
        },
      },
      taglineCandidates: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            tagline: { type: 'STRING' },
            strategicMechanism: { type: 'STRING' },
            falsifiabilityScore: { type: 'NUMBER' },
          },
          required: ['tagline', 'strategicMechanism', 'falsifiabilityScore'],
        },
      },
      voiceSystem: {
        type: 'OBJECT',
        properties: {
          tonalSliders: {
            type: 'OBJECT',
            properties: {
              precision: { type: 'NUMBER' },
              warmth: { type: 'NUMBER' },
              authority: { type: 'NUMBER' },
              energy: { type: 'NUMBER' },
            },
            required: ['precision', 'warmth', 'authority', 'energy'],
          },
          sentenceBehavior: {
            type: 'OBJECT',
            properties: {
              averageLength: { type: 'STRING', enum: ['concise', 'balanced', 'elaborate'] },
              voicePreference: { type: 'STRING', enum: ['active_direct', 'collaborative', 'formal'] },
              cadenceDescription: { type: 'STRING' },
            },
            required: ['averageLength', 'voicePreference', 'cadenceDescription'],
          },
          vocabulary: {
            type: 'OBJECT',
            properties: {
              preferredTerms: { type: 'ARRAY', items: { type: 'STRING' } },
              technicalDensity: { type: 'STRING', enum: ['accessible', 'practitioner', 'academic'] },
              signaturePhrases: { type: 'ARRAY', items: { type: 'STRING' } },
            },
            required: ['preferredTerms', 'technicalDensity', 'signaturePhrases'],
          },
          bannedPatterns: { type: 'ARRAY', items: { type: 'STRING' } },
          weSayVsWeAvoid: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                weSay: { type: 'STRING' },
                weAvoid: { type: 'STRING' },
                why: { type: 'STRING' },
              },
              required: ['weSay', 'weAvoid', 'why'],
            },
          },
          examples: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                channel: { type: 'STRING', enum: ['pr_comment', 'technical_docs', 'hero_copy', 'changelog', 'social'] },
                sampleText: { type: 'STRING' },
                annotation: { type: 'STRING' },
              },
              required: ['channel', 'sampleText', 'annotation'],
            },
          },
          channelAdaptations: {
            type: 'OBJECT',
            properties: {
              primary: { type: 'STRING' },
              secondary: { type: 'STRING' },
            },
          },
        },
        required: ['tonalSliders', 'sentenceBehavior', 'vocabulary', 'bannedPatterns', 'weSayVsWeAvoid', 'examples', 'channelAdaptations'],
      },
      visualMetaphors: { type: 'ARRAY', items: { type: 'STRING' } },
      thingsToAvoid: { type: 'ARRAY', items: { type: 'STRING' } },
    },
    required: ['personalityTraits', 'namingTerritories', 'rawNames', 'taglineCandidates', 'voiceSystem', 'visualMetaphors', 'thingsToAvoid'],
  },
};

/**
 * Gemini Provider using Google Gen AI SDK
 */
export class GeminiProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    systemPrompt?: string
  ): Promise<AIServiceResult<T>> {
    const startTime = Date.now();
    let retries = 0;
    const maxRetries = 2;

    // Resolve matching schema blueprint
    let schemaBlueprint: object | undefined;
    if ((schema as unknown) === IntakeExtractionOutputSchema || prompt.includes('intake') || prompt.includes('Deconstruct this raw founder idea')) {
      schemaBlueprint = SCHEMA_BLUEPRINTS.IntakeExtraction;
    } else if ((schema as unknown) === NextAdaptiveQuestionOutputSchema || prompt.includes('adaptive_question') || prompt.includes('Decide whether another question')) {
      schemaBlueprint = SCHEMA_BLUEPRINTS.NextAdaptiveQuestion;
    } else if ((schema as unknown) === IdeaBriefSchema || prompt.includes('Idea Brief') || prompt.includes('IdeaBrief')) {
      schemaBlueprint = SCHEMA_BLUEPRINTS.IdeaBrief;
    } else if ((schema as unknown) === PositioningWorldsOutputSchema || prompt.includes('Positioning Worlds') || prompt.includes('PositioningWorld')) {
      schemaBlueprint = SCHEMA_BLUEPRINTS.PositioningWorlds;
    } else if ((schema as unknown) === IdentitySynthesisOutputSchema || prompt.includes('Creative Identity') || prompt.includes('IdentitySynthesis')) {
      schemaBlueprint = SCHEMA_BLUEPRINTS.IdentitySynthesis;
    }

    const schemaInstruction = schemaBlueprint
      ? `\n\nREQUIRED JSON SCHEMA BLUEPRINT:\n${JSON.stringify(schemaBlueprint, null, 2)}\nYour JSON output MUST match this exact schema structure.`
      : '';

    while (retries <= maxRetries) {
      try {
        // Dynamic import to avoid SSR bundling issues if SDK needs node env
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: this.apiKey });

        const fullPrompt = `${systemPrompt ? `${systemPrompt}\n\n` : ''}
STRICT JSON OUTPUT REQUIREMENT:
You must output a strictly valid JSON object that conforms to the requested schema.
Do NOT wrap in markdown code blocks like \`\`\`json. Output raw JSON only.${schemaInstruction}

User Request:
${prompt}`;

        const candidateModels = [
          process.env.GEMINI_MODEL || 'gemini-3.8-flash',
          'gemini-2.5-flash',
        ];
        const modelName = candidateModels[Math.min(retries, candidateModels.length - 1)];
        const response = await ai.models.generateContent({
          model: modelName,
          contents: fullPrompt,
          config: {
            responseMimeType: 'application/json',
            ...(schemaBlueprint ? { responseSchema: schemaBlueprint } : {}),
          },
        });

        const rawText = response.text || '';
        let jsonStr = rawText.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsedJson = JSON.parse(jsonStr);
        const validated = schema.parse(parsedJson);

        return {
          success: true,
          data: validated,
          metadata: {
            model: modelName,
            latencyMs: Date.now() - startTime,
            isFallback: false,
            retries,
          },
        };
      } catch (err: unknown) {
        retries++;
        logger.warn(`Gemini structured call failed (attempt ${retries}/${maxRetries + 1}):`, {
          error: err instanceof Error ? err.message : String(err),
        });

        if (retries > maxRetries) {
          logger.error('Gemini provider exhausted retries, failing over to mock:', err);
          // Graceful fallback to mock on provider failure
          const mock = new MockAIProvider();
          const fallbackResult = await mock.generateStructured(prompt, schema, systemPrompt);
          fallbackResult.metadata.retries = retries;
          return fallbackResult;
        }
      }
    }

    const mock = new MockAIProvider();
    return mock.generateStructured(prompt, schema, systemPrompt);
  }
}

/**
 * Returns active provider according to server environment
 */
export function getAIProvider(): AIProvider {
  const env = getServerEnv();
  if (env.isDemoMode || !env.geminiApiKey) {
    logger.info('Using MockAIProvider (Demo Mode or missing API Key)');
    return new MockAIProvider();
  }
  return new GeminiProvider(env.geminiApiKey);
}
