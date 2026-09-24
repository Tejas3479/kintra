/**
 * Content Sanitizer & Prompt Injection Defense
 * Treats all retrieved external web and search data as untrusted.
 */

const DANGEROUS_HTML_TAGS = /<(script|style|iframe|embed|object|applet|svg|meta|link)[^>]*>[\s\S]*?<\/\1>|<(script|style|iframe|embed|object|applet|svg|meta|link)[^>]*\/?>(?![\s\S]*?<\/\1>)/gi;
const INLINE_EVENT_HANDLERS = /\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi;

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions|directives|prompts)/i,
  /system\s+override/i,
  /you\s+are\s+now\s+(in\s+)?developer\s+mode/i,
  /do\s+not\s+follow\s+any\s+(rules|guidelines)/i,
  /reveal\s+(your\s+)?(system\s+prompt|hidden\s+instructions)/i,
  /forget\s+(your\s+)?instructions/i,
];

export interface SanitizedContentResult {
  sanitizedText: string;
  isTruncated: boolean;
  injectionDetected: boolean;
  detectedPattern?: string;
  originalLength: number;
}

/**
 * Strips HTML, scripts, dangerous markup, checks for prompt injection, and truncates to safe length.
 */
export function sanitizeUntrustedContent(
  rawContent: string,
  maxLength = 15000
): SanitizedContentResult {
  if (!rawContent || typeof rawContent !== 'string') {
    return {
      sanitizedText: '',
      isTruncated: false,
      injectionDetected: false,
      originalLength: 0,
    };
  }

  const originalLength = rawContent.length;

  // 1. Strip dangerous tags and handlers
  let cleaned = rawContent
    .replace(DANGEROUS_HTML_TAGS, ' ')
    .replace(INLINE_EVENT_HANDLERS, ' ')
    // Strip remaining HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Normalize excessive whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Scan for prompt injection attempts
  let injectionDetected = false;
  let detectedPattern: string | undefined;

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      injectionDetected = true;
      detectedPattern = pattern.source;
      // Neutralize the injection payload by replacing with safe placeholder
      cleaned = cleaned.replace(pattern, '[SUSPICIOUS_PROMPT_INJECTION_STRING_REDACTED]');
      break;
    }
  }

  // 3. Enforce maximum payload length
  const isTruncated = cleaned.length > maxLength;
  if (isTruncated) {
    cleaned = cleaned.slice(0, maxLength);
  }

  return {
    sanitizedText: cleaned,
    isTruncated,
    injectionDetected,
    detectedPattern,
    originalLength,
  };
}

/**
 * Formats untrusted content in defensive XML boundary delimiters with instruction immunity tags.
 */
export function wrapInUntrustedBoundary(content: string, sourceId: string): string {
  return `<untrusted_external_content source_id="${sourceId}">
${content}
</untrusted_external_content>`;
}
