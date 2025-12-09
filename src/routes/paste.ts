import { Elysia, t } from "elysia";
import { createPaste, deletePaste, getPaste, createReport } from "../lib/db";
import { checkRateLimit, incrementRateLimit, checkUserRateLimit, incrementUserRateLimit } from "../lib/rate-limit";
import { parseTTL, MAX_TTL, MAX_TTL_AUTHENTICATED } from "../lib/time";
import { generatePasteId, generateDeleteKey, generateViewKey } from "../lib/id";
import { logger } from "../lib/logger";
import { validateApiToken, type User } from "../lib/tokens";
import { normalizeLanguage, getSupportedLanguagesList } from "../lib/languages";

// 4 MB size limit
const MAX_BODY_SIZE = 4 * 1024 * 1024;

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "127.0.0.1";
}

// Get authenticated user from Authorization header
async function getAuthUser(request: Request): Promise<User | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7);
  return validateApiToken(token);
}

export const pasteRoutes = new Elysia({ prefix: "/api" })
  // Create paste
  .post(
    "/paste",
    async ({ request, set }) => {
      const ip = getClientIp(request);

      // Check for authenticated user
      const user = await getAuthUser(request);
      const isAuthenticated = !!user;

      // Check rate limit (user-based for authenticated, IP-based for anonymous)
      const rateLimit = isAuthenticated
        ? await checkUserRateLimit(user.id)
        : await checkRateLimit(ip);

      if (!rateLimit.allowed) {
        set.status = 429;
        set.headers["X-RateLimit-Remaining"] = "0";
        set.headers["X-RateLimit-Reset"] = rateLimit.resetAt.toISOString();
        return "Rate limit exceeded. Try again tomorrow.";
      }

      // Read body as text
      const body = await request.text();

      // Validate body
      if (!body) {
        set.status = 400;
        return "Request body is required";
      }

      // Check size limit
      const bodySize = new TextEncoder().encode(body).length;
      if (bodySize > MAX_BODY_SIZE) {
        set.status = 413;
        return `Content too large. Maximum size is ${MAX_BODY_SIZE / 1024 / 1024} MB`;
      }

      // Check for empty content
      if (body.trim().length === 0) {
        set.status = 400;
        return "Content cannot be empty";
      }

      // Parse TTL from header (30 days max for authenticated, 7 days for anonymous)
      const ttlHeader = request.headers.get("x-ttl") ?? request.headers.get("x-expires");
      const maxTTL = isAuthenticated ? MAX_TTL_AUTHENTICATED : MAX_TTL;
      const { seconds: ttlSeconds, warning: ttlWarning } = parseTTL(ttlHeader, maxTTL);

      // Parse optional flags
      const burnAfterRead =
        request.headers.get("x-burn-after-read") === "1" ||
        request.headers.get("x-burn-after-read") === "true";
      const isPrivate =
        request.headers.get("x-private") === "1" || request.headers.get("x-private") === "true";

      // Parse language for syntax highlighting
      const langHeader = request.headers.get("x-language");
      let language: string | undefined;
      if (langHeader) {
        // "ansi" means explicitly use ANSI rendering (same as no language)
        if (langHeader.toLowerCase() === "ansi") {
          language = undefined;
        } else {
          const normalized = normalizeLanguage(langHeader);
          if (!normalized) {
            set.status = 400;
            const supported = getSupportedLanguagesList().slice(0, 20).join(", ");
            return `Unknown language: "${langHeader}". Supported languages include: ${supported}... Use "ansi" for terminal output.`;
          }
          language = normalized;
        }
      }

      // Generate IDs
      const id = generatePasteId();
      const deleteKey = generateDeleteKey();
      const viewKey = isPrivate ? generateViewKey() : undefined;

      // Create paste (with user_id if authenticated)
      await createPaste({
        id,
        content: body,
        ttlSeconds,
        deleteKey,
        burnAfterRead,
        isPrivate,
        viewKey,
        userId: user?.id,
        language,
      });

      // Increment rate limit counter
      if (isAuthenticated) {
        await incrementUserRateLimit(user.id);
      } else {
        await incrementRateLimit(ip);
      }

      // Build response
      const baseUrl = process.env.BASE_URL ?? "https://punt.sh";
      const pasteUrl = isPrivate && viewKey ? `${baseUrl}/${id}?key=${viewKey}` : `${baseUrl}/${id}`;
      const rawUrl = isPrivate && viewKey ? `${baseUrl}/${id}/raw?key=${viewKey}` : `${baseUrl}/${id}/raw`;

      set.status = 201;
      set.headers["X-RateLimit-Remaining"] = String(rateLimit.remaining - 1);
      set.headers["X-Delete-Key"] = deleteKey;
      set.headers["X-Paste-Id"] = id;
      if (ttlWarning) {
        set.headers["X-TTL-Warning"] = ttlWarning;
      }
      if (language) {
        set.headers["X-Language"] = language;
      }

      // Format expiry time for display
      const ttlDisplay = ttlSeconds >= 86400
        ? `${Math.floor(ttlSeconds / 86400)}d`
        : ttlSeconds >= 3600
          ? `${Math.floor(ttlSeconds / 3600)}h`
          : `${Math.floor(ttlSeconds / 60)}m`;

      // Build status flags
      const flags = [];
      if (burnAfterRead) flags.push("🔥 burns after read");
      if (isPrivate) flags.push("🔒 private");
      if (isAuthenticated) flags.push("👤 authenticated");
      if (language) flags.push(`📝 ${language}`);

      return `
🏈 Punted!

   URL  ${pasteUrl}
   Raw  ${rawUrl}
   Expires in ${ttlDisplay}${flags.length ? ` | ${flags.join(" | ")}` : ""}
   Delete key: ${deleteKey}

`;
    }
  )

  // Delete paste
  .delete(
    "/paste/:id/:deleteKey",
    async ({ params, set }) => {
      const { id, deleteKey } = params;

      const deleted = await deletePaste(id, deleteKey);

      if (!deleted) {
        set.status = 404;
        return "Paste not found or invalid delete key";
      }

      set.status = 200;
      return "Paste deleted successfully";
    },
    {
      params: t.Object({
        id: t.String({ minLength: 1 }),
        deleteKey: t.String({ minLength: 1 }),
      }),
    }
  )

  // Report abuse
  .post(
    "/report/:id",
    async ({ params, body, request, set }) => {
      const { id } = params;
      const ip = getClientIp(request);

      // Check if paste exists
      const paste = await getPaste(id);
      if (!paste) {
        set.status = 404;
        return { error: "Paste not found" };
      }

      // Validate reason
      const reason = (body as { reason?: string })?.reason?.trim();
      if (!reason || reason.length < 5 || reason.length > 500) {
        set.status = 400;
        return { error: "Reason must be between 5 and 500 characters" };
      }

      // Create report
      await createReport(id, reason, ip);

      logger.info("abuse_report", {
        paste_id: id,
        reporter_ip: ip,
        reason_length: reason.length,
      });

      return { success: true, message: "Report submitted. Thank you." };
    },
    {
      params: t.Object({
        id: t.String({ minLength: 1 }),
      }),
    }
  );
