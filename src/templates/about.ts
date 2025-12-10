import { FAVICON, renderHeader, renderFooter, getSharedStyles } from "./shared";

interface AboutPageProps {
  user?: { name: string; image?: string | null };
}

export function renderAboutPage({ user }: AboutPageProps = {}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>punt.sh - About</title>
  <meta name="description" content="Learn about punt.sh - why we built it, how it works, and the technology behind it.">
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
      max-width: 900px;
      margin: 0 auto;
      padding: 48px 24px;
    }

    /* Hero */
    .hero {
      text-align: center;
      margin-bottom: 64px;
    }

    .hero h1 {
      font-size: 36px;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #89b4fa 0%, #f5c2e7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero p {
      font-size: 18px;
      color: #a6adc8;
      font-family: system-ui, sans-serif;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Sections */
    .section {
      margin-bottom: 64px;
    }

    .section h2 {
      color: #89b4fa;
      font-size: 24px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section h2 .icon {
      font-size: 28px;
    }

    /* Story section */
    .story {
      font-family: system-ui, sans-serif;
      font-size: 16px;
      line-height: 1.8;
      color: #bac2de;
    }

    .story p {
      margin-bottom: 16px;
    }

    .story strong {
      color: #cdd6f4;
    }

    /* Features grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .feature-card {
      background: #181825;
      border: 1px solid #313244;
      border-radius: 12px;
      padding: 24px;
      transition: border-color 0.2s;
    }

    .feature-card:hover {
      border-color: #45475a;
    }

    .feature-card h3 {
      color: #cdd6f4;
      font-size: 16px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .feature-card h3 .icon {
      font-size: 20px;
    }

    .feature-card p {
      color: #a6adc8;
      font-size: 14px;
      font-family: system-ui, sans-serif;
      line-height: 1.6;
    }

    /* Comparison table */
    .comparison-wrapper {
      overflow-x: auto;
      margin: 24px 0;
    }

    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      background: #181825;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #313244;
      min-width: 500px;
    }

    .comparison-table th,
    .comparison-table td {
      padding: 16px 20px;
      text-align: left;
      border-bottom: 1px solid #313244;
    }

    .comparison-table th {
      background: #11111b;
      color: #89b4fa;
      font-weight: 600;
      font-size: 14px;
    }

    .comparison-table td {
      font-size: 14px;
      color: #cdd6f4;
    }

    .comparison-table tr:last-child td {
      border-bottom: none;
    }

    .comparison-table .label {
      color: #a6adc8;
    }

    .comparison-table .highlight {
      color: #a6e3a1;
      font-weight: 600;
    }

    /* Tech stack */
    .tech-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .tech-item {
      background: #181825;
      border: 1px solid #313244;
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tech-item .icon {
      font-size: 24px;
    }

    .tech-item .info h4 {
      color: #cdd6f4;
      font-size: 14px;
      margin-bottom: 2px;
    }

    .tech-item .info p {
      color: #6c7086;
      font-size: 12px;
      font-family: system-ui, sans-serif;
    }

    /* CTA */
    .cta {
      text-align: center;
      background: #181825;
      border: 1px solid #313244;
      border-radius: 16px;
      padding: 48px 32px;
    }

    .cta h2 {
      color: #cdd6f4;
      font-size: 24px;
      margin-bottom: 12px;
      justify-content: center;
    }

    .cta p {
      color: #a6adc8;
      font-size: 16px;
      font-family: system-ui, sans-serif;
      margin-bottom: 24px;
    }

    .cta-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 15px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #89b4fa 0%, #b4befe 100%);
      color: #1e1e2e;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(137, 180, 250, 0.3);
    }

    .btn-secondary {
      background: #313244;
      color: #cdd6f4;
      border: 1px solid #45475a;
    }

    .btn-secondary:hover {
      background: #45475a;
    }

    .btn svg {
      width: 18px;
      height: 18px;
    }

    /* Mobile */
    @media (max-width: 768px) {
      main {
        padding: 32px 16px;
      }

      .hero h1 {
        font-size: 28px;
      }

      .hero p {
        font-size: 16px;
      }

      .section {
        margin-bottom: 48px;
      }

      .section h2 {
        font-size: 20px;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .tech-grid {
        grid-template-columns: 1fr;
      }

      .cta {
        padding: 32px 20px;
      }

      .cta-buttons {
        flex-direction: column;
      }

      .btn {
        justify-content: center;
      }
    }
  </style>
</head>
<body>
  ${renderHeader({ activePage: 'about', user, callbackURL: '/about' })}

  <main>
    <section class="hero">
      <h1>Built for developers who share terminal output</h1>
      <p>Fast, ephemeral paste sharing with perfect ANSI color preservation. No account required, open source, and privacy-focused.</p>
    </section>

    <section class="section">
      <h2><span class="icon">💡</span> Why punt.sh?</h2>
      <div class="story">
        <p>We've all been there: you're debugging an issue with a teammate and need to share some terminal output. You paste it into Slack or Discord, and... the colors are gone. The formatting is mangled. The error message that was bright red is now indistinguishable from the rest.</p>
        <p><strong>punt.sh solves this.</strong> It preserves ANSI escape codes and renders them as styled HTML, so your terminal output looks exactly as intended. No more screenshots, no more lost context.</p>
        <p>Built with simplicity in mind: <strong>pipe any command to punt</strong>, get a shareable URL. Pastes expire automatically, keeping things clean. Sign in with GitHub for extended limits and paste management, or use it anonymously - your choice.</p>
      </div>
    </section>

    <section class="section">
      <h2><span class="icon">✨</span> Features</h2>
      <div class="features-grid">
        <div class="feature-card">
          <h3><span class="icon">🎨</span> ANSI Color Preservation</h3>
          <p>Terminal colors, bold, italic, and formatting are preserved exactly as they appear in your terminal. No more colorless pastes.</p>
        </div>
        <div class="feature-card">
          <h3><span class="icon">📝</span> Syntax Highlighting</h3>
          <p>66 programming languages supported with beautiful Catppuccin Mocha theme. Use <code>--lang</code> for code snippets instead of terminal output.</p>
        </div>
        <div class="feature-card">
          <h3><span class="icon">🔥</span> Burn After Read</h3>
          <p>Self-destructing pastes that delete themselves after being viewed once. Perfect for sensitive logs or one-time shares.</p>
        </div>
        <div class="feature-card">
          <h3><span class="icon">🔒</span> Private Pastes</h3>
          <p>Generate a view key that's required to access the paste. Share the key only with people who need to see it.</p>
        </div>
        <div class="feature-card">
          <h3><span class="icon">⏱️</span> Custom TTL</h3>
          <p>Set expiry from 1 minute to 30 days. Default is 24 hours - long enough to be useful, short enough to stay clean.</p>
        </div>
        <div class="feature-card">
          <h3><span class="icon">🖥️</span> CLI & API</h3>
          <p>Full-featured CLI tool or plain curl - use whatever fits your workflow. Comprehensive API with OpenAPI documentation.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <h2><span class="icon">👤</span> Why Sign In?</h2>
      <p style="color: #a6adc8; font-family: system-ui, sans-serif; margin-bottom: 20px;">Signing in with GitHub unlocks higher limits and paste management:</p>
      <div class="comparison-wrapper">
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
              <td class="label">Daily paste limit</td>
              <td>100 / day</td>
              <td class="highlight">1,000 / day</td>
            </tr>
            <tr>
              <td class="label">Maximum TTL</td>
              <td>7 days</td>
              <td class="highlight">30 days</td>
            </tr>
            <tr>
              <td class="label">Paste dashboard</td>
              <td>-</td>
              <td class="highlight">View & manage all pastes</td>
            </tr>
            <tr>
              <td class="label">Extend paste TTL</td>
              <td>-</td>
              <td class="highlight">+7 days anytime</td>
            </tr>
            <tr>
              <td class="label">API tokens</td>
              <td>-</td>
              <td class="highlight">Create & revoke tokens</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="section">
      <h2><span class="icon">🛠️</span> Tech Stack</h2>
      <div class="tech-grid">
        <div class="tech-item">
          <span class="icon">🥟</span>
          <div class="info">
            <h4>Bun</h4>
            <p>Fast JavaScript runtime</p>
          </div>
        </div>
        <div class="tech-item">
          <span class="icon">🦊</span>
          <div class="info">
            <h4>Elysia</h4>
            <p>TypeScript web framework</p>
          </div>
        </div>
        <div class="tech-item">
          <span class="icon">🗄️</span>
          <div class="info">
            <h4>SQLite / Turso</h4>
            <p>Database storage</p>
          </div>
        </div>
        <div class="tech-item">
          <span class="icon">✨</span>
          <div class="info">
            <h4>Shiki</h4>
            <p>Syntax highlighting</p>
          </div>
        </div>
        <div class="tech-item">
          <span class="icon">🐱</span>
          <div class="info">
            <h4>Catppuccin</h4>
            <p>Color theme</p>
          </div>
        </div>
        <div class="tech-item">
          <span class="icon">🔐</span>
          <div class="info">
            <h4>BetterAuth</h4>
            <p>Authentication</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta">
      <h2>Open Source</h2>
      <p>punt.sh is free, open source, and MIT licensed. Self-host it, contribute, or just check out the code.</p>
      <div class="cta-buttons">
        <a href="https://github.com/lance0/punt" class="btn btn-primary" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          View on GitHub
        </a>
        <a href="/docs" class="btn btn-secondary">
          Read the Docs
        </a>
      </div>
    </section>
  </main>

  ${renderFooter()}
</body>
</html>`;
}
