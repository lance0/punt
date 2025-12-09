import { Elysia, t } from "elysia";
import { createPaste, deletePaste } from "../lib/db";
import { checkRateLimit, incrementRateLimit } from "../lib/rate-limit";
import { parseTTL } from "../lib/time";
import { generatePasteId, generateDeleteKey, generateViewKey } from "../lib/id";

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

export const pasteRoutes = new Elysia({ prefix: "/api" })
  // Create paste
  .post(
    "/paste",
    async ({ request, set }) => {
      const ip = getClientIp(request);

      // Check rate limit
      const rateLimit = await checkRateLimit(ip);
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

      // Parse TTL from header
      const ttlHeader = request.headers.get("x-ttl") ?? request.headers.get("x-expires");
      const { seconds: ttlSeconds, warning: ttlWarning } = parseTTL(ttlHeader);

      // Parse optional flags
      const burnAfterRead =
        request.headers.get("x-burn-after-read") === "1" ||
        request.headers.get("x-burn-after-read") === "true";
      const isPrivate =
        request.headers.get("x-private") === "1" || request.headers.get("x-private") === "true";

      // Generate IDs
      const id = generatePasteId();
      const deleteKey = generateDeleteKey();
      const viewKey = isPrivate ? generateViewKey() : undefined;

      // Create paste
      await createPaste({
        id,
        content: body,
        ttlSeconds,
        deleteKey,
        burnAfterRead,
        isPrivate,
        viewKey,
      });

      // Increment rate limit counter
      await incrementRateLimit(ip);

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
  );
