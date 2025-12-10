import type { AdminStats, Report } from "../lib/db";
import { FAVICON, GITHUB_ICON, escapeHtml, renderHeader, renderFooter, getSharedStyles } from "./shared";

interface DashboardProps {
  user: { name: string; email: string; image?: string | null };
  stats: AdminStats;
  reports: Report[];
}

export function renderLoginPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="${FAVICON}">
  <title>punt.sh - Admin Login</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'SF Mono', 'Menlo', 'Consolas', 'Monaco', monospace;
      background: #1e1e2e;
      color: #cdd6f4;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    ${getSharedStyles()}
    .site-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
    }
    .login-box {
      text-align: center;
      padding: 48px;
      background: #181825;
      border-radius: 16px;
      border: 1px solid #313244;
    }
    .logo { font-size: 48px; margin-bottom: 16px; }
    h1 { color: #89b4fa; margin-bottom: 8px; }
    p { color: #6c7086; margin-bottom: 24px; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #313244;
      color: #cdd6f4;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 16px;
      border: 1px solid #45475a;
      transition: all 0.2s;
    }
    .btn:hover { background: #45475a; transform: translateY(-2px); }
    .btn svg { width: 24px; height: 24px; }
    @media (max-width: 768px) {
      .login-box { padding: 32px 24px; margin: 16px; }
      .btn { min-height: 44px; padding: 12px 24px; }
    }
  </style>
</head>
<body>
  <div class="login-box">
    <div class="logo">🏈</div>
    <h1>punt.sh Admin</h1>
    <p>Sign in with GitHub to access the dashboard</p>
    <a href="/login/github" class="btn">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      Sign in with GitHub
    </a>
  </div>

  ${renderFooter()}
</body>
</html>`;
}

export function renderDashboardPage({ user, stats, reports }: DashboardProps): string {
  const formatDate = (ts: number) => new Date(ts * 1000).toLocaleString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="${FAVICON}">
  <title>punt.sh - Admin Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'SF Mono', 'Menlo', 'Consolas', 'Monaco', monospace;
      background: #1e1e2e;
      color: #cdd6f4;
      min-height: 100vh;
    }
    ${getSharedStyles()}
    main { padding: 24px; max-width: 1200px; margin: 0 auto; }
    h1 { color: #89b4fa; margin-bottom: 24px; }
    h2 { color: #89b4fa; margin: 32px 0 16px; font-size: 18px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: #181825;
      border: 1px solid #313244;
      border-radius: 12px;
      padding: 20px;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #cdd6f4;
    }
    .stat-label {
      color: #6c7086;
      font-size: 13px;
      margin-top: 4px;
    }
    .reports-table {
      width: 100%;
      border-collapse: collapse;
      background: #181825;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #313244;
    }
    .reports-table th, .reports-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #313244;
    }
    .reports-table th {
      background: #11111b;
      color: #89b4fa;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
    }
    .reports-table tr:last-child td { border-bottom: none; }
    .reports-table td { font-size: 13px; }
    .paste-link {
      color: #89b4fa;
      text-decoration: none;
    }
    .paste-link:hover { text-decoration: underline; }
    .reason { max-width: 300px; word-break: break-word; }
    .actions { display: flex; gap: 8px; }
    .btn {
      padding: 6px 12px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 12px;
      font-family: inherit;
    }
    .btn-resolve {
      background: #a6e3a1;
      color: #1e1e2e;
    }
    .btn-delete {
      background: #f38ba8;
      color: #1e1e2e;
    }
    .btn:hover { opacity: 0.9; }
    .empty {
      text-align: center;
      padding: 48px;
      color: #6c7086;
    }
    .top-ips {
      background: #181825;
      border: 1px solid #313244;
      border-radius: 12px;
      padding: 16px;
    }
    .top-ips li {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #313244;
      font-size: 13px;
    }
    .top-ips li:last-child { border-bottom: none; }
    .ip { color: #6c7086; }
    .count { color: #f9e2af; }
    @media (max-width: 768px) {
      main { padding: 16px; }
      h1 { font-size: 20px; }
      .stat-card { padding: 16px; }
      .stat-value { font-size: 24px; }
      .reports-table { font-size: 12px; }
      .reports-table th, .reports-table td { padding: 8px; }
      .actions { flex-direction: column; gap: 4px; }
      .btn { min-height: 44px; padding: 10px 16px; }
    }
  </style>
</head>
<body>
  ${renderHeader({ user, callbackURL: '/dashboard' })}

  <main>
    <h1>Admin Dashboard</h1>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.totalPastes}</div>
        <div class="stat-label">Total Pastes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.pastesToday}</div>
        <div class="stat-label">Today</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.pastes7Days}</div>
        <div class="stat-label">Last 7 Days</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.activePastes}</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalViews}</div>
        <div class="stat-label">Total Views</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.burnAfterReadCount}</div>
        <div class="stat-label">Burn After Read</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.privateCount}</div>
        <div class="stat-label">Private</div>
      </div>
    </div>

    <h2>Top IPs</h2>
    <ul class="top-ips">
      ${stats.topIps.length === 0 ? '<li class="empty">No data</li>' : stats.topIps.map(ip => `
        <li>
          <span class="ip">${ip.ip}</span>
          <span class="count">${ip.count} pastes</span>
        </li>
      `).join("")}
    </ul>

    <h2>Abuse Reports (${reports.length})</h2>
    ${reports.length === 0 ? `
      <div class="empty">No pending reports</div>
    ` : `
      <table class="reports-table">
        <thead>
          <tr>
            <th>Paste</th>
            <th>Reason</th>
            <th>Reporter IP</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${reports.map(r => `
            <tr>
              <td><a href="/${r.paste_id}" target="_blank" class="paste-link">${r.paste_id}</a></td>
              <td class="reason">${escapeHtml(r.reason)}</td>
              <td>${r.reporter_ip}</td>
              <td>${formatDate(r.created_at)}</td>
              <td class="actions">
                <form method="POST" action="/dashboard/resolve/${r.id}" style="display:inline;">
                  <button type="submit" class="btn btn-resolve">Resolve</button>
                </form>
                <form method="POST" action="/dashboard/delete-paste/${r.paste_id}" style="display:inline;">
                  <button type="submit" class="btn btn-delete">Delete Paste</button>
                </form>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `}
  </main>

  ${renderFooter()}
</body>
</html>`;
}
