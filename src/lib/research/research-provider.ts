import { validateUrlForResearch, validateUrlWithDns } from '../security/ssrf-filter';
import { sanitizeUntrustedContent } from '../security/content-sanitizer';
import { logger } from '../logger';

export interface RawSearchResult {
  title: string;
  url: string;
  snippet: string;
  sourceDomain: string;
  publishedDate?: string;
}

export interface ResearchProvider {
  search(query: string, maxResults?: number): Promise<RawSearchResult[]>;
  fetchContent(url: string): Promise<{ content: string; url: string; success: boolean; error?: string }>;
}

/**
 * Deterministic Mock Research Provider
 * Provides grounded, realistic competitive signals without external network fragility
 */
export class MockResearchProvider implements ResearchProvider {
  async search(query: string, maxResults = 4): Promise<RawSearchResult[]> {
    logger.info('MockResearchProvider searching:', { query });
    const lower = query.toLowerCase();

    // DevSecOps / Code Review Competitors
    if (lower.includes('security') || lower.includes('pull request') || lower.includes('code') || lower.includes('pr')) {
      const results: RawSearchResult[] = [
        {
          title: 'Snyk Code: Fast, developer-first SAST security review',
          url: 'https://snyk.io/product/snyk-code/',
          snippet:
            'Snyk Code scans source code in real time during git commits and pull requests. Provides actionable fix recommendations directly in developer IDEs and GitHub pull requests.',
          sourceDomain: 'snyk.io',
          publishedDate: '2026-01-15',
        },
        {
          title: 'SonarQube Pull Request Analysis and Quality Gates',
          url: 'https://www.sonarsource.com/products/sonarqube/',
          snippet:
            'SonarQube delivers clean code metrics, blocking merges when quality gates fail. Emphasizes enterprise compliance and coverage, though developers frequently report noisy lint alerts.',
          sourceDomain: 'sonarsource.com',
          publishedDate: '2025-11-20',
        },
        {
          title: 'GitHub Advanced Security & CodeQL Semantic Engine',
          url: 'https://github.com/features/security',
          snippet:
            'Native GitHub security scanning using CodeQL queries. Deep integration into repository settings, but requires custom query tuning to detect bespoke business logic flaws.',
          sourceDomain: 'github.com',
          publishedDate: '2026-02-10',
        },
        {
          title: 'Hacker News Developer Discussion: Why we muted our PR security bot',
          url: 'https://news.ycombinator.com/item?id=39128472',
          snippet:
            'Engineers share that automated bots posting 15+ automated comments per PR cause developer alert fatigue, resulting in teams disabling automated review comments entirely.',
          sourceDomain: 'news.ycombinator.com',
          publishedDate: '2026-03-01',
        },
      ];
      return results.slice(0, maxResults);
    }

    // Default Fallback Competitors
    return [
      {
        title: `Market Landscape for ${query.slice(0, 30)}`,
        url: 'https://techcrunch.com/category/startups/',
        snippet: `Recent industry analysis highlights rapid consolidation among AI workflow tools, with buyers demanding deep vertical specialization rather than broad horizontal chatbots.`,
        sourceDomain: 'techcrunch.com',
        publishedDate: '2026-02-01',
      },
      {
        title: `User Review Synthesis: Current Alternatives & Gaps`,
        url: 'https://g2.com/categories/productivity',
        snippet: `Users report high dissatisfaction with tools that generate ungrounded copy, seeking solutions that show explicit reasoning and verify factual constraints.`,
        sourceDomain: 'g2.com',
        publishedDate: '2026-01-10',
      },
    ].slice(0, maxResults);
  }

  async fetchContent(url: string): Promise<{ content: string; url: string; success: boolean; error?: string }> {
    const validation = validateUrlForResearch(url);
    if (!validation.isValid) {
      return { content: '', url, success: false, error: validation.error };
    }

    // Return sanitized mock content
    const mockContent = `Mock page content retrieved from ${validation.normalizedUrl}. High developer interest in automated tools that reduce review turnaround without noisy false alarms.`;
    return {
      content: mockContent,
      url: validation.normalizedUrl!,
      success: true,
    };
  }
}

/**
 * Live Web Research Provider with SSRF Shielding and Sanitization
 */
export class WebResearchProvider implements ResearchProvider {
  private timeoutMs: number;

  constructor(timeoutMs = 5000) {
    this.timeoutMs = timeoutMs;
  }

  async search(query: string, maxResults = 4): Promise<RawSearchResult[]> {
    // If Tavily/Serp API key is present, use it; otherwise fallback to Mock
    const searchKey = process.env.TAVILY_API_KEY || process.env.SERP_API_KEY;
    if (!searchKey) {
      logger.info('No external search API key found; using MockResearchProvider');
      const mock = new MockResearchProvider();
      return mock.search(query, maxResults);
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: searchKey,
          query,
          search_depth: 'basic',
          max_results: maxResults,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      if (!res.ok) {
        throw new Error(`Search API returned status ${res.status}`);
      }

      const json = await res.json();
      const results: RawSearchResult[] = (json.results || []).map((r: { title: string; url: string; content: string }) => {
        const domain = new URL(r.url).hostname.replace(/^www\./, '');
        return {
          title: r.title,
          url: r.url,
          snippet: r.content,
          sourceDomain: domain,
        };
      });

      return results;
    } catch (err: unknown) {
      logger.warn('Live search failed or timed out, falling back to mock provider:', {
        error: err instanceof Error ? err.message : String(err),
      });
      const mock = new MockResearchProvider();
      return mock.search(query, maxResults);
    }
  }

  async fetchContent(url: string): Promise<{ content: string; url: string; success: boolean; error?: string }> {
    // 1. SSRF & Protocol Validation with DNS check
    const validation = await validateUrlWithDns(url);
    if (!validation.isValid) {
      logger.warn('SSRF Blocked URL:', { url, reason: validation.error });
      return { content: '', url, success: false, error: validation.error };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      let currentUrl = validation.normalizedUrl!;
      let redirectCount = 0;
      const maxRedirects = 2;
      let finalResponse: Response | null = null;

      while (redirectCount <= maxRedirects) {
        const res = await fetch(currentUrl, {
          headers: {
            'User-Agent': 'KintraResearchBot/1.0 (+https://kintra.ai)',
            Accept: 'text/html,text/plain',
          },
          signal: controller.signal,
          redirect: 'manual',
        });

        if (res.status >= 300 && res.status < 400) {
          redirectCount++;
          const location = res.headers.get('location');
          if (!location) {
            clearTimeout(timeout);
            return { content: '', url: currentUrl, success: false, error: 'Redirect location header missing' };
          }
          const nextUrl = new URL(location, currentUrl).toString();
          const nextValidation = await validateUrlWithDns(nextUrl);
          if (!nextValidation.isValid) {
            clearTimeout(timeout);
            logger.warn('SSRF Blocked redirect target:', { target: nextUrl, reason: nextValidation.error });
            return { content: '', url: nextUrl, success: false, error: `Redirect blocked: ${nextValidation.error}` };
          }
          currentUrl = nextValidation.normalizedUrl!;
          continue;
        }

        finalResponse = res;
        break;
      }

      clearTimeout(timeout);

      if (!finalResponse || !finalResponse.ok) {
        return {
          content: '',
          url: currentUrl,
          success: false,
          error: finalResponse ? `HTTP Error ${finalResponse.status}` : 'Too many redirects',
        };
      }

      const rawText = await finalResponse.text();

      // 2. Untrusted Content Sanitization & Truncation
      const sanitized = sanitizeUntrustedContent(rawText, 12000);

      return {
        content: sanitized.sanitizedText,
        url: currentUrl,
        success: true,
      };
    } catch (err: unknown) {
      return {
        content: '',
        url: validation.normalizedUrl!,
        success: false,
        error: err instanceof Error ? err.message : 'Network fetch failed',
      };
    }
  }
}

export function getResearchProvider(): ResearchProvider {
  if (process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return new MockResearchProvider();
  }
  return new WebResearchProvider();
}
