import { getAnsiCss } from "../lib/ansi";

interface PastePageProps {
  id: string;
  content: string; // Already HTML-escaped and ANSI-converted
  rawContent: string; // Original content for size calculation
  expiresIn: string;
  views: number;
  burnAfterRead: boolean;
  isPrivate: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function renderPastePage(props: PastePageProps): string {
  const { id, content, rawContent, expiresIn, views, burnAfterRead, isPrivate } = props;
  const lines = content.split("\n");
  const size = new TextEncoder().encode(rawContent).length;
  const baseUrl = process.env.BASE_URL ?? "https://punt.sh";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>punt.sh - ${escapeHtml(id)}</title>
  <link rel="icon" href="data:image/svg+xml,${encodeURIComponent(getFavicon())}">
  <style>${getBaseStyles()}${getAnsiCss()}${getToastStyles()}</style>
</head>
<body>
  <div class="warning-banner">
    Do not paste sensitive information like passwords, API keys, or secrets.
    All pastes are publicly accessible unless marked private.
  </div>

  <header>
    <div class="header-left">
      <a href="/" class="logo">
        <span class="logo-icon">🏈</span>
        punt.sh
      </a>
      <span class="paste-id">/${escapeHtml(id)}</span>
    </div>
    <div class="header-right">
      <span class="meta">${formatSize(size)}</span>
      <span class="meta-separator">•</span>
      <span class="meta">${lines.length} line${lines.length !== 1 ? "s" : ""}</span>
      <span class="meta-separator">•</span>
      <span class="meta">${views} view${views !== 1 ? "s" : ""}</span>
      <span class="meta-separator">•</span>
      <span class="meta expires">expires ${escapeHtml(expiresIn)}</span>
      ${burnAfterRead ? '<span class="meta burn-badge">🔥 burns after read</span>' : ""}
      ${isPrivate ? '<span class="meta private-badge">🔒 private</span>' : ""}
    </div>
  </header>

  <main>
    <div class="toolbar">
      <button id="copy-btn" class="btn" onclick="copyContent()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        Copy
      </button>
      <button id="download-btn" class="btn" onclick="downloadContent()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download
      </button>
      <a href="/${escapeHtml(id)}/raw" class="btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        Raw
      </a>
      <button id="qr-btn" class="btn" onclick="toggleQR()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
          <rect x="14" y="14" width="3" height="3"></rect>
          <line x1="21" y1="14" x2="21" y2="21"></line>
          <line x1="14" y1="21" x2="21" y2="21"></line>
        </svg>
        QR
      </button>
    </div>

    <!-- QR Code Modal -->
    <div id="qr-modal" class="qr-modal" onclick="toggleQR()">
      <div class="qr-content" onclick="event.stopPropagation()">
        <h3>Scan to open</h3>
        <div id="qr-code"></div>
        <p class="qr-url">${baseUrl}/${escapeHtml(id)}</p>
      </div>
    </div>

    <div class="paste-container">
      <div class="line-numbers">
        ${lines.map((_, i) => `<span class="line-number">${i + 1}</span>`).join("\n        ")}
      </div>
      <pre class="paste-content"><code id="paste-code">${content}</code></pre>
    </div>

    <div class="keyboard-hint">
      <kbd>Ctrl</kbd>+<kbd>C</kbd> copy • <kbd>Ctrl</kbd>+<kbd>S</kbd> download
    </div>
  </main>

  <footer>
    <p>Pastes expire after at most 7 days • <a href="https://github.com/lance0/punt">GitHub</a></p>
  </footer>

  <!-- Toast notification -->
  <div id="toast" class="toast"></div>

  <script>
    const pasteId = '${escapeHtml(id)}';

    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.className = 'toast ' + type + ' show';
      setTimeout(() => toast.classList.remove('show'), 2500);
    }

    async function copyContent() {
      try {
        const response = await fetch('/' + pasteId + '/raw');
        const text = await response.text();
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
      } catch (err) {
        showToast('Failed to copy', 'error');
      }
    }

    function downloadContent() {
      const link = document.createElement('a');
      link.href = '/' + pasteId + '/raw';
      link.download = pasteId + '.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Downloading...', 'success');
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+C when not selecting text copies the whole paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !window.getSelection().toString()) {
        e.preventDefault();
        copyContent();
      }
      // Ctrl+S downloads
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        downloadContent();
      }
      // Escape closes QR modal
      if (e.key === 'Escape') {
        document.getElementById('qr-modal').classList.remove('show');
      }
    });

    // QR Code
    let qrGenerated = false;
    function toggleQR() {
      const modal = document.getElementById('qr-modal');
      modal.classList.toggle('show');
      if (!qrGenerated && modal.classList.contains('show')) {
        generateQR();
        qrGenerated = true;
      }
    }

    function generateQR() {
      const url = '${baseUrl}/${escapeHtml(id)}';
      const size = 200;
      const qrContainer = document.getElementById('qr-code');
      // Use QR Server API for simple QR generation
      const img = document.createElement('img');
      img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&data=' + encodeURIComponent(url);
      img.alt = 'QR Code';
      img.width = size;
      img.height = size;
      qrContainer.appendChild(img);
    }
  </script>
</body>
</html>`;
}

export function renderErrorPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>punt.sh - ${escapeHtml(title)}</title>
  <link rel="icon" href="data:image/svg+xml,${encodeURIComponent(getFavicon())}">
  <style>${getBaseStyles()}</style>
</head>
<body>
  <header>
    <a href="/" class="logo">
      <span class="logo-icon">🏈</span>
      punt.sh
    </a>
  </header>

  <main class="error-page">
    <div class="error-icon">😵</div>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <a href="/" class="btn btn-primary">Back to home</a>
  </main>

  <footer>
    <p>Pastes expire after at most 7 days</p>
  </footer>
</body>
</html>`;
}

export function renderPrivateKeyPage(id: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>punt.sh - Private paste</title>
  <link rel="icon" href="data:image/svg+xml,${encodeURIComponent(getFavicon())}">
  <style>${getBaseStyles()}${getPrivateKeyStyles()}</style>
</head>
<body>
  <header>
    <a href="/" class="logo">
      <span class="logo-icon">🏈</span>
      punt.sh
    </a>
  </header>

  <main class="private-page">
    <div class="private-icon">🔒</div>
    <h1>Private paste</h1>
    <p>This paste is private. Enter the key to view it.</p>
    <form class="key-form" onsubmit="submitKey(event)">
      <input type="text" id="key-input" placeholder="Enter view key" autocomplete="off" autofocus>
      <button type="submit" class="btn btn-primary">Unlock</button>
    </form>
  </main>

  <footer>
    <p>Pastes expire after at most 7 days</p>
  </footer>

  <script>
    function submitKey(e) {
      e.preventDefault();
      const key = document.getElementById('key-input').value.trim();
      if (key) {
        window.location.href = '/${escapeHtml(id)}?key=' + encodeURIComponent(key);
      }
    }
  </script>
</body>
</html>`;
}

function getPrivateKeyStyles(): string {
  return `
    .private-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      text-align: center;
      min-height: 50vh;
    }

    .private-icon {
      font-size: 64px;
    }

    .private-page h1 {
      color: #89b4fa;
      font-size: 24px;
    }

    .key-form {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .key-form input {
      background: #181825;
      border: 1px solid #313244;
      border-radius: 8px;
      padding: 12px 16px;
      color: #cdd6f4;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      min-width: 250px;
    }

    .key-form input:focus {
      border-color: #89b4fa;
    }

    .key-form input::placeholder {
      color: #6c7086;
    }
  `;
}

interface HomePageUser {
  name: string;
  image?: string | null;
}

export function renderHomePage(user?: HomePageUser): string {
  const baseUrl = process.env.BASE_URL ?? "https://punt.sh";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>punt.sh - Share terminal output</title>
  <meta name="description" content="Share terminal output via short URL with accurate ANSI colors. No account required, ephemeral by design.">
  <link rel="icon" href="data:image/svg+xml,${encodeURIComponent(getFavicon())}">
  <style>${getBaseStyles()}${getNavStyles()}</style>
</head>
<body>
  <header>
    <a href="/" class="logo">
      <span class="logo-icon">🏈</span>
      punt.sh
    </a>
    <nav class="nav-links">
      ${user ? `
        <a href="/me" class="nav-link user-link">
          ${user.image ? `<img src="${escapeHtml(user.image)}" alt="" class="nav-avatar">` : ""}
          <span>${escapeHtml(user.name)}</span>
        </a>
      ` : `
        <a href="/login/github?callbackURL=/" class="nav-link login-link">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Sign in
        </a>
      `}
    </nav>
  </header>

  <main class="home-page">
    <div class="hero">
      <h1>Punt your terminal output</h1>
      <p class="tagline">Share logs, errors, and command output with accurate ANSI colors.<br>No account. Short lifetime. Simple.</p>
    </div>

    <div class="usage-section">
      <h2>Quick Start</h2>
      <pre class="usage-code"><code><span class="comment"># Pipe any command output</span>
command | curl -X POST --data-binary @- ${baseUrl}/api/paste

<span class="comment"># With custom TTL (default: 24h, max: 7d)</span>
command | curl -X POST -H "X-TTL: 1h" --data-binary @- ${baseUrl}/api/paste</code></pre>
    </div>

    <div class="examples-section">
      <h2>Examples</h2>
      <div class="examples-grid">
        <div class="example-card">
          <div class="example-icon">🐳</div>
          <div class="example-content">
            <code>docker logs myapp | curl -X POST --data-binary @- ${baseUrl}/api/paste</code>
          </div>
        </div>
        <div class="example-card">
          <div class="example-icon">☸️</div>
          <div class="example-content">
            <code>kubectl describe pod mypod | curl -X POST --data-binary @- ${baseUrl}/api/paste</code>
          </div>
        </div>
        <div class="example-card">
          <div class="example-icon">🧪</div>
          <div class="example-content">
            <code>npm test 2>&1 | curl -X POST --data-binary @- ${baseUrl}/api/paste</code>
          </div>
        </div>
      </div>
    </div>

    <div class="features-section">
      <h2>Features</h2>
      <div class="features-grid">
        <div class="feature">
          <span class="feature-icon">🎨</span>
          <span>ANSI colors preserved</span>
        </div>
        <div class="feature">
          <span class="feature-icon">👤</span>
          <span>No account required</span>
        </div>
        <div class="feature">
          <span class="feature-icon">⏱️</span>
          <span>24h default expiry</span>
        </div>
        <div class="feature">
          <span class="feature-icon">📦</span>
          <span>4 MB size limit</span>
        </div>
        <div class="feature">
          <span class="feature-icon">🚦</span>
          <span>100 pastes/day per IP</span>
        </div>
        <div class="feature">
          <span class="feature-icon">🔗</span>
          <span>Short, shareable URLs</span>
        </div>
      </div>
    </div>
  </main>

  <footer>
    <p>Pastes expire after at most 7 days • <a href="https://github.com/lance0/punt">GitHub</a></p>
  </footer>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getFavicon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏈</text></svg>`;
}

function getNavStyles(): string {
  return `
    .nav-links {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #cdd6f4;
      text-decoration: none;
      font-size: 14px;
      padding: 8px 16px;
      border-radius: 8px;
      background: #313244;
      border: 1px solid #45475a;
      transition: all 0.2s;
    }

    .nav-link:hover {
      background: #45475a;
      border-color: #585b70;
    }

    .nav-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }

    .login-link svg {
      opacity: 0.8;
    }

    .user-link {
      color: #a6e3a1;
    }

    @media (max-width: 768px) {
      .nav-link {
        padding: 6px 12px;
        font-size: 13px;
      }

      .nav-avatar {
        width: 20px;
        height: 20px;
      }
    }
  `;
}

function getToastStyles(): string {
  return `
    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #313244;
      color: #cdd6f4;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 1000;
      border: 1px solid #45475a;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .toast.success {
      border-left: 3px solid #a6e3a1;
    }
    .toast.error {
      border-left: 3px solid #f38ba8;
    }
  `;
}

function getBaseStyles(): string {
  return `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
    }

    body {
      font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
      background-color: #1e1e2e;
      color: #cdd6f4;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .warning-banner {
      background: linear-gradient(90deg, #f9e2af 0%, #fab387 100%);
      color: #1e1e2e;
      padding: 10px 16px;
      text-align: center;
      font-size: 13px;
      font-family: system-ui, -apple-system, sans-serif;
      font-weight: 500;
      width: 100%;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #313244;
      flex-wrap: wrap;
      gap: 12px;
      background: rgba(17, 17, 27, 0.5);
      width: 100%;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .logo {
      color: #89b4fa;
      text-decoration: none;
      font-size: 20px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: color 0.2s;
    }

    .logo:hover {
      color: #b4befe;
    }

    .logo-icon {
      font-size: 24px;
    }

    .paste-id {
      color: #6c7086;
      font-size: 15px;
      background: #313244;
      padding: 4px 10px;
      border-radius: 4px;
    }

    .meta {
      color: #6c7086;
      font-size: 12px;
    }

    .meta-separator {
      color: #45475a;
      font-size: 10px;
    }

    .expires {
      color: #f9e2af;
    }

    .burn-badge {
      color: #f38ba8;
      background: rgba(243, 139, 168, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
    }

    .private-badge {
      color: #89b4fa;
      background: rgba(137, 180, 250, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
    }

    .qr-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 1000;
      justify-content: center;
      align-items: center;
    }

    .qr-modal.show {
      display: flex;
    }

    .qr-content {
      background: #1e1e2e;
      border: 1px solid #313244;
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }

    .qr-content h3 {
      margin-bottom: 20px;
      color: #cdd6f4;
      font-size: 18px;
    }

    .qr-content img {
      border-radius: 8px;
      background: white;
      padding: 8px;
    }

    .qr-url {
      margin-top: 16px;
      color: #6c7086;
      font-size: 12px;
      word-break: break-all;
    }

    main {
      flex: 1;
      padding: 24px;
      overflow: hidden;
      max-width: 100%;
    }

    .toolbar {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .btn {
      background-color: #313244;
      color: #cdd6f4;
      border: 1px solid #45475a;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      font-family: inherit;
    }

    .btn:hover {
      background-color: #45475a;
      border-color: #585b70;
      transform: translateY(-1px);
    }

    .btn:active {
      transform: translateY(0);
    }

    .btn-primary {
      background: linear-gradient(135deg, #89b4fa 0%, #b4befe 100%);
      color: #1e1e2e;
      border: none;
      font-weight: 600;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #b4befe 0%, #89b4fa 100%);
    }

    .btn svg {
      opacity: 0.8;
    }

    .paste-container {
      display: flex;
      background-color: #181825;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #313244;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      max-width: 100%;
      width: 100%;
    }

    .line-numbers {
      display: flex;
      flex-direction: column;
      padding: 16px 12px;
      background-color: #11111b;
      color: #45475a;
      text-align: right;
      user-select: none;
      border-right: 1px solid #313244;
      min-width: 50px;
    }

    .line-number {
      line-height: 1.5;
      font-size: 13px;
      transition: color 0.2s;
    }

    .line-number:hover {
      color: #6c7086;
    }

    .paste-content {
      flex: 1;
      min-width: 0;
      padding: 16px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.5;
      white-space: pre;
      margin: 0;
      -webkit-overflow-scrolling: touch;
    }

    .paste-content code {
      font-family: inherit;
    }

    .keyboard-hint {
      margin-top: 16px;
      text-align: center;
      font-size: 12px;
      color: #45475a;
    }

    .keyboard-hint kbd {
      background: #313244;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #45475a;
      font-family: inherit;
      font-size: 11px;
    }

    .error-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      text-align: center;
      min-height: 50vh;
    }

    .error-icon {
      font-size: 64px;
    }

    .error-page h1 {
      color: #f38ba8;
      font-size: 24px;
    }

    .home-page {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px 16px;
      width: 100%;
    }

    .hero {
      text-align: center;
      margin-bottom: 48px;
    }

    .hero h1 {
      font-size: 42px;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #89b4fa 0%, #f5c2e7 50%, #fab387 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .tagline {
      color: #6c7086;
      font-size: 16px;
      line-height: 1.6;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .home-page h2 {
      font-size: 18px;
      margin-bottom: 16px;
      color: #89b4fa;
    }

    .usage-section, .examples-section, .features-section {
      margin-bottom: 48px;
    }

    .usage-code {
      background-color: #181825;
      border: 1px solid #313244;
      border-radius: 12px;
      padding: 20px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.8;
      max-width: 100%;
      -webkit-overflow-scrolling: touch;
    }

    .usage-code .comment {
      color: #6c7086;
    }

    .examples-grid {
      display: grid;
      gap: 12px;
    }

    .example-card {
      background: #181825;
      border: 1px solid #313244;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: border-color 0.2s;
      max-width: 100%;
      overflow: hidden;
    }

    .example-card:hover {
      border-color: #45475a;
    }

    .example-icon {
      font-size: 28px;
      flex-shrink: 0;
    }

    .example-content {
      overflow-x: auto;
      min-width: 0;
      flex: 1;
      -webkit-overflow-scrolling: touch;
    }

    .example-content code {
      font-size: 12px;
      color: #a6adc8;
      white-space: nowrap;
      display: block;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .feature {
      background: #181825;
      border: 1px solid #313244;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      color: #a6adc8;
    }

    .feature-icon {
      font-size: 20px;
    }

    footer {
      padding: 20px 24px;
      border-top: 1px solid #313244;
      text-align: center;
      font-size: 13px;
      color: #6c7086;
      font-family: system-ui, -apple-system, sans-serif;
    }

    footer a {
      color: #89b4fa;
      text-decoration: none;
    }

    footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      html {
        font-size: 14px;
      }

      .warning-banner {
        font-size: 11px;
        padding: 8px 12px;
      }

      header {
        flex-direction: column;
        align-items: flex-start;
        padding: 12px 16px;
        gap: 8px;
      }

      .header-left {
        width: 100%;
      }

      .header-right {
        width: 100%;
        justify-content: flex-start;
        flex-wrap: wrap;
        gap: 6px;
      }

      .meta {
        font-size: 11px;
      }

      .meta-separator {
        display: none;
      }

      .burn-badge, .private-badge {
        font-size: 10px;
        padding: 2px 6px;
      }

      main {
        padding: 12px;
        overflow: hidden;
      }

      .toolbar {
        flex-wrap: wrap;
        gap: 6px;
      }

      .paste-container {
        max-width: calc(100vw - 24px);
      }

      .btn {
        padding: 8px 12px;
        font-size: 12px;
        flex: 1;
        min-width: 70px;
        justify-content: center;
      }

      .btn svg {
        width: 12px;
        height: 12px;
      }

      .line-numbers {
        display: none;
      }

      .paste-container {
        border-radius: 8px;
      }

      .paste-content {
        padding: 12px;
        font-size: 12px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .keyboard-hint {
        display: none;
      }

      .qr-content {
        padding: 24px;
        margin: 16px;
        border-radius: 12px;
      }

      .qr-content h3 {
        font-size: 16px;
      }

      .qr-content img {
        width: 160px !important;
        height: 160px !important;
      }

      /* Home page mobile */
      .home-page {
        padding: 16px 12px;
      }

      .hero {
        margin-bottom: 32px;
      }

      .hero h1 {
        font-size: 24px;
        line-height: 1.2;
      }

      .tagline {
        font-size: 14px;
      }

      .tagline br {
        display: none;
      }

      .usage-section, .examples-section, .features-section {
        margin-bottom: 32px;
      }

      .usage-code {
        font-size: 10px;
        padding: 12px;
        border-radius: 8px;
      }

      .example-card {
        padding: 12px;
        gap: 12px;
      }

      .example-icon {
        font-size: 24px;
      }

      .example-content code {
        font-size: 9px;
      }

      .features-grid {
        grid-template-columns: 1fr 1fr;
      }

      .feature {
        padding: 12px;
        font-size: 12px;
      }

      .feature-icon {
        font-size: 16px;
      }

      footer {
        font-size: 11px;
        padding: 16px;
      }

      /* Private key page */
      .private-icon {
        font-size: 48px;
      }

      .private-page h1 {
        font-size: 20px;
      }

      .key-form {
        flex-direction: column;
        width: 100%;
        padding: 0 16px;
      }

      .key-form input {
        min-width: auto;
        width: 100%;
      }

      /* Error page */
      .error-icon {
        font-size: 48px;
      }

      .error-page h1 {
        font-size: 20px;
      }
    }

    @media (max-width: 400px) {
      .btn {
        padding: 8px 10px;
        font-size: 11px;
        gap: 4px;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .header-right .meta:not(.expires):not(.burn-badge):not(.private-badge) {
        display: none;
      }
    }
  `;
}
