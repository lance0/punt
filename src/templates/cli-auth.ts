// CLI device auth browser page templates
import { FAVICON, GITHUB_ICON, escapeHtml, renderHeader, renderFooter, getSharedStyles } from "./shared";

interface AuthorizePageProps {
  code: string;
  user: { name: string; email: string; image?: string | null };
}

export function renderCliAuthPage(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="${FAVICON}">
  <title>punt.sh - CLI Login</title>
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
    .site-header { position: fixed; top: 0; left: 0; right: 0; }
    .site-footer { position: fixed; bottom: 0; left: 0; right: 0; }
    .auth-box {
      text-align: center;
      padding: 48px;
      background: #181825;
      border-radius: 16px;
      border: 1px solid #313244;
      max-width: 400px;
    }
    .logo { font-size: 48px; margin-bottom: 16px; }
    h1 { color: #89b4fa; margin-bottom: 8px; }
    p { color: #6c7086; margin-bottom: 24px; line-height: 1.5; }
    .code-display {
      font-family: 'SF Mono', 'Menlo', 'Consolas', 'Monaco', monospace;
      font-size: 18px;
      background: #313244;
      padding: 12px 20px;
      border-radius: 8px;
      color: #a6e3a1;
      margin-bottom: 24px;
      letter-spacing: 2px;
    }
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
      .auth-box { padding: 32px 24px; margin: 16px; }
      .code-display { font-size: 14px; }
      .btn { min-height: 44px; padding: 12px 24px; }
    }
  </style>
</head>
<body>
  ${renderHeader()}

  <div class="auth-box">
    <div class="logo">🏈</div>
    <h1>Authorize CLI</h1>
    <p>Sign in to authorize the punt CLI on your device</p>
    <div class="code-display">${escapeHtml(code)}</div>
    <a href="/cli/auth/github?code=${encodeURIComponent(code)}" class="btn">
      ${GITHUB_ICON}
      Sign in with GitHub
    </a>
  </div>

  ${renderFooter()}
</body>
</html>`;
}

export function renderCliAuthorizePage({ code, user }: AuthorizePageProps): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="${FAVICON}">
  <title>punt.sh - Authorize CLI</title>
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
    .site-header { position: fixed; top: 0; left: 0; right: 0; }
    .site-footer { position: fixed; bottom: 0; left: 0; right: 0; }
    .auth-box {
      text-align: center;
      padding: 48px;
      background: #181825;
      border-radius: 16px;
      border: 1px solid #313244;
      max-width: 420px;
    }
    .logo { font-size: 48px; margin-bottom: 16px; }
    h1 { color: #89b4fa; margin-bottom: 8px; }
    p { color: #6c7086; margin-bottom: 16px; line-height: 1.5; }
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #313244;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      justify-content: center;
    }
    .user-info img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }
    .user-info span { color: #a6e3a1; }
    .code-display {
      font-family: 'SF Mono', 'Menlo', 'Consolas', 'Monaco', monospace;
      font-size: 18px;
      background: #313244;
      padding: 12px 20px;
      border-radius: 8px;
      color: #f9e2af;
      margin-bottom: 24px;
      letter-spacing: 2px;
    }
    .actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 16px;
      border: 1px solid #45475a;
      transition: all 0.2s;
      cursor: pointer;
      font-family: inherit;
    }
    .btn-approve {
      background: #a6e3a1;
      color: #1e1e2e;
      border-color: #a6e3a1;
    }
    .btn-approve:hover { background: #94e2d5; }
    .btn-cancel {
      background: #313244;
      color: #cdd6f4;
    }
    .btn-cancel:hover { background: #45475a; }
    @media (max-width: 768px) {
      .auth-box { padding: 32px 24px; margin: 16px; }
      .code-display { font-size: 14px; }
      .btn { min-height: 44px; padding: 12px 24px; }
      .actions { flex-direction: column; }
    }
  </style>
</head>
<body>
  ${renderHeader({ user })}

  <div class="auth-box">
    <div class="logo">🏈</div>
    <h1>Authorize CLI</h1>
    <p>Do you want to authorize the punt CLI?</p>
    <div class="user-info">
      ${user.image ? `<img src="${escapeHtml(user.image)}" alt="Avatar">` : ""}
      <span>${escapeHtml(user.name)}</span>
    </div>
    <div class="code-display">${escapeHtml(code)}</div>
    <div class="actions">
      <form action="/api/cli/approve" method="POST" style="display:inline;">
        <input type="hidden" name="code" value="${escapeHtml(code)}">
        <button type="submit" class="btn btn-approve">Authorize</button>
      </form>
      <a href="/" class="btn btn-cancel">Cancel</a>
    </div>
  </div>

  ${renderFooter()}
</body>
</html>`;
}

export function renderCliSuccessPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="${FAVICON}">
  <title>punt.sh - CLI Authorized</title>
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
    .site-header { position: fixed; top: 0; left: 0; right: 0; }
    .site-footer { position: fixed; bottom: 0; left: 0; right: 0; }
    .success-box {
      text-align: center;
      padding: 48px;
      background: #181825;
      border-radius: 16px;
      border: 1px solid #313244;
    }
    .check { font-size: 64px; margin-bottom: 16px; }
    h1 { color: #a6e3a1; margin-bottom: 8px; }
    p { color: #6c7086; margin-bottom: 24px; }
    code {
      background: #313244;
      padding: 4px 8px;
      border-radius: 4px;
      color: #f9e2af;
    }
    @media (max-width: 768px) {
      .success-box { padding: 32px 24px; margin: 16px; }
    }
  </style>
</head>
<body>
  ${renderHeader()}

  <div class="success-box">
    <div class="check">✓</div>
    <h1>CLI Authorized!</h1>
    <p>You can close this window and return to your terminal.</p>
    <p>Try running <code>punt whoami</code> to verify.</p>
  </div>

  ${renderFooter()}
</body>
</html>`;
}

export function renderCliErrorPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="${FAVICON}">
  <title>punt.sh - Error</title>
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
    .site-header { position: fixed; top: 0; left: 0; right: 0; }
    .site-footer { position: fixed; bottom: 0; left: 0; right: 0; }
    .error-box {
      text-align: center;
      padding: 48px;
      background: #181825;
      border-radius: 16px;
      border: 1px solid #313244;
    }
    .x { font-size: 64px; margin-bottom: 16px; }
    h1 { color: #f38ba8; margin-bottom: 8px; }
    p { color: #6c7086; margin-bottom: 24px; }
    .btn {
      display: inline-block;
      background: #313244;
      color: #cdd6f4;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 16px;
      border: 1px solid #45475a;
      transition: all 0.2s;
    }
    .btn:hover { background: #45475a; }
    @media (max-width: 768px) {
      .error-box { padding: 32px 24px; margin: 16px; }
      .btn { min-height: 44px; padding: 12px 24px; }
    }
  </style>
</head>
<body>
  ${renderHeader()}

  <div class="error-box">
    <div class="x">✕</div>
    <h1>Authorization Failed</h1>
    <p>${escapeHtml(message)}</p>
    <a href="/" class="btn">Return Home</a>
  </div>

  ${renderFooter()}
</body>
</html>`;
}
