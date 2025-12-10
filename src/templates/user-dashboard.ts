import type { UserPaste } from "../lib/db";
import type { ApiToken } from "../lib/tokens";
import { formatTimeRemaining } from "../lib/time";

const FAVICON = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ctext%20y%3D%22.9em%22%20font-size%3D%2290%22%3E%F0%9F%8F%88%3C%2Ftext%3E%3C%2Fsvg%3E';

interface DashboardProps {
  user: { id: string; name: string; email: string; image?: string | null };
  stats: { totalPastes: number; activePastes: number; totalViews: number };
  pastes: UserPaste[];
  tokens: ApiToken[];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderUserDashboard({ user, stats, pastes, tokens }: DashboardProps): string {
  const formatDate = (ts: number) => new Date(ts * 1000).toLocaleString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="${FAVICON}">
  <title>punt.sh - My Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'SF Mono', 'Menlo', 'Consolas', 'Monaco', monospace;
      background: #1e1e2e;
      color: #cdd6f4;
      min-height: 100vh;
      padding: 24px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .logo-link { text-decoration: none; display: flex; align-items: center; gap: 12px; }
    .logo { font-size: 32px; }
    h1 { color: #89b4fa; font-size: 24px; }
    .header-nav { display: flex; gap: 16px; align-items: center; }
    .header-nav a {
      color: #6c7086;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }
    .header-nav a:hover { color: #cdd6f4; }
    footer {
      padding: 24px;
      text-align: center;
      border-top: 1px solid #313244;
      color: #6c7086;
      font-size: 13px;
      margin-top: 32px;
      font-family: system-ui, sans-serif;
    }
    footer a { color: #89b4fa; text-decoration: none; }
    footer a:hover { text-decoration: underline; }
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-info img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
    }
    .user-info span { color: #a6e3a1; }
    .btn {
      background: #313244;
      color: #cdd6f4;
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 14px;
      border: 1px solid #45475a;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.2s;
    }
    .btn:hover { background: #45475a; }
    .btn-danger { border-color: #f38ba8; color: #f38ba8; }
    .btn-danger:hover { background: #f38ba8; color: #1e1e2e; }
    .btn-primary { background: #89b4fa; color: #1e1e2e; border-color: #89b4fa; }
    .btn-primary:hover { background: #74c7ec; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: #181825;
      border: 1px solid #313244;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #89b4fa;
    }
    .stat-label {
      color: #6c7086;
      font-size: 14px;
      margin-top: 4px;
    }
    .section {
      background: #181825;
      border: 1px solid #313244;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .section h2 {
      color: #f9e2af;
      font-size: 18px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #313244;
    }
    th {
      color: #6c7086;
      font-weight: normal;
      font-size: 12px;
      text-transform: uppercase;
    }
    td { font-size: 14px; }
    .paste-id a {
      color: #89b4fa;
      text-decoration: none;
    }
    .paste-id a:hover { text-decoration: underline; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-right: 4px;
    }
    .badge-burn { background: #fab387; color: #1e1e2e; }
    .badge-private { background: #cba6f7; color: #1e1e2e; }
    .token-value {
      font-family: monospace;
      color: #6c7086;
      font-size: 12px;
    }
    .actions { display: flex; gap: 8px; }
    .empty {
      color: #6c7086;
      text-align: center;
      padding: 32px;
    }
    form { display: inline; }
    .new-token-form {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }
    .new-token-form input {
      background: #313244;
      border: 1px solid #45475a;
      border-radius: 6px;
      padding: 8px 12px;
      color: #cdd6f4;
      font-family: inherit;
      flex: 1;
    }
    .new-token-form input::placeholder { color: #6c7086; }
    @media (max-width: 768px) {
      body { padding: 16px; }
      table { font-size: 12px; }
      th, td { padding: 8px 4px; }
      .actions { flex-direction: column; }
      .btn {
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px 16px;
      }
      .header-nav a {
        min-height: 44px;
        display: flex;
        align-items: center;
        padding: 0 8px;
      }
      .new-token-form { flex-direction: column; }
      .new-token-form input { min-height: 44px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <a href="/" class="logo-link">
        <span class="logo">🏈</span>
        <h1>punt.sh</h1>
      </a>
      <nav class="header-nav">
        <a href="/">Home</a>
        <a href="/docs">Docs</a>
      </nav>
      <div class="user-info">
        ${user.image ? `<img src="${escapeHtml(user.image)}" alt="Avatar">` : ""}
        <span>${escapeHtml(user.name)}</span>
        <a href="/api/auth/sign-out" class="btn">Sign out</a>
      </div>
    </header>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${stats.totalPastes}</div>
        <div class="stat-label">Total Pastes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.activePastes}</div>
        <div class="stat-label">Active Pastes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalViews}</div>
        <div class="stat-label">Total Views</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h2>My Pastes</h2>
      </div>
      ${
        pastes.length === 0
          ? '<div class="empty">No pastes yet. Create one with the CLI!</div>'
          : `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Created</th>
            <th>Expires</th>
            <th>Views</th>
            <th>Flags</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${pastes
            .map(
              (paste) => `
          <tr>
            <td class="paste-id"><a href="/${paste.id}" target="_blank">${paste.id}</a></td>
            <td>${formatDate(paste.created_at)}</td>
            <td>${formatTimeRemaining(paste.expires_at)}</td>
            <td>${paste.views}</td>
            <td>
              ${paste.burn_after_read ? '<span class="badge badge-burn">🔥</span>' : ""}
              ${paste.is_private ? '<span class="badge badge-private">🔒</span>' : ""}
            </td>
            <td class="actions">
              <form action="/api/me/pastes/${paste.id}/extend" method="POST">
                <button type="submit" class="btn">+7d</button>
              </form>
              <form action="/api/me/pastes/${paste.id}" method="POST">
                <input type="hidden" name="_method" value="DELETE">
                <button type="submit" class="btn btn-danger" onclick="return confirm('Delete this paste?')">Delete</button>
              </form>
            </td>
          </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      `
      }
    </div>

    <div class="section">
      <div class="section-header">
        <h2>API Tokens</h2>
      </div>
      ${
        tokens.length === 0
          ? '<div class="empty">No API tokens. Create one to use with the CLI.</div>'
          : `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Created</th>
            <th>Last Used</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tokens
            .map(
              (token) => `
          <tr>
            <td>${escapeHtml(token.name)}</td>
            <td>${formatDate(token.created_at)}</td>
            <td>${token.last_used_at ? formatDate(token.last_used_at) : "Never"}</td>
            <td class="actions">
              <form action="/api/tokens/${token.id}" method="POST">
                <input type="hidden" name="_method" value="DELETE">
                <button type="submit" class="btn btn-danger" onclick="return confirm('Revoke this token?')">Revoke</button>
              </form>
            </td>
          </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      `
      }
      <form class="new-token-form" action="/api/tokens" method="POST">
        <input type="text" name="name" placeholder="Token name (e.g., Work Laptop)" required>
        <button type="submit" class="btn btn-primary">Create Token</button>
      </form>
    </div>
  </div>

  <footer>
    <p>punt.sh • <a href="https://github.com/lance0/punt">GitHub</a></p>
  </footer>
</body>
</html>`;
}

export function renderNewTokenPage(token: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="${FAVICON}">
  <title>punt.sh - New Token Created</title>
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
    .box {
      text-align: center;
      padding: 48px;
      background: #181825;
      border-radius: 16px;
      border: 1px solid #313244;
      max-width: 600px;
    }
    .check { font-size: 64px; margin-bottom: 16px; }
    h1 { color: #a6e3a1; margin-bottom: 8px; }
    p { color: #6c7086; margin-bottom: 24px; }
    .token-box {
      background: #313244;
      border: 1px solid #45475a;
      border-radius: 8px;
      padding: 16px;
      font-family: monospace;
      font-size: 14px;
      color: #f9e2af;
      word-break: break-all;
      margin-bottom: 24px;
      user-select: all;
    }
    .warning {
      background: #f38ba815;
      border: 1px solid #f38ba8;
      border-radius: 8px;
      padding: 12px;
      color: #f38ba8;
      font-size: 14px;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      background: #89b4fa;
      color: #1e1e2e;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 16px;
    }
    .btn:hover { background: #74c7ec; }
    footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px;
      text-align: center;
      color: #6c7086;
      font-size: 13px;
      font-family: system-ui, sans-serif;
    }
    footer a { color: #89b4fa; text-decoration: none; }
    footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="box">
    <div class="check">✓</div>
    <h1>Token Created!</h1>
    <p>Copy this token now. You won't be able to see it again.</p>
    <div class="token-box">${escapeHtml(token)}</div>
    <div class="warning">
      Store this token securely. It provides full access to your account.
    </div>
    <a href="/me" class="btn">Back to Dashboard</a>
  </div>

  <footer>
    <p>punt.sh • <a href="https://github.com/lance0/punt">GitHub</a></p>
  </footer>
</body>
</html>`;
}
