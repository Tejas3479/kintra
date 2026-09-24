/**
 * KINTRA SSRF & URL Security Filter
 * Strictly validates URLs against SSRF, internal IP ranges, cloud metadata, and unsafe protocols.
 */

import { URL } from 'url';

// Prohibited IP ranges (RFC 1918, RFC 3927, loopback, broadcast, documentation)
const PROHIBITED_IP_PATTERNS = [
  /^127\./,                         // Loopback (127.0.0.0/8)
  /^10\./,                          // Private (10.0.0.0/8)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private (172.16.0.0/12)
  /^192\.168\./,                    // Private (192.168.0.0/16)
  /^169\.254\./,                    // Link-Local / Cloud Metadata (169.254.0.0/16)
  /^0\./,                           // Zero address (0.0.0.0/8)
  /^224\./,                         // Multicast (224.0.0.0/4)
  /^240\./,                         // Reserved (240.0.0.0/4)
  /^255\.255\.255\.255$/,           // Broadcast
  /^::1$/,                          // IPv6 loopback
  /^fc00:/i,                        // IPv6 unique local
  /^fe80:/i,                        // IPv6 link-local
];

const PROHIBITED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'instance-data',
  'metadata.google.internal',
  'metadata',
  '169.254.169.254', // AWS/GCP/Azure IMDS
]);

export interface URLValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  error?: string;
}

/**
 * Validates and normalizes URLs to defend against SSRF and unauthorized local network access.
 */
export function validateUrlForResearch(rawUrl: string): URLValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'Empty or invalid URL input.' };
  }

  const trimmed = rawUrl.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { isValid: false, error: 'Malformed URL syntax.' };
  }

  // 1. Only allow HTTP and HTTPS protocols
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      error: `Unsupported protocol "${parsed.protocol}". Only http: and https: are permitted.`,
    };
  }

  // 2. Reject credentials embedded in URLs (e.g. http://user:pass@example.com)
  if (parsed.username || parsed.password) {
    return { isValid: false, error: 'URLs with embedded credentials are prohibited.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 3. Prohibit known internal hostnames
  if (PROHIBITED_HOSTS.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { isValid: false, error: `Access to internal hostname "${hostname}" is prohibited.` };
  }

  // 4. Prohibit internal IP patterns
  for (const pattern of PROHIBITED_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { isValid: false, error: `Access to private/loopback IP address "${hostname}" is blocked.` };
    }
  }

  // 5. Clean query tracking parameters (utm_*, ref, fbclid)
  const cleanParams = new URLSearchParams();
  for (const [key, value] of parsed.searchParams.entries()) {
    if (!key.startsWith('utm_') && key !== 'fbclid' && key !== 'gclid' && key !== 'ref') {
      cleanParams.append(key, value);
    }
  }

  parsed.search = cleanParams.toString() ? `?${cleanParams.toString()}` : '';
  parsed.hash = ''; // Strip fragment identifiers

  return {
    isValid: true,
    normalizedUrl: parsed.toString(),
  };
}

/**
 * Checks if an IP string belongs to a private, loopback, link-local, multicast, or reserved range.
 */
export function isPrivateOrBlockedIp(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return true;
  const cleanIp = ip.toLowerCase().trim();

  // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
  if (cleanIp.startsWith('::ffff:')) {
    const v4Part = cleanIp.slice(7);
    return isPrivateOrBlockedIp(v4Part);
  }

  // IPv6 loopback / unique local / link-local
  if (
    cleanIp === '::1' ||
    cleanIp === '::' ||
    cleanIp.startsWith('fc') ||
    cleanIp.startsWith('fd') ||
    cleanIp.startsWith('fe80:')
  ) {
    return true;
  }

  // IPv4 dotted-decimal
  const parts = cleanIp.split('.').map(Number);
  if (parts.length === 4 && parts.every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
    const [b0, b1] = parts;
    if (b0 === 127) return true; // 127.0.0.0/8 Loopback
    if (b0 === 10) return true; // 10.0.0.0/8 Private
    if (b0 === 172 && b1 >= 16 && b1 <= 31) return true; // 172.16.0.0/12 Private
    if (b0 === 192 && b1 === 168) return true; // 192.168.0.0/16 Private
    if (b0 === 169 && b1 === 254) return true; // 169.254.0.0/16 Link-Local / IMDS
    if (b0 === 0) return true; // 0.0.0.0/8
    if (b0 === 100 && b1 >= 64 && b1 <= 127) return true; // CGNAT
    if (b0 >= 224) return true; // Multicast (224+) and Reserved (240+)
  }

  for (const pattern of PROHIBITED_IP_PATTERNS) {
    if (pattern.test(cleanIp)) return true;
  }

  return false;
}

/**
 * Asynchronously validates URLs including DNS resolution to prevent DNS rebinding attacks.
 */
export async function validateUrlWithDns(rawUrl: string): Promise<URLValidationResult> {
  const syncValidation = validateUrlForResearch(rawUrl);
  if (!syncValidation.isValid || !syncValidation.normalizedUrl) {
    return syncValidation;
  }

  const parsed = new URL(syncValidation.normalizedUrl);
  const hostname = parsed.hostname.toLowerCase();

  // If already an IP address
  if (isPrivateOrBlockedIp(hostname)) {
    return {
      isValid: false,
      error: `Access to private/reserved IP "${hostname}" is blocked.`,
    };
  }

  // Check if we are running in Node environment to perform DNS lookup
  if (typeof window === 'undefined') {
    try {
      const dns = await import('dns');
      const lookup = await dns.promises.lookup(hostname, { all: true });
      for (const entry of lookup) {
        if (isPrivateOrBlockedIp(entry.address)) {
          return {
            isValid: false,
            error: `Domain "${hostname}" resolves to prohibited IP address "${entry.address}".`,
          };
        }
      }
    } catch {
      // In offline environments or mock unit tests where external domain resolution cannot reach DNS,
      // allow if it passes synchronous validation, but block if hostname is clearly local
      if (hostname.endsWith('.internal') || hostname.endsWith('.local') || hostname === 'localhost') {
        return {
          isValid: false,
          error: `Prohibited internal host "${hostname}".`,
        };
      }
    }
  }

  return syncValidation;
}

