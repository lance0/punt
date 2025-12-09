const FAVICON = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ctext%20y%3D%22.9em%22%20font-size%3D%2290%22%3E%F0%9F%8F%88%3C%2Ftext%3E%3C%2Fsvg%3E';

interface DocsPageProps {
  user?: { name: string; image?: string | null };
}

export function renderDocsPage({ user }: DocsPageProps = {}): string {
  const baseUrl = process.env.BASE_URL ?? "https://punt.sh";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>punt.sh - Documentation</title>
  <meta name="description" content="How to use punt.sh - CLI installation, API usage, and FAQ">
  <link rel="icon" href="${FAVICON}">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'SF Mono', 'Consolas', monospace;
      background: #1e1e2e;
      color: #cdd6f4;
      min-height: 100vh;
      line-height: 1.6;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #313244;
      background: rgba(17, 17, 27, 0.5);
    }
    .logo {
      color: #89b4fa;
      text-decoration: none;
      font-size: 20px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo:hover { color: #b4befe; }
    .logo-icon { font-size: 24px; }
    nav { display: flex; gap: 16px; align-items: center; }
    nav a {
      color: #6c7086;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }
    nav a:hover { color: #cdd6f4; }
    nav a.active { color: #89b4fa; }
    .user-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: #313244;
      border-radius: 6px;
      color: #a6e3a1 !important;
    }
    .user-avatar { width: 20px; height: 20px; border-radius: 50%; }
    main {
      max-width: 800px;
      margin: 0 auto;
      padding: 48px 24px;
    }
    h1 {
      font-size: 32px;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #89b4fa 0%, #f5c2e7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .subtitle {
      color: #6c7086;
      margin-bottom: 48px;
      font-family: system-ui, sans-serif;
    }
    h2 {
      color: #89b4fa;
      font-size: 20px;
      margin: 48px 0 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #313244;
    }
    h2:first-of-type { margin-top: 0; }
    h3 {
      color: #f9e2af;
      font-size: 16px;
      margin: 24px 0 12px;
    }
    p {
      margin-bottom: 16px;
      font-family: system-ui, sans-serif;
    }
    pre {
      background: #181825;
      border: 1px solid #313244;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      margin-bottom: 16px;
      font-size: 13px;
    }
    code {
      font-family: 'SF Mono', 'Consolas', monospace;
    }
    .inline-code {
      background: #313244;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
    }
    .comment { color: #6c7086; }
    .flag { color: #f9e2af; }
    .url { color: #89b4fa; }
    ul, ol {
      margin-bottom: 16px;
      padding-left: 24px;
      font-family: system-ui, sans-serif;
    }
    li { margin-bottom: 8px; }
    .faq-item {
      background: #181825;
      border: 1px solid #313244;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .faq-q {
      color: #cdd6f4;
      font-weight: bold;
      margin-bottom: 8px;
      font-family: system-ui, sans-serif;
    }
    .faq-a {
      color: #a6adc8;
      font-family: system-ui, sans-serif;
    }
    .table-wrap {
      overflow-x: auto;
      margin-bottom: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #313244;
    }
    th {
      color: #89b4fa;
      font-weight: 600;
      background: #181825;
    }
    td code { color: #f9e2af; }
    .tip {
      background: rgba(166, 227, 161, 0.1);
      border: 1px solid #a6e3a1;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .tip-title {
      color: #a6e3a1;
      font-weight: bold;
      margin-bottom: 4px;
    }
    footer {
      padding: 24px;
      text-align: center;
      border-top: 1px solid #313244;
      color: #6c7086;
      font-size: 13px;
      font-family: system-ui, sans-serif;
    }
    footer a { color: #89b4fa; text-decoration: none; }
    footer a:hover { text-decoration: underline; }
    @media (max-width: 768px) {
      main { padding: 24px 16px; }
      h1 { font-size: 24px; }
      pre { font-size: 11px; padding: 12px; }
    }
  </style>
</head>
<body>
  <header>
    <a href="/" class="logo">
      <span class="logo-icon">🏈</span>
      punt.sh
    </a>
    <nav>
      <a href="/">Home</a>
      <a href="/docs" class="active">Docs</a>
      ${user ? `
        <a href="/me" class="user-link">
          ${user.image ? `<img src="${escapeHtml(user.image)}" alt="" class="user-avatar">` : ''}
          ${escapeHtml(user.name)}
        </a>
      ` : `
        <a href="/login/github?callbackURL=/docs">Sign in</a>
      `}
    </nav>
  </header>

  <main>
    <h1>Documentation</h1>
    <p class="subtitle">Everything you need to know about using punt.sh</p>

    <h2>Installation</h2>

    <h3>CLI (Recommended)</h3>
    <p>The CLI provides the best experience with colored output, progress indicators, and easy options.</p>
    <pre><code><span class="comment"># Install globally with npm</span>
npm install -g @lance0/punt

<span class="comment"># Or with Bun</span>
bun install -g @lance0/punt

<span class="comment"># Or run directly without installing</span>
npx @lance0/punt
bunx @lance0/punt</code></pre>

    <h3>No Installation (curl)</h3>
    <p>Works anywhere with curl - no installation needed.</p>
    <pre><code>command | curl -X POST --data-binary @- ${baseUrl}/api/paste</code></pre>

    <h2>Basic Usage</h2>

    <h3>Piping Output</h3>
    <pre><code><span class="comment"># CLI</span>
npm test 2>&1 | punt
docker logs myapp | punt
kubectl describe pod mypod | punt

<span class="comment"># curl</span>
npm test 2>&1 | curl -X POST --data-binary @- ${baseUrl}/api/paste</code></pre>

    <h3>Custom Expiry (TTL)</h3>
    <pre><code><span class="comment"># CLI</span>
command | punt <span class="flag">--ttl 1h</span>      <span class="comment"># 1 hour</span>
command | punt <span class="flag">--ttl 7d</span>      <span class="comment"># 7 days</span>

<span class="comment"># curl</span>
command | curl -H "X-TTL: 1h" -X POST --data-binary @- ${baseUrl}/api/paste</code></pre>

    <h3>Burn After Read</h3>
    <p>Paste is automatically deleted after being viewed once.</p>
    <pre><code><span class="comment"># CLI</span>
cat secret.txt | punt <span class="flag">--burn</span>

<span class="comment"># curl</span>
cat secret.txt | curl -H "X-Burn-After-Read: 1" -X POST --data-binary @- ${baseUrl}/api/paste</code></pre>

    <h3>Private Pastes</h3>
    <p>Generates a view key required to access the paste.</p>
    <pre><code><span class="comment"># CLI</span>
echo "secret" | punt <span class="flag">--private</span>

<span class="comment"># curl</span>
echo "secret" | curl -H "X-Private: 1" -X POST --data-binary @- ${baseUrl}/api/paste</code></pre>

    <h2>CLI Commands</h2>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>punt</code></td>
            <td>Create paste from stdin</td>
          </tr>
          <tr>
            <td><code>punt --ttl &lt;duration&gt;</code></td>
            <td>Set expiry time (e.g., 30m, 2h, 7d)</td>
          </tr>
          <tr>
            <td><code>punt --burn</code></td>
            <td>Delete after first view</td>
          </tr>
          <tr>
            <td><code>punt --private</code></td>
            <td>Require view key to access</td>
          </tr>
          <tr>
            <td><code>punt --cat &lt;id&gt;</code></td>
            <td>Fetch and print paste content</td>
          </tr>
          <tr>
            <td><code>punt --show &lt;id&gt;</code></td>
            <td>Open paste in browser</td>
          </tr>
          <tr>
            <td><code>punt --delete &lt;id&gt; &lt;key&gt;</code></td>
            <td>Delete a paste</td>
          </tr>
          <tr>
            <td><code>punt login</code></td>
            <td>Sign in with GitHub</td>
          </tr>
          <tr>
            <td><code>punt logout</code></td>
            <td>Sign out</td>
          </tr>
          <tr>
            <td><code>punt whoami</code></td>
            <td>Show current user</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>API Reference</h2>

    <h3>Create Paste</h3>
    <pre><code>POST /api/paste
Content-Type: text/plain

<span class="comment"># Headers (all optional):</span>
X-TTL: 1h              <span class="comment"># Expiry time</span>
X-Burn-After-Read: 1   <span class="comment"># Delete after view</span>
X-Private: 1           <span class="comment"># Require view key</span>
Authorization: Bearer punt_xxx  <span class="comment"># API token</span></code></pre>

    <h3>Get Paste</h3>
    <pre><code>GET /:id          <span class="comment"># HTML view</span>
GET /:id/raw      <span class="comment"># Raw content</span>
GET /:id?key=xxx  <span class="comment"># Private paste with key</span></code></pre>

    <h3>Delete Paste</h3>
    <pre><code>DELETE /api/paste/:id/:deleteKey</code></pre>

    <h2>Authenticated Users</h2>

    <div class="tip">
      <div class="tip-title">Benefits of signing in</div>
      <ul style="margin-bottom: 0;">
        <li>Extended TTL: up to 30 days (vs 7 days anonymous)</li>
        <li>Higher rate limits: 1000/day (vs 100/day)</li>
        <li>Manage your pastes from the dashboard</li>
        <li>Create and revoke API tokens</li>
      </ul>
    </div>

    <pre><code><span class="comment"># Sign in via CLI</span>
punt login

<span class="comment"># Check who you're logged in as</span>
punt whoami

<span class="comment"># All pastes created while logged in are linked to your account</span>
docker logs myapp | punt --ttl 30d</code></pre>

    <h2>FAQ</h2>

    <div class="faq-item">
      <div class="faq-q">How long do pastes last?</div>
      <div class="faq-a">Default is 24 hours. Anonymous users can set up to 7 days, authenticated users up to 30 days.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">What's the maximum paste size?</div>
      <div class="faq-a">4 MB per paste.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">Are pastes encrypted?</div>
      <div class="faq-a">Pastes are transmitted over HTTPS. Private pastes require a key to view, but content is not end-to-end encrypted. Don't paste sensitive secrets like passwords or API keys.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">What's the rate limit?</div>
      <div class="faq-a">Anonymous: 100 pastes/day per IP. Authenticated: 1000 pastes/day.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">Can I delete a paste?</div>
      <div class="faq-a">Yes! Each paste comes with a delete key. Use <code class="inline-code">punt --delete &lt;id&gt; &lt;key&gt;</code> or the dashboard if logged in.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">Why are ANSI colors preserved?</div>
      <div class="faq-a">punt.sh renders ANSI escape codes as colored HTML, so your terminal output looks exactly as intended.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">Can I self-host punt.sh?</div>
      <div class="faq-a">Yes! It's open source. Check the <a href="https://github.com/lance0/punt">GitHub repo</a> for deployment instructions.</div>
    </div>

  </main>

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
