// CLI device auth browser page templates

const FAVICON = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ctext%20y%3D%22.9em%22%20font-size%3D%2290%22%3E%F0%9F%8F%88%3C%2Ftext%3E%3C%2Fsvg%3E';

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
    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: rgba(17, 17, 27, 0.9);
      border-bottom: 1px solid #313244;
    }
    .header-logo {
      color: #89b4fa;
      text-decoration: none;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header-nav { display: flex; gap: 16px; }
    .header-nav a {
      color: #6c7086;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }
    .header-nav a:hover { color: #cdd6f4; }
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
    @media (max-width: 768px) {
      .auth-box { padding: 32px 24px; margin: 16px; }
      .code-display { font-size: 14px; }
      .btn { min-height: 44px; padding: 12px 24px; }
      header { padding: 12px 16px; }
      .header-nav a {
        min-height: 44px;
        display: flex;
        align-items: center;
      }
    }
  </style>
</head>
<body>
  <header>
    <a href="/" class="header-logo">🏈 punt.sh</a>
    <nav class="header-nav">
      <a href="/">Home</a>
      <a href="/docs">Docs</a>
    </nav>
  </header>

  <div class="auth-box">
    <div class="logo">🏈</div>
    <h1>Authorize CLI</h1>
    <p>Sign in to authorize the punt CLI on your device</p>
    <div class="code-display">${escapeHtml(code)}</div>
    <a href="/cli/auth/github?code=${encodeURIComponent(code)}" class="btn">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      Sign in with GitHub
    </a>
  </div>

  <footer>
    <p>punt.sh • <a href="https://github.com/lance0/punt">GitHub</a></p>
  </footer>
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
    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: rgba(17, 17, 27, 0.9);
      border-bottom: 1px solid #313244;
    }
    .header-logo {
      color: #89b4fa;
      text-decoration: none;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header-nav { display: flex; gap: 16px; }
    .header-nav a {
      color: #6c7086;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }
    .header-nav a:hover { color: #cdd6f4; }
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
    @media (max-width: 768px) {
      .auth-box { padding: 32px 24px; margin: 16px; }
      .code-display { font-size: 14px; }
      .btn { min-height: 44px; padding: 12px 24px; }
      header { padding: 12px 16px; }
      .header-nav a {
        min-height: 44px;
        display: flex;
        align-items: center;
      }
      .actions { flex-direction: column; }
    }
  </style>
</head>
<body>
  <header>
    <a href="/" class="header-logo">🏈 punt.sh</a>
    <nav class="header-nav">
      <a href="/">Home</a>
      <a href="/docs">Docs</a>
    </nav>
  </header>

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

  <footer>
    <p>punt.sh • <a href="https://github.com/lance0/punt">GitHub</a></p>
  </footer>
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
    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: rgba(17, 17, 27, 0.9);
      border-bottom: 1px solid #313244;
    }
    .header-logo {
      color: #89b4fa;
      text-decoration: none;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header-nav { display: flex; gap: 16px; }
    .header-nav a {
      color: #6c7086;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }
    .header-nav a:hover { color: #cdd6f4; }
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
    @media (max-width: 768px) {
      .success-box { padding: 32px 24px; margin: 16px; }
      header { padding: 12px 16px; }
      .header-nav a {
        min-height: 44px;
        display: flex;
        align-items: center;
      }
    }
  </style>
</head>
<body>
  <header>
    <a href="/" class="header-logo">🏈 punt.sh</a>
    <nav class="header-nav">
      <a href="/">Home</a>
      <a href="/docs">Docs</a>
    </nav>
  </header>

  <div class="success-box">
    <div class="check">✓</div>
    <h1>CLI Authorized!</h1>
    <p>You can close this window and return to your terminal.</p>
    <p>Try running <code>punt whoami</code> to verify.</p>
  </div>

  <footer>
    <p>punt.sh • <a href="https://github.com/lance0/punt">GitHub</a></p>
  </footer>
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
    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: rgba(17, 17, 27, 0.9);
      border-bottom: 1px solid #313244;
    }
    .header-logo {
      color: #89b4fa;
      text-decoration: none;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header-nav { display: flex; gap: 16px; }
    .header-nav a {
      color: #6c7086;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }
    .header-nav a:hover { color: #cdd6f4; }
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
    @media (max-width: 768px) {
      .error-box { padding: 32px 24px; margin: 16px; }
      .btn { min-height: 44px; padding: 12px 24px; }
      header { padding: 12px 16px; }
      .header-nav a {
        min-height: 44px;
        display: flex;
        align-items: center;
      }
    }
  </style>
</head>
<body>
  <header>
    <a href="/" class="header-logo">🏈 punt.sh</a>
    <nav class="header-nav">
      <a href="/">Home</a>
      <a href="/docs">Docs</a>
    </nav>
  </header>

  <div class="error-box">
    <div class="x">✕</div>
    <h1>Authorization Failed</h1>
    <p>${escapeHtml(message)}</p>
    <a href="/" class="btn">Return Home</a>
  </div>

  <footer>
    <p>punt.sh • <a href="https://github.com/lance0/punt">GitHub</a></p>
  </footer>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
