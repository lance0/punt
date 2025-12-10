/**
 * Request utilities for secure header handling.
 *
 * SECURITY NOTE: IP extraction from headers is only safe behind a trusted
 * reverse proxy (e.g., Vercel, Cloudflare) that strips client-supplied headers.
 * Set TRUSTED_PROXY=true in your environment when running behind such a proxy.
 * When TRUSTED_PROXY is not set, all requests use a placeholder IP for rate
 * limiting, which provides basic protection but not per-client tracking.
 */

/**
 * Check if we're running behind a trusted proxy.
 * Set TRUSTED_PROXY=true when deployed behind Vercel, Cloudflare, nginx, etc.
 */
const TRUSTED_PROXY = process.env.TRUSTED_PROXY === "true";

/**
 * Extract client IP from request headers.
 *
 * When TRUSTED_PROXY=true:
 * - Trust x-real-ip (single IP set by proxy)
 * - Trust x-forwarded-for (first IP in chain)
 *
 * When TRUSTED_PROXY is not set:
 * - Return "untrusted" as a safe fallback
 * - Rate limiting still works (shared bucket) but can't track individual IPs
 *
 * On Vercel: x-forwarded-for contains the real client IP as the first entry.
 * The proxy appends its own IP, so we always take the first (leftmost) IP.
 */
export function getClientIp(request: Request): string {
  if (!TRUSTED_PROXY) {
    // Not behind a trusted proxy - use placeholder to avoid spoofing
    // Rate limiting will use a shared bucket for all "untrusted" requests
    return "untrusted";
  }

  // Prefer x-real-ip if set (single authoritative value from proxy)
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fall back to x-forwarded-for (take first IP in chain)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0];
    if (firstIp) {
      return firstIp.trim();
    }
  }

  // Local development fallback
  return "127.0.0.1";
}

/**
 * Validate Origin header for CSRF protection.
 *
 * For state-changing requests with cookie auth, verify the Origin (or Referer)
 * header matches our expected domain to prevent cross-site request forgery.
 *
 * @returns true if request origin is valid, false if potential CSRF attack
 */
export function validateOrigin(request: Request): boolean {
  const baseUrl = process.env.BASE_URL ?? "https://punt.sh";
  const expectedHost = new URL(baseUrl).host;

  // Check Origin header first (preferred)
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      return originHost === expectedHost;
    } catch {
      return false;
    }
  }

  // Fall back to Referer header
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      return refererHost === expectedHost;
    } catch {
      return false;
    }
  }

  // No Origin or Referer - could be same-origin or CSRF
  // Be strict: require Origin/Referer for cookie-based state changes
  return false;
}

/**
 * Validate a callback URL to prevent open redirects.
 *
 * Only allows:
 * - Relative paths starting with /
 * - No protocol-relative URLs (//example.com)
 * - No external URLs
 *
 * @returns The safe URL or a default fallback
 */
export function validateCallbackUrl(url: string | undefined, defaultUrl: string): string {
  if (!url) {
    return defaultUrl;
  }

  // Must start with exactly one forward slash
  if (!url.startsWith("/") || url.startsWith("//")) {
    return defaultUrl;
  }

  // Block any URL-encoded characters that could bypass validation
  if (url.includes("%")) {
    try {
      const decoded = decodeURIComponent(url);
      // After decoding, still must be a safe relative path
      if (!decoded.startsWith("/") || decoded.startsWith("//")) {
        return defaultUrl;
      }
    } catch {
      return defaultUrl;
    }
  }

  // Block javascript: and data: schemes (shouldn't pass the / check, but be safe)
  const lower = url.toLowerCase();
  if (lower.includes("javascript:") || lower.includes("data:")) {
    return defaultUrl;
  }

  return url;
}
