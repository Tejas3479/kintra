import { describe, it, expect, beforeEach } from 'vitest';
import { StrategyService } from '@/lib/strategy/strategy-service';
import { ContradictionDetector } from '@/lib/strategy/contradiction-detector';
import { useBrandStore } from '@/store/useBrandStore';
import { DEMO_BRAND_PRGUARD } from '@/fixtures/demo-brands';
import { PositioningWorld } from '@/types/strategy';
import { PositioningWorldSchema } from '@/lib/schemas/strategy-schemas';

describe('Strategic Reasoning Layer & Decision Graph Suite', () => {
  beforeEach(() => {
    useBrandStore.getState().resetProject();
  });

  // 1. Positioning Worlds Generation & Diversity
  it('generates 3 high-contrast positioning worlds with explicit sacrifices', () => {
    const brief = DEMO_BRAND_PRGUARD.ideaBrief;
    const worlds = StrategyService.generateWorlds(brief);

    expect(worlds.length).toBe(3);
    for (const w of worlds) {
      expect(PositioningWorldSchema.safeParse(w).success).toBe(true);
      expect(w.tradeoffs.whatWeEmphasize).toBeDefined();
      expect(w.tradeoffs.whatWeSacrifice).toBeDefined();
      expect(w.tradeoffs.whatWeSacrifice.length).toBeGreaterThan(10);
      expect(w.challenges.length).toBeGreaterThan(0);
    }

    // Verify contrast: World A vs World B archetypes differ
    expect(worlds[0].archetype).not.toBe(worlds[1].archetype);
  });

  // 2. Contradiction Detection Rules
  describe('ContradictionDetector', () => {
    it('flags audience_tone_mismatch when technical audience is paired with playful/cutesy buzzwords', () => {
      const world: PositioningWorld = {
        id: 'w-contradict-1',
        title: 'Cutesy PR Bot',
        archetype: 'The Engineering Purist',
        targetAudience: 'Senior Staff Engineers and DevOps architects',
        problemFraming: 'Slow code reviews stall release pipelines.',
        valueProposition: 'Super fun and playful emoji code reviews for your team!',
        differentiator: 'Cute gamified PR stickers',
        categoryFraming: 'Developer Productivity',
        emotionalTerritory: 'Super fun, whimsical, playful vibes with cute emoji',
        proofMechanism: 'Fast reviews',
        supportingEvidenceIds: [],
        assumptions: ['Engineers love cutesy bots'],
        risks: ['None'],
        tradeoffs: { whatWeEmphasize: 'Fun', whatWeSacrifice: 'Strictness' },
        challenges: [],
        status: 'candidate',
      };

      const alerts = ContradictionDetector.auditPositioningWorld(world);
      expect(alerts.some((a) => a.conflictType === 'audience_tone_mismatch')).toBe(true);
      expect(alerts[0].severity).toBe('blocking');
    });

    it('flags premium_commodity_mismatch when enterprise CISO targets are paired with cheap discount framing', () => {
      const world: PositioningWorld = {
        id: 'w-contradict-2',
        title: 'Cheap Enterprise Gate',
        archetype: 'The Sovereign Gatekeeper',
        targetAudience: 'Enterprise CISOs and Fortune 500 compliance auditors',
        problemFraming: 'Regulatory risks in code.',
        valueProposition: 'The lowest price, cheap bargain security gatekeeper for mass market budget teams.',
        differentiator: 'Cheapest on the market',
        categoryFraming: 'Enterprise Governance',
        emotionalTerritory: 'Budget savings',
        proofMechanism: 'Cost calculator',
        supportingEvidenceIds: [],
        assumptions: ['CISOs look for cheap bargains'],
        risks: ['Low perceived quality'],
        tradeoffs: { whatWeEmphasize: 'Cost', whatWeSacrifice: 'Features' },
        challenges: [],
        status: 'candidate',
      };

      const alerts = ContradictionDetector.auditPositioningWorld(world);
      expect(alerts.some((a) => a.conflictType === 'premium_commodity_mismatch')).toBe(true);
    });

    it('flags trust_evidence_gap when claiming 100% bug free guarantees without empirical evidence', () => {
      const world: PositioningWorld = {
        id: 'w-contradict-3',
        title: 'Unhackable Guard',
        archetype: 'The Sovereign Gatekeeper',
        targetAudience: 'Engineering managers',
        problemFraming: 'Bugs in production.',
        valueProposition: '100% guaranteed flawless security that never fails with zero bugs forever.',
        differentiator: 'Unhackable guarantee',
        categoryFraming: 'Code Security',
        emotionalTerritory: 'Certainty',
        proofMechanism: 'Guarantees',
        supportingEvidenceIds: [], // Empty evidence!
        assumptions: ['Zero bugs possible'],
        risks: ['Liability'],
        tradeoffs: { whatWeEmphasize: 'Perfection', whatWeSacrifice: 'Flexibility' },
        challenges: [],
        status: 'candidate',
      };

      const alerts = ContradictionDetector.auditPositioningWorld(world);
      expect(alerts.some((a) => a.conflictType === 'trust_evidence_gap')).toBe(true);
    });
  });

  // 3. User Choice & Decision Graph Commitment
  describe('User Choice & Decision Graph Transitions', () => {
    it('does not make rejected positioning canonical; records rejection in graph', () => {
      useBrandStore.getState().loadDemoProject();
      const brief = DEMO_BRAND_PRGUARD.ideaBrief;
      const worlds = StrategyService.generateWorlds(brief);

      useBrandStore.setState((s) => ({
        project: {
          ...s.project,
          positioningWorlds: worlds,
        },
      }));

      // Reject World B
      useBrandStore.getState().rejectPositioningWorld('world-partner', 'Too focused on speed rather than accuracy.');

      const stateAfterReject = useBrandStore.getState().project;
      const rejectedWorld = stateAfterReject.positioningWorlds.find((w) => w.id === 'world-partner');
      expect(rejectedWorld?.status).toBe('rejected');
      expect(rejectedWorld?.rejectionReason).toBe('Too focused on speed rather than accuracy.');

      // Select World A
      useBrandStore.getState().selectPositioningWorld('world-purist', 'Verified precision model.');

      const stateAfterSelect = useBrandStore.getState().project;
      expect(stateAfterSelect.selectedWorldId).toBe('world-purist');
      expect(stateAfterSelect.stage).toBe('strategy_locked');

      const decisionNodes = Object.values(stateAfterSelect.decisionGraph.nodes);
      expect(decisionNodes.length).toBeGreaterThanOrEqual(1);

      const decision = decisionNodes.find((n) => n.category === 'positioning_world');
      expect(decision).toBeDefined();
      expect(decision!.title).toContain('The Engineering Purist');
      expect(decision!.rejectedAlternatives.some((a) => a.id === 'world-partner')).toBe(true);
      expect(decision!.rejectedAlternatives.find((a) => a.id === 'world-partner')?.whyRejected).toBe(
        'Too focused on speed rather than accuracy.'
      );
    });

    it('propagates approved positioning and preserves evidence references', () => {
      useBrandStore.getState().loadDemoProject();
      const brief = DEMO_BRAND_PRGUARD.ideaBrief;
      const evidence = useBrandStore.getState().project.marketLandscape?.evidenceRecords || [];
      const worlds = StrategyService.generateWorlds(brief, evidence);

      useBrandStore.setState((s) => ({
        project: {
          ...s.project,
          positioningWorlds: worlds,
        },
      }));

      useBrandStore.getState().selectPositioningWorld('world-purist', 'Selected for accuracy.');

      const { project } = useBrandStore.getState();
      const decisionNode = Object.values(project.decisionGraph.nodes).find(
        (n) => n.category === 'positioning_world'
      )!;

      expect(decisionNode).toBeDefined();
      expect(decisionNode.status).toBe('approved');
      expect(decisionNode.evidenceIds.length).toBeGreaterThan(0);
      expect(project.decisions[decisionNode.id]).toBeDefined();
      expect(project.decisions[decisionNode.id].approvedBy).toBe('founder');
    });

    it('creates version snapshot when decision is committed', () => {
      useBrandStore.getState().loadDemoProject();
      const initialVersion = useBrandStore.getState().project.metadata.version;
      const worlds = StrategyService.generateWorlds(DEMO_BRAND_PRGUARD.ideaBrief);

      useBrandStore.setState((s) => ({
        project: {
          ...s.project,
          positioningWorlds: worlds,
        },
      }));

      useBrandStore.getState().selectPositioningWorld('world-purist');

      const { project, snapshots } = useBrandStore.getState();
      expect(project.metadata.version).toBeGreaterThan(initialVersion);
      expect(snapshots.length).toBeGreaterThan(0);
      expect(snapshots[0].label).toContain('Locked Positioning Strategy');
    });

    it('editing an approved decision updates the decision graph and increments version with snapshot', () => {
      useBrandStore.getState().loadDemoProject();
      const brief = DEMO_BRAND_PRGUARD.ideaBrief;
      const worlds = StrategyService.generateWorlds(brief);

      useBrandStore.setState((s) => ({
        project: {
          ...s.project,
          positioningWorlds: worlds,
        },
      }));

      useBrandStore.getState().selectPositioningWorld('world-purist');

      const v1 = useBrandStore.getState().project.metadata.version;
      const decisionNodeId = Object.keys(useBrandStore.getState().project.decisionGraph.nodes)[0];

      // Edit the decision directly
      useBrandStore.getState().editDecision(decisionNodeId, {
        approvedValue: 'Edited value proposition: Surgical PR review with zero false positives.',
        tradeoff: 'Sacrificing broad non-technical appeal.',
      });

      const updatedProject = useBrandStore.getState().project;
      const updatedNode = updatedProject.decisionGraph.nodes[decisionNodeId];

      expect(updatedProject.metadata.version).toBeGreaterThan(v1);
      expect(updatedNode.approvedValue).toBe(
        'Edited value proposition: Surgical PR review with zero false positives.'
      );
      expect(updatedNode.version).toBe(updatedProject.metadata.version);

      const snapshots = useBrandStore.getState().snapshots;
      expect(snapshots.some((s) => s.label.includes('Edited Decision'))).toBe(true);
    });

    it('preserves decision graph across JSON export and import', () => {
      useBrandStore.getState().loadDemoProject();
      const worlds = StrategyService.generateWorlds(DEMO_BRAND_PRGUARD.ideaBrief);

      useBrandStore.setState((s) => ({
        project: {
          ...s.project,
          positioningWorlds: worlds,
        },
      }));

      useBrandStore.getState().selectPositioningWorld('world-purist');
      const exported = useBrandStore.getState().exportProjectJSON();

      useBrandStore.getState().resetProject();
      expect(Object.keys(useBrandStore.getState().project.decisionGraph.nodes)).toHaveLength(0);

      const res = useBrandStore.getState().importProjectJSON(exported);
      expect(res.success).toBe(true);

      const reloaded = useBrandStore.getState().project;
      expect(reloaded.selectedWorldId).toBe('world-purist');
      expect(Object.keys(reloaded.decisionGraph.nodes).length).toBeGreaterThanOrEqual(1);
      expect(reloaded.decisionGraph.nodes['brief-baseline']).toBeDefined();
    });
  });
});
