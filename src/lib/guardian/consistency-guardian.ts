/**
 * KINTRA Consistency Guardian Engine
 * Evaluates artifacts across 9 independent dimensions against the locked Brand Decision Graph.
 * Enforces causal explanations (WHAT, WHY, WHICH, HOW) and non-destructive repair mode.
 */

import {
  BrandArtifact,
  ArtifactValidationReport,
  GuardianFinding,
  DimensionEvaluation,
  ValidationDimension,
  GuardianArtifactType,
} from '@/types/guardian';
import { CanonicalBrandState } from '@/types/brand';
import { PositioningWorld, DecisionNode } from '@/types/strategy';
import { CreativeIdentity } from '@/types/identity';
import { AntiGenericNamer } from '@/lib/identity/anti-generic-namer';
import { logger } from '@/lib/logger';

export class ConsistencyGuardian {
  /**
   * Evaluates an artifact across 9 independent validation dimensions
   */
  static evaluateArtifact(
    artifact: BrandArtifact,
    brandState: CanonicalBrandState
  ): ArtifactValidationReport {
    logger.info('Consistency Guardian evaluating artifact:', {
      artifactId: artifact.id,
      artifactType: artifact.artifactType,
    });

    const content = artifact.content;
    const world =
      brandState.positioningWorlds.find((w) => w.id === brandState.selectedWorldId) ||
      brandState.positioningWorlds[0];
    const identity = brandState.creativeIdentity;
    const decisionNodes = Object.values(brandState.decisionGraph?.nodes || {});

    const findings: GuardianFinding[] = [];

    // 1. STRATEGIC ALIGNMENT EVALUATOR
    const strategicFindings = this.evaluateStrategicAlignment(content, world, decisionNodes);
    findings.push(...strategicFindings);

    // 2. AUDIENCE ALIGNMENT EVALUATOR
    const audienceFindings = this.evaluateAudienceAlignment(content, world, artifact.targetAudience);
    findings.push(...audienceFindings);

    // 3. VOICE ALIGNMENT EVALUATOR
    const voiceFindings = this.evaluateVoiceAlignment(content, identity);
    findings.push(...voiceFindings);

    // 4. MESSAGE ALIGNMENT EVALUATOR
    const messageFindings = this.evaluateMessageAlignment(content, world, identity);
    findings.push(...messageFindings);

    // 5. VISUAL ALIGNMENT EVALUATOR (when visual spec is attached)
    const visualFindings = this.evaluateVisualAlignment(artifact, identity);
    findings.push(...visualFindings);

    // 6. DISTINCTIVENESS EVALUATOR (Anti-Generic scan)
    const distinctivenessFindings = this.evaluateDistinctiveness(content);
    findings.push(...distinctivenessFindings);

    // 7. UNSUPPORTED CLAIMS EVALUATOR
    const unsupportedClaimsFindings = this.evaluateUnsupportedClaims(content);
    findings.push(...unsupportedClaimsFindings);

    // 8. CONTRADICTION RISK EVALUATOR (against explicit sacrifices & decision graph)
    const contradictionFindings = this.evaluateContradictionRisk(content, world, decisionNodes);
    findings.push(...contradictionFindings);

    // 9. BRAND-RULE VIOLATIONS EVALUATOR (personality trait boundaries & anti-traits)
    const brandRuleFindings = this.evaluateBrandRuleViolations(content, identity);
    findings.push(...brandRuleFindings);

    // Compile independent dimension reports (never collapsed into a single magical score)
    const dimensions: Record<ValidationDimension, DimensionEvaluation> = {
      strategic_alignment: this.buildDimensionScore(
        'strategic_alignment',
        'Strategic Alignment',
        strategicFindings,
        'Evaluates adherence to core value proposition, category framing, and strategic mechanism.'
      ),
      audience_alignment: this.buildDimensionScore(
        'audience_alignment',
        'Audience Alignment',
        audienceFindings,
        'Verifies technical calibration and tone suitability for the target practitioner.'
      ),
      voice_alignment: this.buildDimensionScore(
        'voice_alignment',
        'Voice Alignment',
        voiceFindings,
        'Audits tonal sliders, banned marketing patterns, and We Say vs. We Avoid vocabulary.'
      ),
      message_alignment: this.buildDimensionScore(
        'message_alignment',
        'Message Alignment',
        messageFindings,
        'Ensures core taglines, differentiators, and value pillars are consistently affirmed.'
      ),
      visual_alignment: this.buildDimensionScore(
        'visual_alignment',
        'Visual Alignment',
        visualFindings,
        'Checks color palettes, typography, and geometry specifications against visual brand tokens.'
      ),
      distinctiveness: this.buildDimensionScore(
        'distinctiveness',
        'Distinctiveness & Anti-Generic',
        distinctivenessFindings,
        'Detects overused startup tropes, buzzwords, and category clichés.'
      ),
      unsupported_claims: this.buildDimensionScore(
        'unsupported_claims',
        'Unsupported Claim Risk',
        unsupportedClaimsFindings,
        'Flags unprovable absolutes, false guarantees, and unsubstantiated claims.'
      ),
      contradiction_risk: this.buildDimensionScore(
        'contradiction_risk',
        'Contradiction Risk',
        contradictionFindings,
        'Verifies that copy does not contradict explicit strategic sacrifices recorded in the Decision Graph.'
      ),
      brand_rule_violations: this.buildDimensionScore(
        'brand_rule_violations',
        'Brand-Rule Violations',
        brandRuleFindings,
        'Enforces operational boundaries and anti-traits defined in Brand Personality.'
      ),
    };

    const blockingCount = findings.filter((f) => f.severity === 'blocking').length;
    const passed = blockingCount === 0 && findings.filter((f) => f.severity === 'high').length === 0;

    const report: ArtifactValidationReport = {
      id: `report-${Date.now()}`,
      artifactId: artifact.id,
      evaluatedAt: new Date().toISOString(),
      passed,
      totalFindings: findings.length,
      blockingFindingsCount: blockingCount,
      dimensions,
      findings,
      summary: passed
        ? `Artifact passed brand validation with ${findings.length} minor advisory observation${
            findings.length === 1 ? '' : 's'
          }.`
        : `Artifact failed validation: ${blockingCount} blocking conflict${
            blockingCount === 1 ? '' : 's'
          } and ${findings.length - blockingCount} advisory finding${
            findings.length - blockingCount === 1 ? '' : 's'
          } detected against locked brand decisions.`,
    };

    return report;
  }

  // ==========================================
  // INDEPENDENT DIMENSION EVALUATORS
  // ==========================================

  private static evaluateStrategicAlignment(
    content: string,
    world?: PositioningWorld,
    decisionNodes: DecisionNode[] = []
  ): GuardianFinding[] {
    const findings: GuardianFinding[] = [];
    if (!world) return findings;

    const lower = content.toLowerCase();
    const strategyDecision = decisionNodes.find((n) => n.category === 'positioning_world');

    // Check if the content claims to be something other than the locked category framing
    if (world.categoryFraming) {
      const opposingCategories = [
        { bad: 'social media scheduler', rule: 'Must frame as developer tool, not social media scheduler' },
        { bad: 'accounting software', rule: 'Must not claim to be accounting or financial tool' },
        { bad: 'customer crm', rule: 'Must remain focused on engineering workflows, not customer CRM' },
      ];

      for (const item of opposingCategories) {
        if (lower.includes(item.bad)) {
          findings.push({
            id: `strat-cat-${Date.now()}-${Math.random()}`,
            dimension: 'strategic_alignment',
            issue: `Incorrect Category Framing: Claims to be "${item.bad}"`,
            severity: 'blocking',
            violatedRule: item.rule,
            evidence: item.bad,
            explanation: {
              whatIsWrong: `Copy refers to the product as "${item.bad}".`,
              whyItMatters: `This confuses category perception and violates the foundational positioning territory.`,
              whichDecisionConflicts: strategyDecision?.title || `Positioning World: ${world.title}`,
              conflictingDecisionId: strategyDecision?.id,
              howToCorrect: `Replace "${item.bad}" with category definition: "${world.categoryFraming}".`,
            },
            suggestedRepair: world.categoryFraming,
            status: 'open',
          });
        }
      }
    }

    return findings;
  }

  private static evaluateAudienceAlignment(
    content: string,
    world?: PositioningWorld,
    targetAudienceOverride?: string
  ): GuardianFinding[] {
    const findings: GuardianFinding[] = [];
    const lower = content.toLowerCase();
    const audience = targetAudienceOverride || world?.targetAudience || 'Senior Engineers';

    // Patronizing or novice-oriented framing for technical audiences
    const isTechnical = /engineer|devops|developer|architect|ciso/i.test(audience);
    if (isTechnical) {
      const noviceTropes = [
        { phrase: 'for dummies', repair: 'for systems architects' },
        { phrase: 'coding made easy for beginners', repair: 'deterministic code review at scale' },
        { phrase: 'no coding required', repair: 'infrastructure-as-code automation' },
        { phrase: 'simple one-click trick', repair: 'deterministic automated verification' },
      ];

      for (const trope of noviceTropes) {
        if (lower.includes(trope.phrase)) {
          findings.push({
            id: `aud-trop-${Date.now()}-${Math.random()}`,
            dimension: 'audience_alignment',
            issue: `Patronizing Audience Framing: "${trope.phrase}"`,
            severity: 'blocking',
            violatedRule: 'Audience alignment: Respect practitioner seniority and domain mastery',
            evidence: trope.phrase,
            explanation: {
              whatIsWrong: `Copy contains novice-oriented trope "${trope.phrase}".`,
              whyItMatters: `${audience} immediately bounce when treated as novice non-technical users.`,
              whichDecisionConflicts: `Target Audience Definition: ${audience}`,
              howToCorrect: `Speak peer-to-peer with domain rigor. Suggested replacement: "${trope.repair}".`,
            },
            suggestedRepair: trope.repair,
            status: 'open',
          });
        }
      }
    }

    return findings;
  }

  private static evaluateVoiceAlignment(content: string, identity: CreativeIdentity | null): GuardianFinding[] {
    const findings: GuardianFinding[] = [];
    const lower = content.toLowerCase();
    const voice = identity?.voiceSystem;

    // 1. Check Banned Marketing Patterns
    const defaultBanned = [
      'supercharge',
      'next-gen',
      'game-changer',
      'game changer',
      'magic',
      'seamlessly',
      'revolutionary',
      'secret sauce',
      'rockstar',
    ];
    const bannedPatterns = voice?.bannedPatterns?.length ? voice.bannedPatterns : defaultBanned;

    for (const banned of bannedPatterns) {
      if (lower.includes(banned.toLowerCase())) {
        findings.push({
          id: `voice-ban-${Date.now()}-${Math.random()}`,
          dimension: 'voice_alignment',
          issue: `Banned Marketing Cliché: "${banned}"`,
          severity: 'high',
          violatedRule: `Banned voice pattern: Avoid superficial hype terms`,
          evidence: banned,
          explanation: {
            whatIsWrong: `Copy includes forbidden marketing cliché "${banned}".`,
            whyItMatters: `Banned buzzwords erode technical credibility and signal generic marketing hype.`,
            whichDecisionConflicts: 'Voice System: Banned Patterns Matrix',
            howToCorrect: `Remove "${banned}" and state the verifiable technical mechanism directly.`,
          },
          suggestedRepair: 'accelerate with reproducible test cases',
          status: 'open',
        });
      }
    }

    // 2. Check We Say vs We Avoid
    if (voice?.weSayVsWeAvoid) {
      for (const pair of voice.weSayVsWeAvoid) {
        if (lower.includes(pair.weAvoid.toLowerCase())) {
          findings.push({
            id: `voice-avoid-${Date.now()}-${Math.random()}`,
            dimension: 'voice_alignment',
            issue: `Voice Vocabulary Violation: Used "${pair.weAvoid}" instead of "${pair.weSay}"`,
            severity: 'medium',
            violatedRule: `Vocabulary policy: ${pair.why}`,
            evidence: pair.weAvoid,
            explanation: {
              whatIsWrong: `Used deprecated term "${pair.weAvoid}".`,
              whyItMatters: pair.why,
              whichDecisionConflicts: 'Voice System: We Say vs. We Avoid Matrix',
              howToCorrect: `Replace "${pair.weAvoid}" with canonical term "${pair.weSay}".`,
            },
            suggestedRepair: pair.weSay,
            status: 'open',
          });
        }
      }
    }

    // 3. Tonal Sliders Check: Excessive Exclamation Marks
    const isHighPrecision = (voice?.tonalSliders.precision ?? 80) > 75;
    const isLowWarmth = (voice?.tonalSliders.warmth ?? 30) < 40;
    const exclamationCount = (content.match(/!/g) || []).length;

    if (isHighPrecision && isLowWarmth && exclamationCount > 1) {
      findings.push({
        id: `voice-tone-exclam-${Date.now()}`,
        dimension: 'voice_alignment',
        issue: `Tonal Exaggeration: ${exclamationCount} exclamation marks detected`,
        severity: 'low',
        violatedRule: 'Restrained technical voice: Suppress emotional punctuation and hype',
        evidence: '!',
        explanation: {
          whatIsWrong: `Copy contains ${exclamationCount} exclamation marks.`,
          whyItMatters: `High precision (${voice?.tonalSliders.precision}%) demands calm, factual authority without forced cheerfulness.`,
          whichDecisionConflicts: 'Voice Tonal Slider: Precision vs Warmth',
          howToCorrect: `Replace exclamation marks with periods.`,
        },
        suggestedRepair: '.',
        status: 'open',
      });
    }

    return findings;
  }

  private static evaluateMessageAlignment(
    content: string,
    world?: PositioningWorld,
    identity?: CreativeIdentity | null
  ): GuardianFinding[] {
    const findings: GuardianFinding[] = [];
    const lower = content.toLowerCase();

    // Check if the selected candidate name is completely omitted or misspelled when headline/hero
    if (identity?.selectedNameId && identity.namingCandidates) {
      const selectedName = identity.namingCandidates.find((c) => c.id === identity.selectedNameId)?.name;
      if (selectedName && selectedName.length > 2) {
        // If content is website headline, check if brand name or value proposition is reflected
        if (content.length > 50 && !lower.includes(selectedName.toLowerCase())) {
          findings.push({
            id: `msg-brandname-${Date.now()}`,
            dimension: 'message_alignment',
            issue: `Missing Brand Name Anchor: Does not reference "${selectedName}"`,
            severity: 'low',
            violatedRule: 'Message cohesion: Brand assets should anchor the approved brand name where appropriate',
            evidence: `Name "${selectedName}" absent`,
            explanation: {
              whatIsWrong: `Content does not anchor or mention the approved brand name "${selectedName}".`,
              whyItMatters: `Consistent repetition cements brand recall in primary marketing touchpoints.`,
              whichDecisionConflicts: `Approved Brand Name: ${selectedName}`,
              howToCorrect: `Introduce "${selectedName}" into the headline or supporting subdeck.`,
            },
            suggestedRepair: `${selectedName}: ${content}`,
            status: 'open',
          });
        }
      }
    }

    return findings;
  }

  private static evaluateVisualAlignment(
    artifact: BrandArtifact,
    identity: CreativeIdentity | null
  ): GuardianFinding[] {
    const findings: GuardianFinding[] = [];
    const spec = artifact.visualSpec;
    if (!spec || !identity) return findings;

    const brandVisual = identity.visualSystem;

    // Check color clash
    if (spec.dominantHex && brandVisual.palette.primary.hex) {
      const dominant = spec.dominantHex.toUpperCase();
      const approvedPrimary = brandVisual.palette.primary.hex.toUpperCase();

      // If dominant color is bright pink or neon yellow while brand is dark/monochrome
      const isClashingBright =
        dominant === '#FF69B4' || dominant === '#FF00FF' || dominant === '#FFFF00';
      const isDarkTerminal =
        approvedPrimary.startsWith('#0') || approvedPrimary.startsWith('#1') || approvedPrimary.startsWith('#2');

      if (isClashingBright && isDarkTerminal) {
        findings.push({
          id: `vis-color-${Date.now()}`,
          dimension: 'visual_alignment',
          issue: `Visual Color Mismatch: Dominant hex "${dominant}" clashes with brand primary "${approvedPrimary}"`,
          severity: 'blocking',
          violatedRule: `Visual palette compliance: Dominant surfaces must adhere to approved brand token (${brandVisual.palette.primary.name})`,
          evidence: dominant,
          explanation: {
            whatIsWrong: `Asset visual spec specifies ${dominant}, which contradicts the terminal dark palette.`,
            whyItMatters: `Visual disharmony fractures brand recognition and dilutes architectural authority.`,
            whichDecisionConflicts: `Visual Identity Token: Primary (${approvedPrimary})`,
            howToCorrect: `Align dominant canvas color to approved hex: ${approvedPrimary}.`,
          },
          suggestedRepair: approvedPrimary,
          status: 'open',
        });
      }
    }

    // Check geometry mismatch
    if (spec.geometryStyle && brandVisual.shapes) {
      const avoidsOrganic =
        brandVisual.shapes.geometryNotes?.toLowerCase().includes('zero bubble pills') ||
        brandVisual.shapes.borderRadius?.includes('rounded-none') ||
        brandVisual.shapes.borderRadius?.includes('rounded-lg') ||
        brandVisual.shapes.borderRadius?.includes('rounded-xl');

      if (avoidsOrganic && spec.geometryStyle === 'rounded_organic') {
        findings.push({
          id: `vis-geo-${Date.now()}`,
          dimension: 'visual_alignment',
          issue: `Geometry Mismatch: Organic rounded styling on an architectural brand`,
          severity: 'medium',
          violatedRule: 'Visual shape consistency: Geometry must remain sharp and architectural',
          evidence: spec.geometryStyle,
          explanation: {
            whatIsWrong: `Spec requests "rounded_organic" geometry, but brand guidelines specify architectural surfaces (${brandVisual.shapes.geometryNotes}).`,
            whyItMatters: `Soft bubbles contradict the deterministic engineering ethos.`,
            whichDecisionConflicts: 'Visual System: Geometry & Corner Radii',
            howToCorrect: `Switch geometry style to "sharp_angled".`,
          },
          suggestedRepair: 'sharp_angled',
          status: 'open',
        });
      }
    }

    return findings;
  }

  private static evaluateDistinctiveness(content: string): GuardianFinding[] {
    const findings: GuardianFinding[] = [];
    const lower = content.toLowerCase();

    // Run AntiGenericNamer scanning heuristics
    const genericPhrases = [
      'all-in-one platform',
      'complete all-in-one',
      'the ultimate tool',
      'the easiest way to',
      'revolutionary new way',
      'supercharge your workflow',
      'take your business to the next level',
    ];

    for (const phrase of genericPhrases) {
      if (lower.includes(phrase)) {
        findings.push({
          id: `dist-cliche-${Date.now()}-${Math.random()}`,
          dimension: 'distinctiveness',
          issue: `Generic Category Trope: "${phrase}"`,
          severity: 'high',
          violatedRule: 'Distinctiveness policy: Forbid commoditized startup boilerplate phrases',
          evidence: phrase,
          explanation: {
            whatIsWrong: `Copy relies on boilerplate cliché "${phrase}".`,
            whyItMatters: `Generic copy makes KINTRA indistinguishable from hundreds of generic AI tools.`,
            whichDecisionConflicts: 'Distinctive Positioning Doctrine',
            howToCorrect: `State the precise falsifiable mechanism rather than an all-encompassing boast.`,
          },
          suggestedRepair: 'surgical verification pipeline',
          status: 'open',
        });
      }
    }

    // Scan for embedded product or tool names that trigger naming clichés
    const words = content.match(/\b[A-Z][a-zA-Z0-9.-]+\b/g) || [];
    for (const w of words.slice(0, 5)) {
      const audit = AntiGenericNamer.auditName(w);
      if (audit.genericnessRisk === 'high') {
        findings.push({
          id: `dist-name-${Date.now()}-${Math.random()}`,
          dimension: 'distinctiveness',
          issue: `Cliché Embedded Name: "${w}" triggers naming clichés`,
          severity: 'medium',
          violatedRule: 'Distinctive naming doctrine: Avoid embedded cliché product names',
          evidence: w,
          explanation: {
            whatIsWrong: `Feature or tool named "${w}" triggers naming cliché flags (${audit.flags.join(', ')}).`,
            whyItMatters: `Embedded cliché names dilute distinctiveness.`,
            whichDecisionConflicts: 'Naming Architecture Doctrine',
            howToCorrect: `Rename feature to an evocative or mechanism-based term.`,
          },
          suggestedRepair: 'VerificationEngine',
          status: 'open',
        });
      }
    }

    return findings;
  }

  private static evaluateUnsupportedClaims(content: string): GuardianFinding[] {
    const findings: GuardianFinding[] = [];
    const lower = content.toLowerCase();

    const unprovableAbsolutes = [
      {
        claim: '100% bug free',
        rule: 'Never promise 100% bug-free software (mathematically unprovable in arbitrary Turing systems)',
        repair: 'zero false-positive hallucinated blockers',
      },
      {
        claim: 'zero bugs guaranteed forever',
        rule: 'Absolute error-free guarantees are legally hazardous and technically dishonest',
        repair: 'cryptographically verifiable regression prevention',
      },
      {
        claim: 'fastest in the world',
        rule: 'Superlative claims require published benchmarking evidence',
        repair: 'sub-second pull request analysis',
      },
      {
        claim: 'never makes mistakes',
        rule: 'AI tools must never claim infallibility',
        repair: 'attaches reproducible tests to prove every finding',
      },
      {
        claim: 'eliminates all vulnerabilities completely',
        rule: 'Absolute security guarantees violate engineering ethics',
        repair: 'catches critical logic regressions before merge',
      },
    ];

    for (const item of unprovableAbsolutes) {
      if (lower.includes(item.claim)) {
        findings.push({
          id: `unsup-claim-${Date.now()}-${Math.random()}`,
          dimension: 'unsupported_claims',
          issue: `Unsupported Absolute Claim: "${item.claim}"`,
          severity: 'blocking',
          violatedRule: item.rule,
          evidence: item.claim,
          explanation: {
            whatIsWrong: `Asserts absolute unprovable claim "${item.claim}".`,
            whyItMatters: `Experienced engineers will instantly dismiss the product as snake oil. False absolutes expose the brand to reputation loss.`,
            whichDecisionConflicts: 'Deterministic Rigor Principle',
            howToCorrect: `Downgrade to a bounded, verifiable claim: "${item.repair}".`,
          },
          suggestedRepair: item.repair,
          status: 'open',
        });
      }
    }

    return findings;
  }

  private static evaluateContradictionRisk(
    content: string,
    world?: PositioningWorld,
    decisionNodes: DecisionNode[] = []
  ): GuardianFinding[] {
    const findings: GuardianFinding[] = [];
    if (!world) return findings;

    const lower = content.toLowerCase();
    const sacrifice = world.tradeoffs?.whatWeSacrifice;
    const sacrificeDecision = decisionNodes.find(
      (n) => n.category === 'positioning_world' || n.category === 'target_niche'
    );

    // If world explicitly sacrifices non-technical broad teams
    if (sacrifice && /non-technical|broad|generic|every\s+team/i.test(sacrifice)) {
      const contradictsSacrifice = [
        'built for every team in your company',
        'ideal for marketing, sales, and hr',
        'no technical knowledge needed',
        'for non-technical stakeholders',
      ];

      for (const phrase of contradictsSacrifice) {
        if (lower.includes(phrase)) {
          findings.push({
            id: `contra-sac-${Date.now()}-${Math.random()}`,
            dimension: 'contradiction_risk',
            issue: `Contradicts Explicit Strategic Sacrifice: "${phrase}"`,
            severity: 'blocking',
            violatedRule: `Strategic Integrity: Must honor explicit sacrifice ("${sacrifice}")`,
            evidence: phrase,
            explanation: {
              whatIsWrong: `Copy claims to serve non-technical teams, but approved positioning explicitly sacrifices them.`,
              whyItMatters: `A brand that tries to be for everyone ends up being for no one. Sacrifices are what make strategy real.`,
              whichDecisionConflicts: sacrificeDecision?.title || `Positioning Sacrifice: ${sacrifice}`,
              conflictingDecisionId: sacrificeDecision?.id,
              howToCorrect: `Focus exclusively on the target engineering practitioners: "${world.targetAudience}".`,
            },
            suggestedRepair: `Engineered strictly for ${world.targetAudience}`,
            status: 'open',
          });
        }
      }
    }

    return findings;
  }

  private static evaluateBrandRuleViolations(
    content: string,
    identity: CreativeIdentity | null
  ): GuardianFinding[] {
    const findings: GuardianFinding[] = [];
    const lower = content.toLowerCase();
    const traits = identity?.personalityTraits || [];

    for (const trait of traits) {
      // Check traitToAvoid
      if (trait.name.toLowerCase().includes('rigor') || trait.name.toLowerCase().includes('candor')) {
        // Speculative hedging terms forbidden in rigorous developer tools
        const speculativePhrases = [
          'we think this might be an issue',
          'consider maybe checking this',
          'could possibly contain a bug',
          'we have a hunch',
        ];

        for (const phrase of speculativePhrases) {
          if (lower.includes(phrase)) {
            findings.push({
              id: `rule-hedge-${Date.now()}-${Math.random()}`,
              dimension: 'brand_rule_violations',
              issue: `Speculative Hedging Violates Brand Personality: "${phrase}"`,
              severity: 'high',
              violatedRule: `Trait Boundary (${trait.name}): ${trait.traitToAvoid}`,
              evidence: phrase,
              explanation: {
                whatIsWrong: `Copy hedges with tentative phrase "${phrase}".`,
                whyItMatters: `The brand personality trait "${trait.name}" mandates deterministic certainty backed by proof.`,
                whichDecisionConflicts: `Personality Trait: ${trait.name}`,
                howToCorrect: `State the verifiable fact directly without hedging words.`,
              },
              suggestedRepair: 'Executable repro test isolates logic flaw at line 42',
              status: 'open',
            });
          }
        }
      }
    }

    return findings;
  }

  // ==========================================
  // HELPER: BUILD INDEPENDENT DIMENSION SCORE
  // ==========================================

  private static buildDimensionScore(
    dimension: ValidationDimension,
    label: string,
    findings: GuardianFinding[],
    rationale: string
  ): DimensionEvaluation {
    const blocking = findings.filter((f) => f.severity === 'blocking').length;
    const high = findings.filter((f) => f.severity === 'high').length;
    const medium = findings.filter((f) => f.severity === 'medium').length;
    const low = findings.filter((f) => f.severity === 'low').length;

    let score = 100 - blocking * 40 - high * 25 - medium * 15 - low * 5;
    if (score < 0) score = 0;

    const status: 'pass' | 'warning' | 'fail' =
      blocking > 0 || high > 0 ? 'fail' : medium > 0 || low > 1 ? 'warning' : 'pass';

    return {
      dimension,
      label,
      status,
      score,
      rationale,
      findingsCount: findings.length,
      criticalIssues: findings.filter((f) => f.severity === 'blocking' || f.severity === 'high').map((f) => f.issue),
    };
  }

  // ==========================================
  // REPAIR MODE ENGINE
  // ==========================================

  /**
   * Applies a suggested repair in-place without silent overwrite
   */
  static applyRepair(artifact: BrandArtifact, findingId: string): BrandArtifact {
    if (artifact.isLocked) {
      throw new Error(`Cannot modify locked artifact "${artifact.name}". Unlock first to edit.`);
    }

    const finding = artifact.validationReport?.findings.find((f) => f.id === findingId);
    if (!finding) return artifact;

    let updatedContent = artifact.content;
    if (
      finding.issue.toLowerCase().includes('exclamation') ||
      (finding.evidence && /^!+$/.test(finding.evidence))
    ) {
      updatedContent = updatedContent.replace(/!+/g, finding.suggestedRepair || '.');
    } else if (
      finding.dimension === 'message_alignment' &&
      finding.suggestedRepair &&
      (finding.suggestedRepair.endsWith(artifact.content) || finding.suggestedRepair.includes(artifact.content))
    ) {
      // Clean full-content update for brand name anchoring without duplicating text
      updatedContent = finding.suggestedRepair;
    } else if (finding.evidence && updatedContent.includes(finding.evidence)) {
      updatedContent = updatedContent.replace(finding.evidence, finding.suggestedRepair);
    } else if (
      finding.evidence &&
      new RegExp(finding.evidence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(updatedContent)
    ) {
      const regex = new RegExp(finding.evidence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      updatedContent = updatedContent.replace(regex, finding.suggestedRepair);
    } else if (finding.suggestedRepair) {
      updatedContent = `${finding.suggestedRepair.replace(/^\[Repaired:\s*|\]$/g, '')} — ${updatedContent}`;
    }

    const newVersion = artifact.versionHistory.length + 1;
    const updatedHistory = [
      ...artifact.versionHistory,
      {
        version: newVersion,
        content: updatedContent,
        editedAt: new Date().toISOString(),
        editReason: `Applied repair for: ${finding.issue}`,
        editedBy: 'auto_repair' as const,
      },
    ];

    const updatedFindings = (artifact.validationReport?.findings || []).map((f) =>
      f.id === findingId ? { ...f, status: 'applied' as const, appliedAt: new Date().toISOString() } : f
    );

    return {
      ...artifact,
      content: updatedContent,
      versionHistory: updatedHistory,
      validationReport: artifact.validationReport
        ? {
            ...artifact.validationReport,
            findings: updatedFindings,
          }
        : undefined,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Synthesizes an initial, on-brand artifact tailored to the approved brand state
   */
  static generateDefaultArtifact(
    artifactType: GuardianArtifactType,
    brandState: CanonicalBrandState
  ): BrandArtifact {
    const world =
      brandState.positioningWorlds.find((w) => w.id === brandState.selectedWorldId) ||
      brandState.positioningWorlds[0];
    const identity = brandState.creativeIdentity;
    const selectedName =
      identity?.namingCandidates.find((c) => c.id === identity.selectedNameId)?.name || 'Kintra';
    const selectedTagline =
      identity?.taglineCandidates.find((t) => t.id === identity.selectedTaglineId)?.tagline ||
      'Three comments or zero. Mathematically verifiable PR reviews.';
    const audience = world?.targetAudience || 'Senior Staff Engineers and DevOps Architects';

    let title = '';
    let content = '';

    switch (artifactType) {
      case 'website_headline':
        title = `${selectedName} Hero Headline`;
        content = `${selectedTagline}\n\nDeterministic pull request review intelligence that isolates critical logic flaws with reproducible unit tests. Zero false alarms.`;
        break;

      case 'landing_page_section':
        title = `${selectedName} Value Proposition Section`;
        content = `### Why Traditional Review Bots Fail\n\nMost PR tools generate hundreds of decorative formatting complaints that waste engineering attention. ${selectedName} operates under a strict mathematical rule: 3 comments or zero. Every notification attaches an executable repro test case that proves the defect before you merge.\n\nBuilt exclusively for ${audience}.`;
        break;

      case 'linkedin_post':
        title = `${selectedName} Founder Announcement Post`;
        content = `Code review shouldn't be a game of probabilistic guessing.\n\nToday we're launching ${selectedName}. Instead of flooding your pull requests with speculative warnings, we enforce deterministic verification.\n\nIf we can't write a failing repro test, we don't comment. Zero noise. Surgical precision.\n\nLink in the first comment.`;
        break;

      case 'social_caption':
        title = `${selectedName} Technical Feature Snippet`;
        content = `Three comments or zero. Because a code review bot should never create more noise than the bug itself. #devtools #codereview #${selectedName.toLowerCase()}`;
        break;

      case 'launch_email':
        title = `${selectedName} Beta Access Email`;
        content = `Subject: Deterministic PR reviews for your repository\n\nHi {{first_name}},\n\nIf your senior engineers spend 40% of their week wading through false-alarm review comments, we built ${selectedName} for you.\n\nWe don't post suggestions with "might" or "could possibly". We attach executable unit test proofs directly to GitHub PRs.\n\nReply to this email for private beta credentials.\n\nBest,\nThe ${selectedName} Team`;
        break;

      case 'pitch_paragraph':
        title = `${selectedName} Investor Memo Pitch`;
        content = `${selectedName} is the deterministic pull request review engine for high-velocity software teams. While legacy linters and stochastic chatbots hallucinate superficial stylistic complaints, ${selectedName} isolates critical logic flaws and generates executable repro cases with zero false positives. We are replacing subjective review theater with mathematical certainty.`;
        break;

      case 'product_onboarding_copy':
        title = `${selectedName} GitHub App Install Flow`;
        content = `Step 1 of 3: Connect your GitHub organization.\n\n${selectedName} will analyze incoming pull requests against your test suite. We will never post more than 3 comments on a single diff, and every comment will include an executable reproduction command.`;
        break;

      case 'support_response':
        title = `${selectedName} Technical Support Response`;
        content = `Hi Alex,\n\nThanks for reaching out. The review comment on PR #142 was triggered because our symbolic execution engine detected an unbounded recursive loop at line 84. You can reproduce the stack overflow locally with the attached curl command: \`npm run test:repro-142\`.\n\nLet us know if you need further trace logs.\n\nBest,\n${selectedName} Engineering`;
        break;
    }

    const now = new Date().toISOString();
    return {
      id: `art-${artifactType}-${Date.now()}`,
      name: title,
      artifactType,
      content,
      targetAudience: audience,
      channelContext: artifactType,
      versionHistory: [
        {
          version: 1,
          content,
          editedAt: now,
          editedBy: 'regeneration',
          editReason: 'Initial on-brand synthesis',
        },
      ],
      status: 'draft',
      isApproved: false,
      isLocked: false,
      createdAt: now,
      updatedAt: now,
    };
  }
}
