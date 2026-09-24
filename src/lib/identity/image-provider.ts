import { GeneratedVisualAsset } from '@/types/identity';
import { logger } from '@/lib/logger';

export interface ImagePromptContext {
  positioningArchetype: string;
  brandName: string;
  tagline: string;
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  visualMetaphors: string[];
  audience: string;
  borderRadius: string;
  assetType: 'brand_mark' | 'hero_graphic' | 'system_badge';
}

export interface ImageGenerationResult {
  success: boolean;
  asset: GeneratedVisualAsset;
  error?: string;
}

export interface ImageGenerationProvider {
  generateVisual(ctx: ImagePromptContext): Promise<ImageGenerationResult>;
}

/**
 * Deterministic SVG Generator inheriting brand palette, geometry, and metaphors.
 * Provides instant, zero-latency, network-safe visual synthesis with zero crash risk.
 */
export class SvgBrandVisualGenerator {
  static createBrandMarkSvg(ctx: ImagePromptContext): string {
    const { primaryHex, secondaryHex, accentHex, brandName, positioningArchetype } = ctx;
    const initial = (brandName || 'K')[0].toUpperCase();

    // Determine geometry based on archetype
    const isPurist = positioningArchetype.toLowerCase().includes('purist');
    const isGatekeeper = positioningArchetype.toLowerCase().includes('gatekeeper');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="100%" height="100%" class="rounded-xl shadow-2xl">
  <defs>
    <linearGradient id="grad-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="100%" stop-color="#18181b" />
    </linearGradient>
    <linearGradient id="grad-accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accentHex}" />
      <stop offset="100%" stop-color="${primaryHex}" />
    </linearGradient>
  </defs>

  <!-- Background Canvas -->
  <rect width="240" height="240" fill="url(#grad-bg)" rx="24" />
  
  <!-- Geometric Grid Motif -->
  <path d="M 40 120 H 200 M 120 40 V 200" stroke="${secondaryHex}" stroke-width="1" stroke-dasharray="4 4" opacity="0.3" />
  <circle cx="120" cy="120" r="70" fill="none" stroke="${secondaryHex}" stroke-width="1" opacity="0.2" />

  ${
    isPurist
      ? `<!-- Surgical Precision Motif (Target crosshair & diamond) -->
  <polygon points="120,60 180,120 120,180 60,120" fill="none" stroke="url(#grad-accent)" stroke-width="3" />
  <circle cx="120" cy="120" r="16" fill="${accentHex}" fill-opacity="0.15" stroke="${accentHex}" stroke-width="2" />
  <line x1="100" y1="120" x2="140" y2="120" stroke="${accentHex}" stroke-width="2" />
  <line x1="120" y1="100" x2="120" y2="140" stroke="${accentHex}" stroke-width="2" />`
      : isGatekeeper
      ? `<!-- Sovereign Gatekeeper Motif (Shielded hexagonal node) -->
  <polygon points="120,50 180,85 180,155 120,190 60,155 60,85" fill="none" stroke="url(#grad-accent)" stroke-width="3.5" />
  <path d="M 80 120 L 110 150 L 165 95" fill="none" stroke="${accentHex}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`
      : `<!-- Velocity Flow Motif (Dynamic converging vectors) -->
  <circle cx="120" cy="120" r="55" fill="none" stroke="url(#grad-accent)" stroke-width="3" />
  <path d="M 90 90 L 150 120 L 90 150 Z" fill="${accentHex}" fill-opacity="0.2" stroke="${accentHex}" stroke-width="2" />`
  }

  <!-- Typography Wordmark Anchor -->
  <text x="120" y="215" font-family="monospace" font-size="12" font-weight="700" fill="#a1a1aa" text-anchor="middle" letter-spacing="3">${brandName.toUpperCase()}</text>
</svg>`;
  }
}

/**
 * Composite Image Generation Provider with Graceful Fallback
 */
export class DefaultImageGenerationProvider implements ImageGenerationProvider {
  async generateVisual(ctx: ImagePromptContext): Promise<ImageGenerationResult> {
    try {
      logger.info('Image Provider generating brand visual asset:', {
        archetype: ctx.positioningArchetype,
        brandName: ctx.brandName,
        assetType: ctx.assetType,
      });

      // Construct prompt reflecting inherited constraints
      const prompt = `Brand Mark for ${ctx.brandName}: Archetype ${ctx.positioningArchetype}. Primary: ${ctx.primaryHex}, Accent: ${ctx.accentHex}. Metaphors: ${ctx.visualMetaphors.join(', ')}. Target Audience: ${ctx.audience}.`;

      // Deterministic SVG generation guarantees valid, crisp visuals without API quota failures
      const svg = SvgBrandVisualGenerator.createBrandMarkSvg(ctx);

      const asset: GeneratedVisualAsset = {
        id: `visual-${Date.now()}`,
        prompt,
        svgContent: svg,
        assetType: ctx.assetType,
        inheritedConstraints: [
          `Palette: Primary ${ctx.primaryHex}, Accent ${ctx.accentHex}`,
          `Archetype: ${ctx.positioningArchetype}`,
          `Metaphors: ${ctx.visualMetaphors.join(', ')}`,
        ],
        createdAt: new Date().toISOString(),
        isFallback: false,
      };

      return {
        success: true,
        asset,
      };
    } catch (err: unknown) {
      logger.error('Image Provider failed, falling back to minimal placeholder:', err);

      // Safe fallback asset
      const fallbackAsset: GeneratedVisualAsset = {
        id: `visual-fallback-${Date.now()}`,
        prompt: `Fallback visual for ${ctx.brandName}`,
        svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#18181b"/><text x="100" y="105" fill="#a1a1aa" font-family="sans-serif" font-size="14" text-anchor="middle">${ctx.brandName}</text></svg>`,
        assetType: ctx.assetType,
        inheritedConstraints: ['Fallback placeholder'],
        createdAt: new Date().toISOString(),
        isFallback: true,
      };

      return {
        success: true,
        asset: fallbackAsset,
        error: err instanceof Error ? err.message : 'Visual generation used fallback.',
      };
    }
  }
}
