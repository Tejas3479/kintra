import { PositioningWorld, ContradictionAlert } from '@/types/strategy';
import { EvidenceRecord } from '@/types/research';

export class ContradictionDetector {
  /**
   * Scans a positioning world against established strategic integrity rules
   */
  static auditPositioningWorld(
    world: PositioningWorld,
    evidenceLedger: EvidenceRecord[] = []
  ): ContradictionAlert[] {
    const alerts: ContradictionAlert[] = [];
    const textCorpus = `${world.targetAudience} ${world.problemFraming} ${world.valueProposition} ${world.differentiator} ${world.emotionalTerritory}`.toLowerCase();

    // Rule 1: Technical Audience vs Childish/Playful Tone
    const isTechnical = /engineer|developer|devops|ciso|architect|technical|cto|sysadmin/i.test(world.targetAudience);
    const hasPlayfulBuzzwords = /cutesy|playful|super\s+fun|whimsical|game-like|emoji|gamified/i.test(textCorpus);

    if (isTechnical && hasPlayfulBuzzwords) {
      alerts.push({
        id: `conflict-tone-${Date.now()}`,
        conflictType: 'audience_tone_mismatch',
        exactContradiction:
          'Audience is technical engineering leads, but emotional territory uses playful/cutesy vocabulary that degrades professional credibility.',
        severity: 'blocking',
        suggestedResolution:
          'Shift emotional territory to "quiet technical mastery", "surgical precision", or "calm developer flow".',
        affectedField: 'emotionalTerritory',
      });
    }

    // Rule 2: Premium Enterprise Positioning vs Commodity/Free Framing
    const isEnterprise = /enterprise|fortune|governance|compliance|ciso|procurement/i.test(world.targetAudience);
    const hasCommodityTerms = /cheap|discount|freemium|bargain|lowest\s+price|mass\s+market|budget/i.test(textCorpus);

    if (isEnterprise && hasCommodityTerms) {
      alerts.push({
        id: `conflict-pricing-${Date.now()}`,
        conflictType: 'premium_commodity_mismatch',
        exactContradiction:
          'Targeting enterprise procurement, but value proposition emphasizes cheap/budget discount pricing, signaling low reliability.',
        severity: 'blocking',
        suggestedResolution:
          'Emphasize ROI, catastrophic risk avoidance, and engineering turnaround efficiency over cheapness.',
        affectedField: 'valueProposition',
      });
    }

    // Rule 3: Trust & Absolute Guarantees without Supporting Evidence
    const hasAbsoluteClaims = /100%\s+guaranteed|never\s+fails|flawless|unhackable|zero\s+bugs|absolute\s+perfection/i.test(textCorpus);
    const hasVerifiedEvidence = world.supportingEvidenceIds.length > 0 &&
      world.supportingEvidenceIds.some((id) => evidenceLedger.some((e) => e.id === id && e.confidence >= 0.85));

    if (hasAbsoluteClaims && !hasVerifiedEvidence) {
      alerts.push({
        id: `conflict-trust-${Date.now()}`,
        conflictType: 'trust_evidence_gap',
        exactContradiction:
          'Value proposition makes absolute claims ("never fails" / "100% bug free") without empirical evidence groundings.',
        severity: 'warning',
        suggestedResolution:
          'Replace unearned absolutes with verifiable, bounded claims (e.g. "catches 95% of logic flaws with under 3% false positives").',
        affectedField: 'valueProposition',
      });
    }

    // Rule 4: Radical Specialization vs "All-in-One" Broad Platform Creep
    const isSpecialist = /specialist|purist|dedicated|laser-focused|niche/i.test(world.archetype) ||
      /single|only|surgical/i.test(world.differentiator);
    const hasBroadPlatformTerms = /all-in-one|end-to-end\s+suite|everything\s+you\s+need|full\s+lifecycle\s+platform/i.test(textCorpus);

    if (isSpecialist && hasBroadPlatformTerms) {
      alerts.push({
        id: `conflict-broad-${Date.now()}`,
        conflictType: 'broad_narrow_conflict',
        exactContradiction:
          'Positioned as a surgical specialist, but copy promises an "all-in-one platform for everything", muddying the core differentiation.',
        severity: 'warning',
        suggestedResolution:
          'Honor the strategic sacrifice: declare what you do NOT do, and double down on the single core mechanic.',
        affectedField: 'differentiator',
      });
    }

    return alerts;
  }
}
