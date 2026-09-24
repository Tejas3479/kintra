/**
 * Anti-Generic Naming Scanner
 * Deterministically audits startup names against cliché conventions, overused suffixes,
 * and category metaphors to guarantee distinctive branding.
 */

export interface NamingAuditResult {
  genericnessRisk: 'low' | 'medium' | 'high';
  flags: string[];
  recommendations: string[];
  legalDisclaimer: string;
}

export class AntiGenericNamer {
  // Cliché startup suffixes that signal low-effort naming
  private static readonly CLICHE_SUFFIXES = [
    { pattern: /ly$/i, label: 'Overused "-ly" suffix (e.g., Bitly, Grammarly)' },
    { pattern: /ify$/i, label: 'Overused "-ify" suffix (e.g., Spotify, Shopify)' },
    { pattern: /io$/i, label: 'Generic ".io" / "-io" tech suffix' },
    { pattern: /hub$/i, label: 'Overused "-hub" container suffix' },
    { pattern: /ai$/i, label: 'Commoditized "-ai" suffix (dates the brand rapidly)' },
    { pattern: /flow$/i, label: 'Predictable productivity "-flow" suffix' },
    { pattern: /stack$/i, label: 'Generic developer "-stack" suffix' },
    { pattern: /base$/i, label: 'Generic infrastructure "-base" suffix' },
    { pattern: /sync$/i, label: 'Common utility "-sync" suffix' },
    { pattern: /ops$/i, label: 'Overworked "-ops" engineering suffix' },
  ];

  // Predictable security/dev category metaphors
  private static readonly CATEGORY_CLICHE_METAPHORS = [
    { pattern: /shield/i, label: 'Overused defensive metaphor: "Shield"' },
    { pattern: /guard/i, label: 'Overused defensive metaphor: "Guard"' },
    { pattern: /fortress|castle|wall/i, label: 'Medieval defense cliché metaphor' },
    { pattern: /ninja|wizard|guru/i, label: 'Dated 2010s tech-bro persona metaphor' },
    { pattern: /copilot|pilot/i, label: 'Imitative "Copilot" AI framing' },
    { pattern: /hero/i, label: 'Patronizing "Hero" startup trope' },
  ];

  // Vague abstract names without semantic anchor
  private static readonly VAGUE_ABSTRACT_NAMES = [
    { pattern: /synergy/i, label: 'Empty corporate buzzword: Synergy' },
    { pattern: /nexus/i, label: 'Overused sci-fi abstraction: Nexus' },
    { pattern: /omni/i, label: 'Empty all-encompassing prefix: Omni' },
    { pattern: /nova/i, label: 'Overused space abstraction: Nova' },
    { pattern: /apex/i, label: 'Generic superlative: Apex' },
    { pattern: /catalyst/i, label: 'Generic corporate trope: Catalyst' },
    { pattern: /pulse/i, label: 'Generic telemetry cliché: Pulse' },
  ];

  /**
   * Performs deterministic anti-generic naming audit
   */
  static auditName(name: string, categoryFraming = ''): NamingAuditResult {
    const trimmed = name.trim();
    const flags: string[] = [];
    const recommendations: string[] = [];

    // 1. Check overused suffixes
    for (const item of this.CLICHE_SUFFIXES) {
      if (item.pattern.test(trimmed)) {
        flags.push(item.label);
      }
    }

    // 2. Check category cliché metaphors
    for (const item of this.CATEGORY_CLICHE_METAPHORS) {
      if (item.pattern.test(trimmed)) {
        flags.push(item.label);
      }
    }

    // 3. Check vague abstract names
    for (const item of this.VAGUE_ABSTRACT_NAMES) {
      if (item.pattern.test(trimmed)) {
        flags.push(item.label);
      }
    }

    // 4. Check for arbitrary dropped vowels gimmick (e.g. "Flickr", "Tumblr", "Grindr")
    if (/[bcdfghjklmnpqrstvwxyz]{4,}$/i.test(trimmed)) {
      flags.push('Gimmick vowel-stripping consonant cluster (e.g., Flickr, Grindr)');
    }

    // Determine risk level based on flags
    let genericnessRisk: 'low' | 'medium' | 'high' = 'low';
    if (flags.length >= 2) {
      genericnessRisk = 'high';
      recommendations.push(
        'Name combines multiple startup clichés. Pivot toward an invented root, crisp phonetics, or a compound evocative noun.'
      );
    } else if (flags.length === 1) {
      genericnessRisk = 'medium';
      recommendations.push(
        'Name uses a familiar convention. Consider sharpening the distinctive semantic anchor.'
      );
    } else {
      recommendations.push(
        'Name exhibits distinctive phonetic architecture with zero flagged startup clichés.'
      );
    }

    return {
      genericnessRisk,
      flags,
      recommendations,
      legalDisclaimer:
        'Preliminary linguistic and phonetic analysis only. Not legal clearance or registered trademark clearance.',
    };
  }
}
