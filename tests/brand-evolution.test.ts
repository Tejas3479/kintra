import { describe, it, expect, beforeEach } from 'vitest';
import { useBrandStore } from '@/store/useBrandStore';
import { DEMO_BRAND_PRGUARD } from '@/fixtures/demo-brands';
import { StrategyService } from '@/lib/strategy/strategy-service';
import { IdentityService } from '@/lib/identity/identity-service';
import { BrandEvolutionEngine } from '@/lib/evolution/brand-evolution-engine';
import { AssumptionChangeRequest } from '@/types/evolution';
import { CanonicalBrandState } from '@/types/brand';
import { BrandArtifact } from '@/types/guardian';

describe('Brand Evolution Engine Suite (Prompt 10 Parts B-F)', () => {
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

    const initialArtifacts: BrandArtifact[] = [
      {
        id: 'art-headline-1',
        name: 'Website Headline',
        artifactType: 'website_headline',
        content: 'Deterministic Pull Request Intelligence for Platform Engineers.',
        targetAudience: 'Senior Platform Engineers',
        versionHistory: [
          {
            version: 1,
            content: 'Deterministic Pull Request Intelligence for Platform Engineers.',
            editedAt: '2026-09-24T12:00:00Z',
            editedBy: 'user',
          },
        ],
        status: 'approved',
        isApproved: true,
        isLocked: true,
        createdAt: '2026-09-24T12:00:00Z',
        updatedAt: '2026-09-24T12:00:00Z',
      },
      {
        id: 'art-email-1',
        name: 'Outbound Sales Email',
        artifactType: 'launch_email',
        content: 'Subject: Zero logic escapes in platform repos. Eliminating manual review for platform teams.',
        targetAudience: 'Senior Platform Engineers',
        versionHistory: [
          {
            version: 1,
            content: 'Subject: Zero logic escapes in platform repos. Eliminating manual review for platform teams.',
            editedAt: '2026-09-24T12:00:00Z',
            editedBy: 'user',
          },
        ],
        status: 'approved',
        isApproved: true,
        isLocked: true,
        createdAt: '2026-09-24T12:00:00Z',
        updatedAt: '2026-09-24T12:00:00Z',
      },
      {
        id: 'art-support-1',
        name: 'Technical Support Response',
        artifactType: 'support_response',
        content: 'We checked the AST trace for CI run #449. The bug is in the type checker.',
        targetAudience: 'Software Engineers',
        versionHistory: [],
        status: 'approved',
        isApproved: true,
        isLocked: false,
        createdAt: '2026-09-24T12:00:00Z',
        updatedAt: '2026-09-24T12:00:00Z',
      },
    ];

    useBrandStore.setState((s) => ({
      project: {
        ...s.project,
        creativeIdentity: identity,
        brandArtifacts: initialArtifacts,
        stage: 'identity_locked',
      },
    }));

    initializedState = useBrandStore.getState().project;
  });

  it('Part C & D: performs dependency analysis and impact preview on target audience change', () => {
    const changeRequest: AssumptionChangeRequest = {
      id: 'req-aud-1',
      category: 'target_audience',
      title: 'Audience Pivot: Platform Engineers → Enterprise CISOs',
      currentValue: 'Senior Platform Engineers',
      proposedValue: 'Enterprise CISOs & Compliance Officers',
      rationale: 'Compliance buyers have centralized procurement budgets.',
      requestedAt: '2026-09-24T12:00:00Z',
    };

    const report = BrandEvolutionEngine.analyzeAssumptionImpact(changeRequest, initializedState);

    expect(report.changeRequestId).toBe('req-aud-1');
    expect(report.blastRadius.mustRegenerateCount).toBeGreaterThan(0);
    expect(report.blastRadius.remainsValidCount).toBeGreaterThan(0);

    // Verify key decision nodes are classified properly
    const proofNode = report.blastRadius.affectedDecisions.find((d) => d.nodeId === 'node-proof-model');
    expect(proofNode?.impactStatus).toBe('remains_valid');

    const nameNode = report.blastRadius.affectedDecisions.find((d) => d.nodeId === 'node-brand-name');
    expect(nameNode?.impactStatus).toBe('remains_valid');

    const targetNode = report.blastRadius.affectedDecisions.find((d) => d.nodeId === 'node-target-niche');
    expect(targetNode?.impactStatus).toBe('must_regenerate');

    // Verify artifacts are classified properly
    const emailArt = report.blastRadius.affectedArtifacts.find((a) => a.nodeId === 'art-email-1');
    expect(emailArt?.impactStatus).toBe('must_regenerate');

    const supportArt = report.blastRadius.affectedArtifacts.find((a) => a.nodeId === 'art-support-1');
    expect(supportArt?.impactStatus).toBe('remains_valid');
  });

  it('Part E & F: keeps old decision when user cancels (never silently overwrites)', () => {
    const changeRequest: AssumptionChangeRequest = {
      id: 'req-aud-2',
      category: 'target_audience',
      title: 'Proposed Pivot',
      currentValue: 'Senior Platform Engineers',
      proposedValue: 'Consumer Mobile Developers',
      rationale: 'Exploring B2C market.',
      requestedAt: '2026-09-24T12:00:00Z',
    };

    const result = BrandEvolutionEngine.applyEvolution(changeRequest, initializedState, 'keep_old_decision');

    expect(result.updatedState.metadata.version).toBe(initializedState.metadata.version);
    expect(result.summary).toContain('rejected by founder');
    expect(result.updatedState.brandArtifacts?.[0].content).toBe(initializedState.brandArtifacts?.[0].content);
  });

  it('Part E & F: creates a branch and preserves pre-evolution snapshot', () => {
    const changeRequest: AssumptionChangeRequest = {
      id: 'req-aud-3',
      category: 'target_audience',
      title: 'Branch for CISOs',
      currentValue: 'Senior Platform Engineers',
      proposedValue: 'Enterprise CISOs & Compliance Officers',
      rationale: 'Creating parallel enterprise branch.',
      requestedAt: '2026-09-24T12:00:00Z',
    };

    const result = BrandEvolutionEngine.applyEvolution(
      changeRequest,
      initializedState,
      'branch_brand',
      'ciso-enterprise'
    );

    expect(result.newBranch).toBeDefined();
    expect(result.newBranch?.name).toBe('ciso-enterprise');
    expect(result.newBranch?.snapshot.version).toBe(initializedState.metadata.version);
    expect(result.updatedState.metadata.version).toBe(initializedState.metadata.version + 1);

    // Verify affected artifacts were regenerated with new audience
    const headline = result.updatedState.brandArtifacts?.find((a) => a.artifactType === 'website_headline');
    expect(headline?.targetAudience).toBe('Enterprise CISOs & Compliance Officers');
    expect(headline?.versionHistory.length).toBe(2);

    // Verify unaffected artifacts remain intact
    const support = result.updatedState.brandArtifacts?.find((a) => a.artifactType === 'support_response');
    expect(support?.content).toBe(initializedState.brandArtifacts?.find((a) => a.artifactType === 'support_response')?.content);
  });

  it('Part F: compares two branches and returns divergence diff', () => {
    const baseBranch = {
      id: 'branch-main',
      name: 'main',
      description: 'Core developer brand',
      createdAt: '2026-09-24T12:00:00Z',
      snapshot: {
        id: 'snap-main',
        version: 1,
        label: 'Main Branch',
        timestamp: '2026-09-24T12:00:00Z',
        state: initializedState,
      },
    };

    const changeRequest: AssumptionChangeRequest = {
      id: 'req-aud-4',
      category: 'target_audience',
      title: 'Branch diff test',
      currentValue: 'Senior Platform Engineers',
      proposedValue: 'Enterprise CISOs & Compliance Officers',
      rationale: 'Enterprise test.',
      requestedAt: '2026-09-24T12:00:00Z',
    };

    const evolved = BrandEvolutionEngine.applyEvolution(changeRequest, initializedState, 'apply_update');

    const targetBranch = {
      id: 'branch-ciso',
      name: 'ciso-enterprise',
      description: 'CISO enterprise brand',
      createdAt: '2026-09-24T12:00:00Z',
      snapshot: {
        id: 'snap-ciso',
        version: 2,
        label: 'CISO Branch',
        timestamp: '2026-09-24T12:00:00Z',
        state: evolved.updatedState,
      },
    };

    const diff = BrandEvolutionEngine.compareBranches(baseBranch, targetBranch);

    expect(diff.baseBranchName).toBe('main');
    expect(diff.targetBranchName).toBe('ciso-enterprise');
    expect(diff.assumptionDiffs.find((d) => d.key === 'target_audience')?.status).toBe('modified');
    expect(diff.decisionDiffs.find((d) => d.key === 'brand_name')?.status).toBe('identical');
    expect(diff.divergenceScore).toBeGreaterThan(0);
  });

  it('strictly preserves brand_name DecisionNode when evolving target_audience (P0-4)', () => {
    // Add brand_name decision node
    const testState: CanonicalBrandState = JSON.parse(JSON.stringify(initializedState));
    testState.decisionGraph.nodes['decision-name-1'] = {
      id: 'decision-name-1',
      category: 'brand_name',
      title: 'Brand Name: Kintra',
      approvedValue: 'Kintra',
      rationale: 'Selected kinetic brand name',
      evidenceIds: [],
      rejectedAlternatives: [],
      tradeoff: 'Sharp phonetics',
      dependsOn: [],
      governs: [],
      status: 'approved',
      version: 1,
    };

    const changeRequest: AssumptionChangeRequest = {
      id: 'req-aud-preserve',
      category: 'target_audience',
      title: 'Audience pivot',
      currentValue: 'Senior Platform Engineers',
      proposedValue: 'Enterprise CISOs',
      rationale: 'Moving upmarket.',
      requestedAt: '2026-09-24T12:00:00Z',
    };

    const evolved = BrandEvolutionEngine.applyEvolution(changeRequest, testState, 'apply_update');

    // Brand name node MUST NOT be mutated to 'Enterprise CISOs'
    expect(evolved.updatedState.decisionGraph.nodes['decision-name-1'].approvedValue).toBe('Kintra');
    expect(evolved.updatedState.decisionGraph.nodes['decision-name-1'].category).toBe('brand_name');
  });

  it('supports pricing_tier evolution with selective artifact regeneration (P1-3)', () => {
    const changeRequest: AssumptionChangeRequest = {
      id: 'req-price-1',
      category: 'pricing_tier',
      title: 'Packaging evolution',
      currentValue: 'Developer Free-Tier + Usage',
      proposedValue: 'Enterprise Annual $50k Flat',
      rationale: 'Shift to high-ACV enterprise contracts.',
      requestedAt: '2026-09-24T12:00:00Z',
    };

    const evolved = BrandEvolutionEngine.applyEvolution(changeRequest, initializedState, 'apply_update');

    expect(evolved.updatedState.metadata.version).toBe(initializedState.metadata.version + 1);
    expect(evolved.summary).toContain('Enterprise Annual $50k Flat');

    // Graph node should be created/updated for pricing_tier
    const pricingNode = Object.values(evolved.updatedState.decisionGraph.nodes).find(
      (n) => n.category === 'pricing_tier'
    );
    expect(pricingNode).toBeDefined();
    expect(pricingNode?.approvedValue).toBe('Enterprise Annual $50k Flat');

    // Launch email should be regenerated to reflect enterprise packaging
    const launchEmail = evolved.updatedState.brandArtifacts?.find((a) => a.artifactType === 'launch_email');
    expect(launchEmail?.content).toContain('Enterprise Annual $50k Flat');
  });

  it('supports emotional_territory evolution with headline tone updates (P1-3)', () => {
    const changeRequest: AssumptionChangeRequest = {
      id: 'req-emo-1',
      category: 'emotional_territory',
      title: 'Posture shift',
      currentValue: 'Clinical, mathematical verification',
      proposedValue: 'Unapologetic, razor-sharp defiance',
      rationale: 'Differentiate with aggressive technical stance.',
      requestedAt: '2026-09-24T12:00:00Z',
    };

    const evolved = BrandEvolutionEngine.applyEvolution(changeRequest, initializedState, 'apply_update');

    const selectedWorld = evolved.updatedState.positioningWorlds.find(
      (w) => w.id === evolved.updatedState.selectedWorldId
    );
    expect(selectedWorld?.emotionalTerritory).toBe('Unapologetic, razor-sharp defiance');

    // Website headline should be regenerated to reflect emotional posture
    const headline = evolved.updatedState.brandArtifacts?.find((a) => a.artifactType === 'website_headline');
    expect(headline?.content).toContain('Unapologetic, razor-sharp defiance');
  });
});

