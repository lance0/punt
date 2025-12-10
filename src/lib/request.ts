/**
 * Request utilities for secure header handling.
 *
 * SECURITY NOTE: These utilities assume the application runs behind a trusted
 * reverse proxy (e.g., Vercel, Cloudflare). The x-forwarded-for and x-real-ip
 * headers are only trustworthy when set by a trusted proxy. For self-hosted
 * deployments, ensure your proxy is configured correctly and strips any
 * client-provided forwarding headers.
 */

/**
 * Extract client IP from request headers.
 *
 * Trust order:
 * 1. x-real-ip (single IP set by proxy)
 * 2. x-forwarded-for (first IP in chain, set by proxy)
 * 3. Fallback to 127.0.0.1 for local development
 *
 * On Vercel: x-forwarded-for contains the real client IP as the first entry.
 * The proxy appends its own IP, so we always take the first (leftmost) IP.
 */
export function getClientIp(request: Request): string {
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
