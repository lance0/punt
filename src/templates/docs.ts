import { FAVICON, renderHeader, renderFooter, getSharedStyles } from "./shared";

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
      font-family: 'SF Mono', 'Menlo', 'Consolas', 'Monaco', monospace;
      background: #1e1e2e;
      color: #cdd6f4;
      min-height: 100vh;
      line-height: 1.6;
    }
    ${getSharedStyles()}
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
      font-family: 'SF Mono', 'Menlo', 'Consolas', 'Monaco', monospace;
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
    .json-key { color: #89b4fa; }
    .json-string { color: #a6e3a1; }
    .json-number { color: #fab387; }
    ul, ol {
      margin-bottom: 16px;
      padding-left: 24px;
      font-family: system-ui, sans-serif;
    }
    li { margin-bottom: 8px; }
    a { color: #89b4fa; }
    a:hover { text-decoration: underline; }
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
    .faq-a code {
      background: #313244;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
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
    .comparison-table {
      background: #181825;
      border: 1px solid #313244;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .comparison-table th {
      background: #11111b;
    }
    .comparison-table tr:last-child td {
      border-bottom: none;
    }
    .comparison-table .highlight {
      color: #a6e3a1;
      font-weight: 600;
    }
    .comparison-table .dim {
      color: #6c7086;
    }
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
    .info-box {
      background: rgba(137, 180, 250, 0.1);
      border: 1px solid #89b4fa;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .info-box-title {
      color: #89b4fa;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .swagger-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #313244;
      color: #cdd6f4;
      padding: 12px 20px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 14px;
      border: 1px solid #45475a;
      transition: all 0.2s;
      margin-bottom: 16px;
    }
    .swagger-link:hover {
      background: #45475a;
      text-decoration: none;
    }
    .lang-list-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #313244;
      color: #cdd6f4;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      border: 1px solid #45475a;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      margin-top: 8px;
    }
    .lang-list-btn:hover {
      background: #45475a;
    }
    .lang-modal {
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
      padding: 20px;
    }
    .lang-modal.show {
      display: flex;
    }
    .lang-modal-content {
      background: #181825;
      border: 1px solid #313244;
      border-radius: 16px;
      padding: 32px;
      max-width: 800px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }
    .lang-modal-content h3 {
      color: #cdd6f4;
      font-size: 20px;
      margin-bottom: 8px;
    }
    .lang-modal-subtitle {
      color: #6c7086;
      font-size: 13px;
      margin-bottom: 24px;
      font-family: system-ui, sans-serif;
    }
    .lang-categories {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }
    .lang-category h4 {
      color: #89b4fa;
      font-size: 14px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #313244;
    }
    .lang-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .lang-item {
      font-size: 13px;
      color: #cdd6f4;
    }
    .lang-item code {
      color: #6c7086;
      font-size: 11px;
      margin-left: 4px;
    }
    .lang-modal-close {
      display: block;
      width: 100%;
      background: #313244;
      color: #cdd6f4;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #45475a;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
      transition: background 0.2s;
    }
    .lang-modal-close:hover {
      background: #45475a;
    }
    @media (max-width: 768px) {
      main { padding: 24px 16px; }
      h1 { font-size: 24px; }
      pre { font-size: 11px; padding: 12px; }
      .lang-modal-content {
        padding: 20px;
        max-height: 90vh;
      }
      .lang-categories {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  ${renderHeader({ activePage: 'docs', user, callbackURL: '/docs' })}

  <main>
    <h1>Documentation</h1>
    <p class="subtitle">Everything you need to know about using punt.sh</p>

    <h2>Quick Start</h2>

    <h3>CLI (Recommended)</h3>
    <p>The CLI provides the best experience with colored output, progress indicators, and easy options.</p>
    <pre><code><span class="comment"># Install globally</span>
npm install -g @lance0/punt    <span class="comment"># or: bun install -g @lance0/punt</span>

<span class="comment"># Share a file (auto-detects language for syntax highlighting)</span>
punt src/index.ts
punt config.yaml

<span class="comment"># Or pipe command output (preserves ANSI colors)</span>
npm test 2>&1 | punt
docker logs myapp | punt</code></pre>

    <h3>No Installation (curl)</h3>
    <p>Works anywhere with curl - no installation needed.</p>
    <pre><code>command | curl -X POST --data-binary @- ${baseUrl}/api/paste</code></pre>

    <h2>Why Sign In?</h2>
    <p>punt.sh works great without an account, but signing in with GitHub unlocks higher limits and paste management.</p>

    <div class="table-wrap">
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Feature</th>
            <th>Anonymous</th>
            <th>Signed In</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Daily paste limit</td>
            <td class="dim">100 / day</td>
            <td class="highlight">1,000 / day</td>
          </tr>
          <tr>
            <td>Maximum TTL</td>
            <td class="dim">7 days</td>
            <td class="highlight">30 days</td>
          </tr>
          <tr>
            <td>Paste dashboard</td>
            <td class="dim">-</td>
            <td class="highlight">View & manage all pastes</td>
          </tr>
          <tr>
            <td>Extend paste TTL</td>
            <td class="dim">-</td>
            <td class="highlight">+7 days anytime</td>
          </tr>
          <tr>
            <td>API tokens</td>
            <td class="dim">-</td>
            <td class="highlight">Create & revoke tokens</td>
          </tr>
          <tr>
            <td>Delete pastes</td>
            <td class="dim">With delete key only</td>
            <td class="highlight">From dashboard</td>
          </tr>
        </tbody>
      </table>
    </div>

    <pre><code><span class="comment"># Sign in via CLI</span>
punt login

<span class="comment"># Check who you're logged in as</span>
punt whoami

<span class="comment"># All pastes created while logged in are linked to your account</span>
docker logs myapp | punt --ttl 30d</code></pre>

    <h2>Features</h2>

    <h3>ANSI Color Preservation</h3>
    <p>By default, punt.sh preserves terminal colors. ANSI escape codes are rendered as styled HTML, so your terminal output looks exactly as intended - no more colorless pastes in Slack or Discord.</p>
    <pre><code><span class="comment"># Just pipe any command - colors are preserved automatically</span>
npm test 2>&1 | punt
docker logs myapp | punt
kubectl describe pod mypod | punt</code></pre>

    <h3>Syntax Highlighting</h3>
    <p>For code snippets (not terminal output), use the <code class="inline-code">--lang</code> flag to enable syntax highlighting with 66 supported languages.</p>

    <h4 style="color: #f9e2af; font-size: 14px; margin: 20px 0 12px;">Auto-Detection</h4>
    <p>Pass a file directly and punt auto-detects the language from the extension:</p>
    <pre><code><span class="comment"># Direct file argument (recommended) - auto-detects language</span>
punt src/index.ts                <span class="comment"># Detects TypeScript</span>
punt script.py                   <span class="comment"># Detects Python</span>
punt config.yaml                 <span class="comment"># Detects YAML</span>

<span class="comment"># Or pipe content - specify language explicitly for stdin</span>
docker logs myapp | punt <span class="flag">--lang json</span>
kubectl get pods -o yaml | punt <span class="flag">--lang yaml</span></code></pre>

    <h4 style="color: #f9e2af; font-size: 14px; margin: 20px 0 12px;">Language Aliases</h4>
    <p>Use short aliases for common languages:</p>
    <pre><code>cat app.js | punt <span class="flag">--lang js</span>       <span class="comment"># javascript</span>
cat index.ts | punt <span class="flag">--lang ts</span>     <span class="comment"># typescript</span>
cat script.py | punt <span class="flag">--lang py</span>    <span class="comment"># python</span>
cat main.rs | punt <span class="flag">--lang rs</span>      <span class="comment"># rust</span>
cat run.sh | punt <span class="flag">--lang sh</span>       <span class="comment"># bash</span>
cat config.yml | punt <span class="flag">--lang yml</span>  <span class="comment"># yaml</span></code></pre>

    <button class="lang-list-btn" onclick="showLanguages()">View all 66 supported languages</button>

    <div class="tip" style="margin-top: 16px;">
      <div class="tip-title">ANSI vs Syntax Highlighting</div>
      <ul style="margin-bottom: 0;">
        <li><strong>Use default (ANSI):</strong> Terminal output, logs, test results, command output</li>
        <li><strong>Use --lang:</strong> Source code files, config files, snippets without ANSI colors</li>
        <li><strong>Use --lang ansi:</strong> Explicitly force ANSI rendering if auto-detect picks wrong language</li>
      </ul>
    </div>

    <h3>Burn After Read</h3>
    <p>Self-destructing pastes that are automatically deleted after being viewed once. Perfect for sensitive logs or one-time shares.</p>
    <pre><code><span class="comment"># CLI</span>
cat secret.txt | punt <span class="flag">--burn</span>

<span class="comment"># curl</span>
cat secret.txt | curl -H "X-Burn-After-Read: 1" -X POST --data-binary @- ${baseUrl}/api/paste</code></pre>

    <h3>Private Pastes</h3>
    <p>Generates a view key that's required to access the paste. Share the key only with people who need to see it.</p>
    <pre><code><span class="comment"># CLI - returns URL with ?key=xxx appended</span>
echo "secret" | punt <span class="flag">--private</span>

<span class="comment"># curl</span>
echo "secret" | curl -H "X-Private: 1" -X POST --data-binary @- ${baseUrl}/api/paste</code></pre>

    <h3>Custom TTL</h3>
    <p>Set how long your paste lives. Default is 24 hours.</p>
    <pre><code><span class="comment"># TTL format: number + unit (m=minutes, h=hours, d=days)</span>
command | punt <span class="flag">--ttl 30m</span>     <span class="comment"># 30 minutes</span>
command | punt <span class="flag">--ttl 2h</span>      <span class="comment"># 2 hours</span>
command | punt <span class="flag">--ttl 7d</span>      <span class="comment"># 7 days (max for anonymous)</span>
command | punt <span class="flag">--ttl 30d</span>     <span class="comment"># 30 days (requires sign in)</span>

<span class="comment"># curl</span>
command | curl -H "X-TTL: 1h" -X POST --data-binary @- ${baseUrl}/api/paste</code></pre>

    <h2>CLI Reference</h2>

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
            <td><code>punt &lt;file&gt;</code></td>
            <td>Create paste from file (auto-detects language)</td>
          </tr>
          <tr>
            <td><code>command | punt</code></td>
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
            <td><code>punt --lang &lt;language&gt;</code></td>
            <td>Enable syntax highlighting</td>
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

    <div class="info-box">
      <div class="info-box-title">OpenAPI Documentation</div>
      <p style="margin-bottom: 12px;">For complete API documentation including all request/response schemas, see our interactive OpenAPI docs.</p>
      <a href="/swagger" class="swagger-link">View OpenAPI Documentation</a>
    </div>

    <h3>Create Paste</h3>
    <pre><code>POST /api/paste
Content-Type: text/plain

<span class="comment"># Headers (all optional):</span>
X-TTL: 1h              <span class="comment"># Expiry time (30m, 2h, 7d, etc.)</span>
X-Burn-After-Read: 1   <span class="comment"># Delete after first view</span>
X-Private: 1           <span class="comment"># Require view key</span>
X-Language: typescript <span class="comment"># Syntax highlighting language</span>
Authorization: Bearer punt_xxx  <span class="comment"># API token (optional)</span></code></pre>

    <h3>Response</h3>
    <pre><code>🏈 Punted!

   URL  ${baseUrl}/abc123
   Raw  ${baseUrl}/abc123/raw
   Expires in 24h
   Delete key: xyz789abc</code></pre>

    <p>Response headers include:</p>
    <pre><code>X-Paste-Id: abc123
X-Delete-Key: xyz789abc
X-RateLimit-Remaining: 99
X-Language: typescript  <span class="comment">// if syntax highlighting was used</span></code></pre>

    <h3>Get Paste</h3>
    <pre><code>GET /:id          <span class="comment"># HTML view with syntax highlighting</span>
GET /:id/raw      <span class="comment"># Raw content (original text)</span>
GET /:id?key=xxx  <span class="comment"># Private paste with view key</span></code></pre>

    <h3>Delete Paste</h3>
    <pre><code>DELETE /api/paste/:id/:deleteKey

<span class="comment"># Response</span>
{
  <span class="json-key">"success"</span>: true,
  <span class="json-key">"message"</span>: <span class="json-string">"Paste deleted"</span>
}</code></pre>

    <h3>Example: Create Paste with curl</h3>
    <pre><code><span class="comment"># Create a paste</span>
$ echo "Hello, World!" | curl -X POST --data-binary @- ${baseUrl}/api/paste

🏈 Punted!

   URL  ${baseUrl}/abc123
   Raw  ${baseUrl}/abc123/raw
   Expires in 24h
   Delete key: xyz789abc

<span class="comment"># Delete the paste using the delete key</span>
$ curl -X DELETE ${baseUrl}/api/paste/abc123/xyz789abc</code></pre>

    <h2>Rate Limits</h2>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>User Type</th>
            <th>Limit</th>
            <th>Window</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Anonymous</td>
            <td>100 pastes</td>
            <td>Per day, per IP</td>
          </tr>
          <tr>
            <td>Authenticated</td>
            <td>1,000 pastes</td>
            <td>Per day, per user</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p>Rate limit headers are included in API responses:</p>
    <pre><code>X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705315200</code></pre>

    <h2>FAQ</h2>

    <div class="faq-item">
      <div class="faq-q">How long do pastes last?</div>
      <div class="faq-a">Default is 24 hours. Anonymous users can set up to 7 days, authenticated users up to 30 days. Authenticated users can also extend their pastes by +7 days from the dashboard.</div>
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
      <div class="faq-a">Anonymous: 100 pastes/day per IP. Authenticated: 1,000 pastes/day. <a href="#rate-limits">See details above.</a></div>
    </div>

    <div class="faq-item">
      <div class="faq-q">Can I delete a paste?</div>
      <div class="faq-a">Yes! Each paste comes with a delete key. Use <code>punt --delete &lt;id&gt; &lt;key&gt;</code> or the dashboard if logged in.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">Why are ANSI colors preserved?</div>
      <div class="faq-a">punt.sh renders ANSI escape codes as colored HTML, so your terminal output looks exactly as intended - no more sharing screenshots or losing formatting.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">Where's the full API documentation?</div>
      <div class="faq-a">Visit <a href="/swagger">/swagger</a> for interactive OpenAPI documentation with all endpoints, schemas, and the ability to try requests directly.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">How do I report abuse?</div>
      <div class="faq-a">Report abusive content by emailing the paste URL to <a href="mailto:lance@lance0.com">lance@lance0.com</a> or opening an issue on <a href="https://github.com/lance0/punt">GitHub</a>.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">Can I self-host punt.sh?</div>
      <div class="faq-a">Yes! It's open source under MIT license. Check the <a href="https://github.com/lance0/punt">GitHub repo</a> for deployment instructions.</div>
    </div>

  </main>

  <!-- Language Modal -->
  <div id="lang-modal" class="lang-modal" onclick="closeLangModal()">
    <div class="lang-modal-content" onclick="event.stopPropagation()">
      <h3>Supported Languages</h3>
      <p class="lang-modal-subtitle">Aliases shown in parentheses. Use with --lang flag or X-Language header.</p>
      <div class="lang-categories">
        <div class="lang-category">
          <h4>Web</h4>
          <div class="lang-list">
            <span class="lang-item">javascript <code>js</code></span>
            <span class="lang-item">typescript <code>ts</code></span>
            <span class="lang-item">html</span>
            <span class="lang-item">css</span>
            <span class="lang-item">json</span>
            <span class="lang-item">jsx</span>
            <span class="lang-item">tsx</span>
            <span class="lang-item">vue</span>
            <span class="lang-item">svelte</span>
            <span class="lang-item">astro</span>
          </div>
        </div>
        <div class="lang-category">
          <h4>Backend</h4>
          <div class="lang-list">
            <span class="lang-item">python <code>py</code></span>
            <span class="lang-item">ruby <code>rb</code></span>
            <span class="lang-item">php</span>
            <span class="lang-item">go</span>
            <span class="lang-item">rust <code>rs</code></span>
            <span class="lang-item">java</span>
            <span class="lang-item">kotlin <code>kt</code></span>
            <span class="lang-item">scala</span>
            <span class="lang-item">swift</span>
            <span class="lang-item">c</span>
            <span class="lang-item">cpp <code>c++</code></span>
            <span class="lang-item">csharp <code>cs, c#</code></span>
          </div>
        </div>
        <div class="lang-category">
          <h4>Shell & Config</h4>
          <div class="lang-list">
            <span class="lang-item">bash <code>sh</code></span>
            <span class="lang-item">shell</span>
            <span class="lang-item">zsh</span>
            <span class="lang-item">fish</span>
            <span class="lang-item">powershell <code>ps1</code></span>
            <span class="lang-item">dockerfile</span>
            <span class="lang-item">yaml <code>yml</code></span>
            <span class="lang-item">toml</span>
            <span class="lang-item">ini</span>
            <span class="lang-item">nginx</span>
          </div>
        </div>
        <div class="lang-category">
          <h4>Data & Query</h4>
          <div class="lang-list">
            <span class="lang-item">sql</span>
            <span class="lang-item">graphql</span>
            <span class="lang-item">prisma</span>
          </div>
        </div>
        <div class="lang-category">
          <h4>Markup & Docs</h4>
          <div class="lang-list">
            <span class="lang-item">markdown <code>md</code></span>
            <span class="lang-item">mdx</span>
            <span class="lang-item">latex</span>
            <span class="lang-item">xml</span>
          </div>
        </div>
        <div class="lang-category">
          <h4>Other</h4>
          <div class="lang-list">
            <span class="lang-item">lua</span>
            <span class="lang-item">perl</span>
            <span class="lang-item">r</span>
            <span class="lang-item">elixir <code>ex</code></span>
            <span class="lang-item">erlang</span>
            <span class="lang-item">haskell <code>hs</code></span>
            <span class="lang-item">ocaml <code>ml</code></span>
            <span class="lang-item">clojure <code>clj</code></span>
            <span class="lang-item">lisp</span>
            <span class="lang-item">zig</span>
            <span class="lang-item">nim</span>
            <span class="lang-item">v</span>
            <span class="lang-item">diff</span>
            <span class="lang-item">makefile</span>
            <span class="lang-item">cmake</span>
            <span class="lang-item">regex</span>
          </div>
        </div>
      </div>
      <button class="lang-modal-close" onclick="closeLangModal()">Close</button>
    </div>
  </div>

  <script>
    function showLanguages() {
      document.getElementById('lang-modal').classList.add('show');
    }
    function closeLangModal() {
      document.getElementById('lang-modal').classList.remove('show');
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLangModal();
    });
  </script>

  ${renderFooter()}
</body>
</html>`;
}
