import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import { auth } from "../lib/auth";
import {
  createDeviceCode,
  getDeviceCode,
  approveDeviceCode,
  pollDeviceCode,
} from "../lib/tokens";
import {
  renderCliAuthPage,
  renderCliAuthorizePage,
  renderCliSuccessPage,
  renderCliErrorPage,
} from "../templates/cli-auth";
import { checkCliInitRateLimit, incrementCliInitRateLimit } from "../lib/rate-limit";

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

export const cliAuthRoutes = new Elysia()
  .use(html())

  // CLI calls this to initiate device auth flow
  .post("/api/cli/init", async ({ request, set }) => {
    const ip = getClientIp(request);

    // Rate limit: 10 device code requests per minute
    const rateLimit = await checkCliInitRateLimit(ip);
    if (!rateLimit.allowed) {
      set.status = 429;
      return { error: "Too many requests. Try again in a minute." };
    }

    const code = await createDeviceCode();
    await incrementCliInitRateLimit(ip);
    return { code };
  })

  // CLI polls this to check if device code has been approved
  .get(
    "/api/cli/poll",
    async ({ query }) => {
      const code = query.code;
      if (!code) {
        return { status: "error", message: "Missing code" };
      }
      const result = await pollDeviceCode(code);
      return result;
    },
    {
      query: t.Object({
        code: t.String(),
      }),
    }
  )

  // Browser page: user sees this when clicking the CLI login link
  .get("/cli/auth", async ({ query, request }) => {
    const code = query.code;
    if (!code) {
      return renderCliErrorPage("Missing device code");
    }

    // Check if code exists and is valid
    const deviceCode = await getDeviceCode(code);
    if (!deviceCode) {
      return renderCliErrorPage("Invalid or expired device code");
    }

    // Check if user is already logged in
    const session = await auth.api.getSession({ headers: request.headers });

    if (session) {
      // User is logged in, show authorize page
      return renderCliAuthorizePage({
        code,
        user: session.user,
      });
    }

    // Not logged in, show login page
    return renderCliAuthPage(code);
  })

  // GitHub OAuth redirect for CLI auth (preserves device code)
  .get("/cli/auth/github", async ({ query }) => {
    const code = query.code;
    if (!code) {
      return renderCliErrorPage("Missing device code");
    }

    // Redirect to GitHub OAuth with callback back to CLI auth
    const result = (await auth.api.signInSocial({
      body: {
        provider: "github",
        callbackURL: `/cli/auth?code=${encodeURIComponent(code)}`,
      },
      returnHeaders: true,
    })) as unknown as { headers: Headers; response: { url?: string } };

    if (result.response?.url) {
      const redirectHeaders = new Headers();
      redirectHeaders.set("Location", result.response.url);
      const cookie = result.headers?.get("set-cookie");
      if (cookie) {
        redirectHeaders.set("Set-Cookie", cookie);
      }
      return new Response(null, { status: 302, headers: redirectHeaders });
    }

    return renderCliErrorPage("Failed to initiate GitHub login");
  })

  // Browser POST: approve the device code
  .post(
    "/api/cli/approve",
    async ({ body, request, set }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) {
        set.status = 401;
        return renderCliErrorPage("Not logged in");
      }

      const code = body.code;
      if (!code) {
        set.status = 400;
        return renderCliErrorPage("Missing device code");
      }

      const token = await approveDeviceCode(code, session.user.id);
      if (!token) {
        set.status = 400;
        return renderCliErrorPage("Invalid or expired device code");
      }

      // Token is created, CLI will poll and receive it
      return renderCliSuccessPage();
    },
    {
      body: t.Object({
        code: t.String(),
      }),
    }
  );
