import { describe, it, expect, beforeEach } from 'vitest';
import { useBrandStore } from '@/store/useBrandStore';
import { DEMO_BRAND_PRGUARD } from '@/fixtures/demo-brands';
import { StrategyService } from '@/lib/strategy/strategy-service';
import { IdentityService } from '@/lib/identity/identity-service';
import { ConsistencyGuardian } from '@/lib/guardian/consistency-guardian';
import {
  FIXTURE_CORRECT_ARTIFACT,
  FIXTURE_SUBTLE_INCONSISTENCY,
  FIXTURE_OBVIOUS_INCONSISTENCY,
  FIXTURE_UNSUPPORTED_CLAIM,
  FIXTURE_WRONG_AUDIENCE,
  FIXTURE_TONE_VIOLATION,
  FIXTURE_VISUAL_MISMATCH,
  FIXTURE_INTENTIONALLY_GENERIC_CONTENT,
} from '@/fixtures/guardian-fixtures';
import { CanonicalBrandState } from '@/types/brand';

describe('Consistency Guardian & Artifact Validation Suite (Prompt 09)', () => {
  let initializedState: CanonicalBrandState;

  beforeEach(async () => {
    useBrandStore.getState().resetProject();
    useBrandStore.getState().loadDemoProject();

    // Lock Strategy
    const worlds = StrategyService.generateWorlds(DEMO_BRAND_PRGUARD.ideaBrief);
    useBrandStore.setState((s) => ({
      project: {
        ...s.project,
        positioningWorlds: worlds,
        selectedWorldId: worlds[0].id,
      },
    }));

    // Lock Creative Identity
    const identity = await IdentityService.generateIdentity(worlds[0], DEMO_BRAND_PRGUARD.ideaBrief);
    useBrandStore.setState((s) => ({
      project: {
        ...s.project,
        creativeIdentity: identity,
        stage: 'identity_locked',
      },
    }));

    initializedState = useBrandStore.getState().project;
  });

  // ==========================================
  // 1. CANONICAL TEST FIXTURE VALIDATIONS
  // ==========================================
  describe('Canonical Test Fixtures Evaluation', () => {
    it('fixture 1: passes correct artifact with zero blocking findings', () => {
      const report = ConsistencyGuardian.evaluateArtifact(FIXTURE_CORRECT_ARTIFACT, initializedState);

      expect(report.passed).toBe(true);
      expect(report.blockingFindingsCount).toBe(0);
      expect(report.dimensions.strategic_alignment.status).toBe('pass');
      expect(report.dimensions.unsupported_claims.status).toBe('pass');
      expect(report.dimensions.distinctiveness.status).toBe('pass');
    });

    it('fixture 2: detects subtle inconsistency with advisory non-blocking warnings', () => {
      const report = ConsistencyGuardian.evaluateArtifact(FIXTURE_SUBTLE_INCONSISTENCY, initializedState);

      // Should identify hedging phrase "we think this might be an issue"
      const hedgeFinding = report.findings.find((f) => f.dimension === 'brand_rule_violations');
      expect(hedgeFinding).toBeDefined();
      expect(hedgeFinding?.severity).toBe('high');
      expect(hedgeFinding?.explanation.whatIsWrong).toContain('hedges with tentative phrase');
      expect(report.dimensions.brand_rule_violations.score).toBeLessThan(100);
    });

    it('fixture 3: fails obvious inconsistency on strategic category framing', () => {
      const report = ConsistencyGuardian.evaluateArtifact(FIXTURE_OBVIOUS_INCONSISTENCY, initializedState);

      expect(report.passed).toBe(false);
      const catFinding = report.findings.find((f) => f.dimension === 'strategic_alignment');
      expect(catFinding).toBeDefined();
      expect(catFinding?.severity).toBe('blocking');
      expect(catFinding?.explanation.whatIsWrong).toContain('social media scheduler');
      expect(report.dimensions.strategic_alignment.status).toBe('fail');
    });

    it('fixture 4: fails unsupported claims on absolute unprovable assertions', () => {
      const report = ConsistencyGuardian.evaluateArtifact(FIXTURE_UNSUPPORTED_CLAIM, initializedState);

      expect(report.passed).toBe(false);
      const unprovableFindings = report.findings.filter((f) => f.dimension === 'unsupported_claims');
      expect(unprovableFindings.length).toBeGreaterThanOrEqual(2);

      const bugFreeFinding = unprovableFindings.find((f) => f.evidence.includes('100% bug free'));
      expect(bugFreeFinding).toBeDefined();
      expect(bugFreeFinding?.severity).toBe('blocking');
      expect(bugFreeFinding?.suggestedRepair).toBe('zero false-positive hallucinated blockers');
      expect(report.dimensions.unsupported_claims.status).toBe('fail');
    });

    it('fixture 5: fails wrong audience on condescending beginner tropes', () => {
      const report = ConsistencyGuardian.evaluateArtifact(FIXTURE_WRONG_AUDIENCE, initializedState);

      expect(report.passed).toBe(false);
      const audienceFindings = report.findings.filter((f) => f.dimension === 'audience_alignment');
      expect(audienceFindings.length).toBeGreaterThanOrEqual(1);

      const beginnerFinding = audienceFindings.find((f) => f.evidence.includes('coding made easy for beginners'));
      expect(beginnerFinding).toBeDefined();
      expect(beginnerFinding?.severity).toBe('blocking');
      expect(beginnerFinding?.explanation.whyItMatters).toContain('immediately bounce');
      expect(report.dimensions.audience_alignment.status).toBe('fail');
    });

    it('fixture 6: fails tone violation on banned marketing buzzwords and exclamation hype', () => {
      const report = ConsistencyGuardian.evaluateArtifact(FIXTURE_TONE_VIOLATION, initializedState);

      const voiceFindings = report.findings.filter((f) => f.dimension === 'voice_alignment');
      expect(voiceFindings.length).toBeGreaterThanOrEqual(3);

      const superchargeFinding = voiceFindings.find((f) => f.evidence.includes('supercharge'));
      expect(superchargeFinding).toBeDefined();
      expect(superchargeFinding?.severity).toBe('high');

      const exclamationFinding = voiceFindings.find((f) => f.issue.includes('exclamation marks'));
      expect(exclamationFinding).toBeDefined();
      expect(report.dimensions.voice_alignment.status).toBe('fail');
    });

    it('fixture 7: fails visual mismatch on dominant color clash and flags geometry style', () => {
      const report = ConsistencyGuardian.evaluateArtifact(FIXTURE_VISUAL_MISMATCH, initializedState);

      const visualFindings = report.findings.filter((f) => f.dimension === 'visual_alignment');
      expect(visualFindings.length).toBeGreaterThanOrEqual(2);

      const colorClash = visualFindings.find((f) => f.issue.includes('Visual Color Mismatch'));
      expect(colorClash).toBeDefined();
      expect(colorClash?.severity).toBe('blocking');
      expect(colorClash?.evidence).toBe('#FF69B4');

      const geoClash = visualFindings.find((f) => f.issue.includes('Geometry Mismatch'));
      expect(geoClash).toBeDefined();
      expect(report.dimensions.visual_alignment.status).toBe('fail');
    });

    it('fixture 8: flags intentionally generic content with high distinctiveness risk', () => {
      const report = ConsistencyGuardian.evaluateArtifact(
        FIXTURE_INTENTIONALLY_GENERIC_CONTENT,
        initializedState
      );

      const distFindings = report.findings.filter((f) => f.dimension === 'distinctiveness');
      expect(distFindings.length).toBeGreaterThanOrEqual(1);

      const allInOne = distFindings.find((f) => f.evidence.includes('all-in-one platform'));
      expect(allInOne).toBeDefined();
      expect(allInOne?.severity).toBe('high');
      expect(allInOne?.explanation.whyItMatters).toContain('indistinguishable');
    });
  });

  // ==========================================
  // 2. CAUSAL EXPLANATIONS & STRUCTURED OUTPUTS
  // ==========================================
  describe('Causal Explanations & Independent Scoring', () => {
    it('strictly satisfies the 4-part causal explanation schema on every finding', () => {
      const report = ConsistencyGuardian.evaluateArtifact(FIXTURE_UNSUPPORTED_CLAIM, initializedState);

      for (const finding of report.findings) {
        expect(finding.explanation.whatIsWrong.length).toBeGreaterThan(5);
        expect(finding.explanation.whyItMatters.length).toBeGreaterThan(5);
        expect(finding.explanation.whichDecisionConflicts.length).toBeGreaterThan(3);
        expect(finding.explanation.howToCorrect.length).toBeGreaterThan(5);

        // Ensure internal chain-of-thought is suppressed
        expect((finding as any).thought).toBeUndefined();
        expect((finding.explanation as any).internalReasoning).toBeUndefined();
      }
    });

    it('never collapses the 9 dimensions into a single magical score', () => {
      const report = ConsistencyGuardian.evaluateArtifact(FIXTURE_VISUAL_MISMATCH, initializedState);

      const dimKeys = Object.keys(report.dimensions);
      expect(dimKeys.length).toBe(9);

      // Verify dimensions have independent scores
      expect(report.dimensions.visual_alignment.score).toBeLessThan(100);
      expect(report.dimensions.strategic_alignment.score).toBe(100);
      expect(report.dimensions.unsupported_claims.score).toBe(100);
    });
  });

  // ==========================================
  // 3. REPAIR MODE & IN-PLACE NON-DESTRUCTIVE HEALING
  // ==========================================
  describe('Repair Mode', () => {
    it('applies suggested repair non-destructively, creates a new version, and fixes the violation', () => {
      const initialReport = ConsistencyGuardian.evaluateArtifact(FIXTURE_UNSUPPORTED_CLAIM, initializedState);
      const bugFreeFinding = initialReport.findings.find((f) => f.evidence.includes('100% bug free'));
      expect(bugFreeFinding).toBeDefined();

      const repairedArtifact = ConsistencyGuardian.applyRepair(
        { ...FIXTURE_UNSUPPORTED_CLAIM, validationReport: initialReport },
        bugFreeFinding!.id
      );

      // Verify non-destructive version history increment
      expect(repairedArtifact.versionHistory.length).toBe(2);
      expect(repairedArtifact.versionHistory[1].editedBy).toBe('auto_repair');
      expect(repairedArtifact.versionHistory[1].editReason).toContain(bugFreeFinding!.issue);

      // Verify text replacement
      expect(repairedArtifact.content).toContain(bugFreeFinding!.suggestedRepair);
      expect(repairedArtifact.content).not.toContain('100% bug free');

      // Verify re-audit clears this specific finding
      const updatedReport = ConsistencyGuardian.evaluateArtifact(repairedArtifact, initializedState);
      const recheckedFinding = updatedReport.findings.find((f) => f.evidence.includes('100% bug free'));
      expect(recheckedFinding).toBeUndefined();
    });

    it('throws error when trying to apply repair to a locked artifact', () => {
      const lockedArtifact = {
        ...FIXTURE_UNSUPPORTED_CLAIM,
        isLocked: true,
      };

      expect(() => {
        ConsistencyGuardian.applyRepair(lockedArtifact, 'dummy-id');
      }).toThrow(/Cannot modify locked artifact/);
    });

    it('synthesizes on-brand default artifacts for all 8 supported types', () => {
      const supportedTypes = [
        'website_headline',
        'landing_page_section',
        'linkedin_post',
        'social_caption',
        'launch_email',
        'pitch_paragraph',
        'product_onboarding_copy',
        'support_response',
      ] as const;

      for (const type of supportedTypes) {
        const artifact = ConsistencyGuardian.generateDefaultArtifact(type, initializedState);
        expect(artifact.artifactType).toBe(type);
        expect(artifact.content.length).toBeGreaterThan(20);
        expect(artifact.isApproved).toBe(false);
        expect(artifact.isLocked).toBe(false);

        // Verify default synthesized artifact conforms to brand
        const report = ConsistencyGuardian.evaluateArtifact(artifact, initializedState);
        expect(report.blockingFindingsCount).toBe(0);
      }
    });
  });

  // ==========================================
  // 4. BRAND STORE GUARDIAN ACTIONS & GRAPH COMMITMENT
  // ==========================================
  describe('BrandStore Guardian Integration', () => {
    it('generates on-brand artifact and stores it in brandArtifacts', async () => {
      const res = await useBrandStore.getState().generateArtifact('website_headline');
      expect(res).toBe(true);

      const { project } = useBrandStore.getState();
      expect(project.brandArtifacts?.length).toBeGreaterThanOrEqual(1);
      expect(project.selectedArtifactId).toBeDefined();

      const active = project.brandArtifacts?.find((a) => a.id === project.selectedArtifactId);
      expect(active?.artifactType).toBe('website_headline');
      expect(active?.validationReport).toBeDefined();
    });

    it('creates custom artifact and audits it in-place', () => {
      useBrandStore
        .getState()
        .createCustomArtifact('Custom Q3 Update', 'launch_email', 'Three comments or zero. Deterministic checks.');

      const { project } = useBrandStore.getState();
      const custom = project.brandArtifacts?.find((a) => a.name === 'Custom Q3 Update');

      expect(custom).toBeDefined();
      expect(custom?.validationReport).toBeDefined();
      expect(custom?.validationReport?.passed).toBe(true);
    });

    it('manually edits an artifact, appends user version history, and re-audits', () => {
      useBrandStore
        .getState()
        .createCustomArtifact('Editable Artifact', 'website_headline', 'Initial headline text.');
      const artifact = useBrandStore.getState().project.brandArtifacts![0];

      useBrandStore
        .getState()
        .manuallyEditArtifact(artifact.id, 'Surgical PR review with zero false positives.', 'Polished value prop');

      const updated = useBrandStore.getState().project.brandArtifacts![0];
      expect(updated.versionHistory.length).toBe(2);
      expect(updated.versionHistory[1].editedBy).toBe('user');
      expect(updated.content).toBe('Surgical PR review with zero false positives.');
    });

    it('ignores finding with founder reason and recalculates report pass status', async () => {
      // Add artifact with an unsupported claim
      useBrandStore
        .getState()
        .createCustomArtifact('Claim Test', 'pitch_paragraph', 'We guarantee 100% bug free software.');
      const artifact = useBrandStore.getState().project.brandArtifacts![0];
      const findingId = artifact.validationReport!.findings[0].id;

      expect(artifact.validationReport?.passed).toBe(false);

      useBrandStore
        .getState()
        .ignoreFinding(artifact.id, findingId, 'Intentional marketing hyperbole for internal mock only');

      const updated = useBrandStore.getState().project.brandArtifacts![0];
      const ignoredFinding = updated.validationReport?.findings.find((f) => f.id === findingId);

      expect(ignoredFinding?.status).toBe('ignored');
      expect(ignoredFinding?.ignoredReason).toContain('Intentional marketing hyperbole');
      expect(updated.validationReport?.passed).toBe(true);
    });

    it('locks approved artifact, prevents silent overwrites, and commits canonical node to Decision Graph', () => {
      useBrandStore
        .getState()
        .createCustomArtifact('Canonical Launch Headline', 'website_headline', 'Three comments or zero.');
      const artifact = useBrandStore.getState().project.brandArtifacts![0];

      const initialVersion = useBrandStore.getState().project.metadata.version;
      useBrandStore.getState().lockApprovedArtifact(artifact.id, 'Approved canonical hero headline');

      const { project, snapshots } = useBrandStore.getState();
      const lockedArt = project.brandArtifacts![0];

      expect(lockedArt.isLocked).toBe(true);
      expect(lockedArt.isApproved).toBe(true);
      expect(lockedArt.status).toBe('locked');
      expect(project.stage).toBe('guardian_locked');
      expect(project.metadata.version).toBeGreaterThan(initialVersion);
      expect(snapshots.some((s) => s.label.includes('Locked Canonical Artifact'))).toBe(true);

      // Verify Decision Graph Node was created
      const decisionNodes = Object.values(project.decisionGraph.nodes);
      const artifactDecision = decisionNodes.find((n) => n.title.includes('Canonical Launch Headline'));
      expect(artifactDecision).toBeDefined();
      expect(artifactDecision?.approvedValue).toBe('Three comments or zero.');

      // Attempting to manually edit the locked artifact must be rejected
      useBrandStore.getState().manuallyEditArtifact(lockedArt.id, 'Overwritten content silently');
      const recheckedArt = useBrandStore.getState().project.brandArtifacts![0];
      expect(recheckedArt.content).toBe('Three comments or zero.'); // Unchanged!
    });

    it('preserves brand artifacts and validation reports across JSON export and import', async () => {
      useBrandStore
        .getState()
        .createCustomArtifact('Export Test Headline', 'website_headline', 'Three comments or zero.');
      const artifact = useBrandStore.getState().project.brandArtifacts![0];
      useBrandStore.getState().lockApprovedArtifact(artifact.id);

      const exported = useBrandStore.getState().exportProjectJSON();

      // Reset store completely
      useBrandStore.getState().resetProject();
      expect(useBrandStore.getState().project.brandArtifacts).toHaveLength(0);

      // Import project
      const res = useBrandStore.getState().importProjectJSON(exported);
      expect(res.success).toBe(true);

      const reloaded = useBrandStore.getState().project;
      expect(reloaded.brandArtifacts?.length).toBeGreaterThanOrEqual(1);
      const reloadedArt = reloaded.brandArtifacts![0];
      expect(reloadedArt.name).toBe('Export Test Headline');
      expect(reloadedArt.isLocked).toBe(true);
      expect(reloadedArt.validationReport).toBeDefined();
    });
  });
});
