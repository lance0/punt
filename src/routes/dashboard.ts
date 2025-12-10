import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { auth, isAdmin } from "../lib/auth";
import { getAdminStats, getReports, resolveReport, deletePasteById, getRecentPastesByIp } from "../lib/db";
import { renderDashboardPage, renderLoginPage } from "../templates/dashboard";

export const dashboardRoutes = new Elysia()
  .use(html())

  // Simple GET redirect for GitHub login (no JS required)
  .get("/login/github", async ({ query }) => {
    // Support callbackURL parameter for redirecting after login
    const callbackURL = (query as { callbackURL?: string })?.callbackURL || "/dashboard";

    // Get the response with headers (includes state cookie)
    const result = await auth.api.signInSocial({
      body: { provider: "github", callbackURL },
      returnHeaders: true,
    }) as unknown as { headers: Headers; response: { url?: string } };

    if (result.response?.url) {
      // Build redirect response with the state cookie
      const redirectHeaders = new Headers();
      redirectHeaders.set("Location", result.response.url);
      const cookie = result.headers?.get("set-cookie");
      if (cookie) {
        redirectHeaders.set("Set-Cookie", cookie);
      }
      return new Response(null, { status: 302, headers: redirectHeaders });
    }
    return new Response("Failed to initiate login", { status: 500 });
  })

  // Dashboard page
  .get("/dashboard", async ({ request, set, query }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return renderLoginPage();
    }

    // Check if user is admin by GitHub ID (from account table)
    const adminGithubIds = (process.env.ADMIN_GITHUB_IDS ?? "").split(",").map(id => id.trim());

    // Get the GitHub account ID from the session
    // The user.id in BetterAuth is internal, we need to check the account
    const accounts = await auth.api.listUserAccounts({ headers: request.headers });
    const githubAccount = accounts?.find((a: { providerId: string }) => a.providerId === "github");

    if (!githubAccount || !adminGithubIds.includes(githubAccount.accountId)) {
      set.status = 403;
      return `<!DOCTYPE html>
<html>
<head><title>Access Denied</title></head>
<body style="background:#1e1e2e;color:#cdd6f4;font-family:monospace;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
<div style="text-align:center;">
<h1 style="color:#f38ba8;">Access Denied</h1>
<p>You are not authorized to view this page.</p>
<p style="color:#6c7086;">GitHub ID: ${githubAccount?.accountId ?? 'unknown'}</p>
<a href="/api/auth/sign-out" style="color:#89b4fa;">Sign out</a>
</div>
</body>
</html>`;
    }

    // Get IP filter from query params
    const ipFilter = (query as { ip?: string })?.ip?.trim() || "";

    const [stats, reports] = await Promise.all([
      getAdminStats(),
      getReports(true),
    ]);

    // If filtering by IP, override recentPastes
    if (ipFilter) {
      stats.recentPastes = await getRecentPastesByIp(ipFilter);
    }

    return renderDashboardPage({
      user: session.user,
      stats,
      reports,
      ipFilter,
    });
  })

  // Handle report actions via form POST
  .post("/dashboard/resolve/:id", async ({ request, params, set }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      set.redirect = "/dashboard";
      return;
    }

    const adminGithubIds = (process.env.ADMIN_GITHUB_IDS ?? "").split(",").map(id => id.trim());
    const accounts = await auth.api.listUserAccounts({ headers: request.headers });
    const githubAccount = accounts?.find((a: { providerId: string }) => a.providerId === "github");

    if (!githubAccount || !adminGithubIds.includes(githubAccount.accountId)) {
      set.status = 403;
      return "Forbidden";
    }

    await resolveReport(parseInt(params.id, 10));
    set.redirect = "/dashboard";
  })

  .post("/dashboard/delete-paste/:id", async ({ request, params, set }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      set.redirect = "/dashboard";
      return;
    }

    const adminGithubIds = (process.env.ADMIN_GITHUB_IDS ?? "").split(",").map(id => id.trim());
    const accounts = await auth.api.listUserAccounts({ headers: request.headers });
    const githubAccount = accounts?.find((a: { providerId: string }) => a.providerId === "github");

    if (!githubAccount || !adminGithubIds.includes(githubAccount.accountId)) {
      set.status = 403;
      return "Forbidden";
    }

    await deletePasteById(params.id);
    set.redirect = "/dashboard";
  });
