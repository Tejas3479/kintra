import {
  NamingCandidate,
  TaglineCandidate,
  VoiceSystem,
  VisualSystem,
  IdentityConsistencyConflict,
} from '@/types/identity';
import { PositioningWorld } from '@/types/strategy';

export class IdentityConsistencyChecker {
  /**
   * Audits consistency across Name, Tagline, Voice, and Visual Direction
   */
  static auditConsistency(params: {
    selectedName?: NamingCandidate | null;
    selectedTagline?: TaglineCandidate | null;
    voiceSystem?: VoiceSystem | null;
    visualSystem?: VisualSystem | null;
    positioningWorld?: PositioningWorld | null;
  }): IdentityConsistencyConflict[] {
    const conflicts: IdentityConsistencyConflict[] = [];
    const now = new Date().toISOString();

    const { selectedName, selectedTagline, voiceSystem, visualSystem, positioningWorld } = params;

    // 1. Name vs Positioning / Voice Conflict
    if (selectedName && voiceSystem) {
      const isPlayfulName = /cutesy|bot|buddy|pals|fun/i.test(selectedName.name);
      const isUltraSeriousVoice = voiceSystem.tonalSliders.precision > 75 && voiceSystem.tonalSliders.warmth < 30;

      if (isPlayfulName && isUltraSeriousVoice) {
        conflicts.push({
          id: `conflict-name-voice-${Date.now()}`,
          layerA: 'name',
          layerB: 'voice',
          conflictDescription: `Name "${selectedName.name}" carries informal or playful connotations, but Brand Voice demands clinical precision (${voiceSystem.tonalSliders.precision}%) and low warmth (${voiceSystem.tonalSliders.warmth}%).`,
          severity: 'blocking',
          suggestedAlignment: 'Choose a name rooted in deterministic mechanism, mathematical verification, or architectural mastery.',
          detectedAt: now,
        });
      }

      if (selectedName.genericnessRisk === 'high') {
        conflicts.push({
          id: `conflict-name-generic-${Date.now()}`,
          layerA: 'name',
          layerB: 'positioning',
          conflictDescription: `Selected name "${selectedName.name}" contains multiple startup naming clichés (${selectedName.antiGenericFlags.join(', ')}), weakening strategic defensibility.`,
          severity: 'warning',
          suggestedAlignment: 'Select a name from the distinctive semantic territory to avoid commoditization.',
          detectedAt: now,
        });
      }
    }

    // 2. Tagline vs Positioning Sacrifice Conflict
    if (selectedTagline && positioningWorld) {
      const isSpecialist = /purist|specialist|surgical/i.test(positioningWorld.archetype);
      const taglineIsAllInOne = /all-in-one|everything|entire\s+lifecycle|complete\s+suite/i.test(selectedTagline.tagline);

      if (isSpecialist && taglineIsAllInOne) {
        conflicts.push({
          id: `conflict-tagline-sacrifice-${Date.now()}`,
          layerA: 'tagline',
          layerB: 'positioning',
          conflictDescription: `Tagline "${selectedTagline.tagline}" claims all-in-one completeness, directly violating the positioning sacrifice: "${positioningWorld.tradeoffs.whatWeSacrifice}".`,
          severity: 'blocking',
          suggestedAlignment: `Align tagline with the chosen proof mechanism: "${positioningWorld.proofMechanism}".`,
          detectedAt: now,
        });
      }
    }

    // 3. Voice vs Visual Direction Conflict
    if (voiceSystem && visualSystem) {
      const isClinicalVoice = voiceSystem.tonalSliders.precision > 75 && voiceSystem.tonalSliders.warmth < 35;
      const isPlayfulSoftVisual =
        visualSystem.shapes.borderRadius.includes('rounded-2xl') ||
        visualSystem.shapes.borderRadius.includes('rounded-full');

      if (isClinicalVoice && isPlayfulSoftVisual) {
        conflicts.push({
          id: `conflict-voice-visual-${Date.now()}`,
          layerA: 'voice',
          layerB: 'visual',
          conflictDescription: `Brand voice is clinical and precise, but visual shape system uses pill/bubble rounded borders (${visualSystem.shapes.borderRadius}), creating an aesthetic mismatch.`,
          severity: 'warning',
          suggestedAlignment: 'Sharpen corner geometry to sharp or technical chamfered borders (e.g., rounded-md or rounded-none with hairline grids).',
          detectedAt: now,
        });
      }
    }

    return conflicts;
  }
}
