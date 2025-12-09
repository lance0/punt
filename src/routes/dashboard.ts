import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { auth, isAdmin } from "../lib/auth";
import { getAdminStats, getReports, resolveReport, deletePasteById } from "../lib/db";
import { renderDashboardPage, renderLoginPage } from "../templates/dashboard";

export const dashboardRoutes = new Elysia()
  .use(html())

  // Simple GET redirect for GitHub login (no JS required)
  .get("/login/github", async () => {
    const result = await auth.api.signInSocial({
      body: { provider: "github", callbackURL: "/dashboard" },
    });
    if (result?.url) {
      return new Response(null, {
        status: 302,
        headers: { Location: result.url },
      });
    }
    return new Response("Failed to initiate login", { status: 500 });
  })

  // Dashboard page
  .get("/dashboard", async ({ request, set }) => {
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

    const [stats, reports] = await Promise.all([
      getAdminStats(),
      getReports(true),
    ]);

    return renderDashboardPage({
      user: session.user,
      stats,
      reports,
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
