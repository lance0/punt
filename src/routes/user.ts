import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import { auth } from "../lib/auth";
import { validateApiToken, listApiTokens, createApiToken, revokeApiToken } from "../lib/tokens";
import {
  getUserPastes,
  getUserPasteStats,
  deleteUserPaste,
  extendPasteTTL,
} from "../lib/db";
import { MAX_TTL_AUTHENTICATED } from "../lib/time";
import { renderUserDashboard, renderNewTokenPage } from "../templates/user-dashboard";

// Middleware to extract and validate API token
async function getAuthUser(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7);
  return validateApiToken(token);
}

// Get session user from browser cookies
async function getSessionUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user ?? null;
}

export const userRoutes = new Elysia()
  .use(html())

  // Get current user info (for CLI whoami command)
  .get("/api/me", async ({ request, set }) => {
    const user = await getAuthUser(request);
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    };
  })

  // User dashboard page (browser)
  .get("/me", async ({ request, set }) => {
    const user = await getSessionUser(request);
    if (!user) {
      set.redirect = "/login/github?callbackURL=/me";
      return;
    }

    const [stats, pastes, tokens] = await Promise.all([
      getUserPasteStats(user.id),
      getUserPastes(user.id),
      listApiTokens(user.id),
    ]);

    return renderUserDashboard({
      user,
      stats,
      pastes,
      tokens,
    });
  })

  // List user's pastes (API)
  .get("/api/me/pastes", async ({ request, set }) => {
    const user = await getAuthUser(request);
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const pastes = await getUserPastes(user.id);
    return { pastes };
  })

  // Delete user's paste (POST with _method=DELETE for HTML forms)
  .post(
    "/api/me/pastes/:id",
    async ({ request, params, body, set }) => {
      // Support both session and API token auth
      let userId: string | null = null;

      const sessionUser = await getSessionUser(request);
      if (sessionUser) {
        userId = sessionUser.id;
      } else {
        const apiUser = await getAuthUser(request);
        if (apiUser) {
          userId = apiUser.id;
        }
      }

      if (!userId) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const method = (body as { _method?: string })?._method;
      if (method === "DELETE") {
        const deleted = await deleteUserPaste(params.id, userId);
        if (!deleted) {
          set.status = 404;
          return { error: "Paste not found or not yours" };
        }

        // Redirect if from browser
        if (request.headers.get("Accept")?.includes("text/html")) {
          set.redirect = "/me";
          return;
        }

        return { success: true };
      }

      set.status = 400;
      return { error: "Invalid method" };
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  // Delete paste (API DELETE method)
  .delete("/api/me/pastes/:id", async ({ request, params, set }) => {
    const user = await getAuthUser(request);
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const deleted = await deleteUserPaste(params.id, user.id);
    if (!deleted) {
      set.status = 404;
      return { error: "Paste not found or not yours" };
    }

    return { success: true };
  })

  // Extend paste TTL
  .post(
    "/api/me/pastes/:id/extend",
    async ({ request, params, set }) => {
      // Support both session and API token auth
      let userId: string | null = null;

      const sessionUser = await getSessionUser(request);
      if (sessionUser) {
        userId = sessionUser.id;
      } else {
        const apiUser = await getAuthUser(request);
        if (apiUser) {
          userId = apiUser.id;
        }
      }

      if (!userId) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      // Extend by 7 days (max is 30 days total for authenticated)
      const extendBy = 7 * 24 * 60 * 60; // 7 days in seconds
      const extended = await extendPasteTTL(params.id, userId, extendBy);

      if (!extended) {
        set.status = 404;
        return { error: "Paste not found or not yours" };
      }

      // Redirect if from browser
      if (request.headers.get("Accept")?.includes("text/html")) {
        set.redirect = "/me";
        return;
      }

      return { success: true, extended_by_seconds: extendBy };
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  // List API tokens
  .get("/api/tokens", async ({ request, set }) => {
    const user = await getAuthUser(request);
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const tokens = await listApiTokens(user.id);
    return { tokens };
  })

  // Create new API token
  .post(
    "/api/tokens",
    async ({ request, body, set }) => {
      // Support both session and API token auth
      let userId: string | null = null;

      const sessionUser = await getSessionUser(request);
      if (sessionUser) {
        userId = sessionUser.id;
      } else {
        const apiUser = await getAuthUser(request);
        if (apiUser) {
          userId = apiUser.id;
        }
      }

      if (!userId) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const name = (body as { name?: string })?.name?.trim() || "CLI Token";
      const { token } = await createApiToken(userId, name);

      // Return HTML page if from browser
      if (request.headers.get("Accept")?.includes("text/html")) {
        return renderNewTokenPage(token);
      }

      return { token };
    }
  )

  // Revoke API token (POST with _method=DELETE for HTML forms)
  .post(
    "/api/tokens/:id",
    async ({ request, params, body, set }) => {
      // Support both session and API token auth
      let userId: string | null = null;

      const sessionUser = await getSessionUser(request);
      if (sessionUser) {
        userId = sessionUser.id;
      } else {
        const apiUser = await getAuthUser(request);
        if (apiUser) {
          userId = apiUser.id;
        }
      }

      if (!userId) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const method = (body as { _method?: string })?._method;
      if (method === "DELETE") {
        const revoked = await revokeApiToken(params.id, userId);
        if (!revoked) {
          set.status = 404;
          return { error: "Token not found or not yours" };
        }

        // Redirect if from browser
        if (request.headers.get("Accept")?.includes("text/html")) {
          set.redirect = "/me";
          return;
        }

        return { success: true };
      }

      set.status = 400;
      return { error: "Invalid method" };
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  // Revoke API token (API DELETE method)
  .delete("/api/tokens/:id", async ({ request, params, set }) => {
    const user = await getAuthUser(request);
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const revoked = await revokeApiToken(params.id, user.id);
    if (!revoked) {
      set.status = 404;
      return { error: "Token not found or not yours" };
    }

    return { success: true };
  });
