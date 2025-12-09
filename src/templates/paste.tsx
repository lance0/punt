import { getAnsiCss } from "../lib/ansi";

interface PastePageProps {
  id: string;
  content: string; // Already HTML-escaped and ANSI-converted
  expiresIn: string;
  views: number;
  burnAfterRead: boolean;
}

export function renderPastePage(props: PastePageProps): string {
  const { id, content, expiresIn, views, burnAfterRead } = props;
  const lines = content.split("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>punt.sh - ${escapeHtml(id)}</title>
  <style>${getBaseStyles()}${getAnsiCss()}</style>
</head>
<body>
  <div class="warning-banner">
    Do not paste sensitive information like passwords, API keys, or secrets.
    All pastes are publicly accessible unless marked private.
  </div>

  <header>
    <div class="header-left">
      <a href="/" class="logo">punt.sh</a>
      <span class="paste-id">/${escapeHtml(id)}</span>
    </div>
    <div class="header-right">
      <span class="meta">expires in ${escapeHtml(expiresIn)}</span>
      <span class="meta">${views} view${views !== 1 ? "s" : ""}</span>
      ${burnAfterRead ? '<span class="meta burn-badge">burns after read</span>' : ""}
    </div>
  </header>

  <main>
    <div class="toolbar">
      <button id="copy-btn" class="btn" onclick="copyContent()">
        Copy
      </button>
      <a href="/${escapeHtml(id)}/raw" class="btn">
        Raw
      </a>
    </div>

    <div class="paste-container">
      <div class="line-numbers">
        ${lines.map((_, i) => `<span class="line-number">${i + 1}</span>`).join("\n        ")}
      </div>
      <pre class="paste-content"><code>${content}</code></pre>
    </div>
  </main>

  <footer>
    <p>Pastes expire after at most 7 days</p>
  </footer>

  <script>
    async function copyContent() {
      try {
        const response = await fetch('/${escapeHtml(id)}/raw');
        const text = await response.text();
        await navigator.clipboard.writeText(text);

        const btn = document.getElementById('copy-btn');
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.textContent = 'Copy';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
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
  <style>${getBaseStyles()}</style>
</head>
<body>
  <header>
    <a href="/" class="logo">punt.sh</a>
  </header>

  <main class="error-page">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <a href="/" class="btn">Back to home</a>
  </main>

  <footer>
    <p>Pastes expire after at most 7 days</p>
  </footer>
</body>
</html>`;
}

export function renderHomePage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>punt.sh - Share terminal output</title>
  <style>${getBaseStyles()}</style>
</head>
<body>
  <header>
    <a href="/" class="logo">punt.sh</a>
  </header>

  <main class="home-page">
    <h1>Share terminal output</h1>
    <p class="tagline">with accurate ANSI colors and short, predictable lifetime</p>

    <div class="usage-section">
      <h2>Usage</h2>
      <pre class="usage-code"><code># Pipe any command output
command | curl -X POST --data-binary @- ${process.env.BASE_URL ?? "https://punt.sh"}/api/paste

# With custom TTL (default: 24h, max: 7d)
command | curl -X POST -H "X-TTL: 1h" --data-binary @- ${process.env.BASE_URL ?? "https://punt.sh"}/api/paste

# Examples
docker logs mycontainer | curl -X POST --data-binary @- ${process.env.BASE_URL ?? "https://punt.sh"}/api/paste
kubectl get pods | curl -X POST --data-binary @- ${process.env.BASE_URL ?? "https://punt.sh"}/api/paste
npm test 2>&1 | curl -X POST --data-binary @- ${process.env.BASE_URL ?? "https://punt.sh"}/api/paste</code></pre>
    </div>

    <div class="features-section">
      <h2>Features</h2>
      <ul>
        <li>Preserves ANSI colors and formatting</li>
        <li>No account required</li>
        <li>24 hour default expiry (max 7 days)</li>
        <li>4 MB size limit</li>
        <li>Rate limited: 100 pastes/day per IP</li>
      </ul>
    </div>
  </main>

  <footer>
    <p>Pastes expire after at most 7 days</p>
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

function getBaseStyles(): string {
  return `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
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
      background-color: #f9e2af;
      color: #1e1e2e;
      padding: 8px 16px;
      text-align: center;
      font-size: 13px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #313244;
      flex-wrap: wrap;
      gap: 8px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .logo {
      color: #89b4fa;
      text-decoration: none;
      font-size: 20px;
      font-weight: bold;
    }

    .paste-id {
      color: #6c7086;
      font-size: 16px;
    }

    .meta {
      color: #6c7086;
      font-size: 13px;
    }

    .burn-badge {
      color: #f38ba8;
    }

    main {
      flex: 1;
      padding: 24px;
      overflow: auto;
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
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: background-color 0.2s;
      font-family: inherit;
    }

    .btn:hover {
      background-color: #45475a;
    }

    .paste-container {
      display: flex;
      background-color: #181825;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #313244;
    }

    .line-numbers {
      display: flex;
      flex-direction: column;
      padding: 16px 12px;
      background-color: #11111b;
      color: #6c7086;
      text-align: right;
      user-select: none;
      border-right: 1px solid #313244;
      min-width: 50px;
    }

    .line-number {
      line-height: 1.5;
      font-size: 13px;
    }

    .paste-content {
      flex: 1;
      padding: 16px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.5;
      white-space: pre;
      margin: 0;
    }

    .paste-content code {
      font-family: inherit;
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

    .error-page h1 {
      color: #f38ba8;
      font-size: 24px;
    }

    .home-page {
      max-width: 800px;
      margin: 0 auto;
    }

    .home-page h1 {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .home-page .tagline {
      color: #6c7086;
      margin-bottom: 32px;
    }

    .home-page h2 {
      font-size: 18px;
      margin-bottom: 12px;
      color: #89b4fa;
    }

    .usage-section, .features-section {
      margin-bottom: 32px;
    }

    .usage-code {
      background-color: #181825;
      border: 1px solid #313244;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.6;
    }

    .features-section ul {
      list-style: none;
      padding-left: 0;
    }

    .features-section li {
      padding: 4px 0;
      color: #a6adc8;
    }

    .features-section li::before {
      content: "- ";
      color: #6c7086;
    }

    footer {
      padding: 16px 24px;
      border-top: 1px solid #313244;
      text-align: center;
      font-size: 13px;
      color: #6c7086;
    }

    footer a {
      color: #89b4fa;
      text-decoration: none;
    }

    footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 600px) {
      header {
        padding: 12px 16px;
      }

      main {
        padding: 16px;
      }

      .line-numbers {
        display: none;
      }
    }
  `;
}
