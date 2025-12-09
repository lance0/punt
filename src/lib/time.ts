// TTL limits in seconds
export const MIN_TTL = 60; // 1 minute
export const DEFAULT_TTL = 24 * 60 * 60; // 24 hours
export const MAX_TTL = 7 * 24 * 60 * 60; // 7 days (anonymous)
export const MAX_TTL_AUTHENTICATED = 30 * 24 * 60 * 60; // 30 days (authenticated)

export interface ParsedTTL {
  seconds: number;
  warning?: string;
}

/**
 * Parse TTL string into seconds
 * Supports formats: "1h", "30m", "1d", "2d12h", or raw seconds
 * @param ttlStr - TTL string to parse
 * @param maxTTL - Maximum allowed TTL (default: 7 days for anonymous, 30 days for authenticated)
 */
export function parseTTL(ttlStr: string | undefined | null, maxTTL: number = MAX_TTL): ParsedTTL {
  if (!ttlStr) {
    return { seconds: DEFAULT_TTL };
  }

  const trimmed = ttlStr.trim().toLowerCase();

  // Try parsing as raw seconds first
  const rawSeconds = parseInt(trimmed, 10);
  if (!isNaN(rawSeconds) && trimmed === String(rawSeconds)) {
    return validateTTL(rawSeconds, maxTTL);
  }

  // Parse duration format (e.g., "1d12h30m")
  let totalSeconds = 0;
  const regex = /(\d+)([dhms])/g;
  let match;
  let hasMatch = false;

  while ((match = regex.exec(trimmed)) !== null) {
    hasMatch = true;
    const value = parseInt(match[1]!, 10);
    const unit = match[2];

    switch (unit) {
      case "d":
        totalSeconds += value * 24 * 60 * 60;
        break;
      case "h":
        totalSeconds += value * 60 * 60;
        break;
      case "m":
        totalSeconds += value * 60;
        break;
      case "s":
        totalSeconds += value;
        break;
    }
  }

  if (!hasMatch) {
    return { seconds: DEFAULT_TTL, warning: `Invalid TTL format: ${ttlStr}` };
  }

  return validateTTL(totalSeconds, maxTTL);
}

function validateTTL(seconds: number, maxTTL: number = MAX_TTL): ParsedTTL {
  if (seconds < MIN_TTL) {
    return { seconds: MIN_TTL, warning: `TTL too short, minimum is ${MIN_TTL}s` };
  }
  if (seconds > maxTTL) {
    const maxDays = Math.floor(maxTTL / (24 * 60 * 60));
    return { seconds: maxTTL, warning: `TTL too long, maximum is ${maxDays} days` };
  }
  return { seconds };
}

/**
 * Format remaining time for display
 */
export function formatTimeRemaining(expiresAt: number): string {
  const now = Math.floor(Date.now() / 1000);
  const remaining = expiresAt - now;

  if (remaining <= 0) return "expired";

  const days = Math.floor(remaining / (24 * 60 * 60));
  const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((remaining % (60 * 60)) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(" ") : "less than a minute";
}

/**
 * Get current unix timestamp in seconds
 */
export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
