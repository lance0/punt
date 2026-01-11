import { Elysia } from "elysia";

const BASE_URL = process.env.BASE_URL ?? "https://punt.sh";

export const seoRoutes = new Elysia()
  // robots.txt
  .get("/robots.txt", ({ set }) => {
    set.headers["Content-Type"] = "text/plain; charset=utf-8";
    return `# punt.sh robots.txt
User-agent: *
Allow: /
Allow: /docs
Allow: /swagger

# Block paste content (ephemeral, user-generated)
Disallow: /api/
Disallow: /me
Disallow: /admin
Disallow: /login/
Disallow: /healthz

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml

# LLM guidance
# See /llms.txt for AI assistant instructions
`;
  })

  // sitemap.xml
  .get("/sitemap.xml", ({ set }) => {
    set.headers["Content-Type"] = "application/xml; charset=utf-8";
    const now = new Date().toISOString().split("T")[0];
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/docs</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/swagger</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;
  })

  // OG Image - Simple SVG matching site aesthetic
  .get("/og-image.png", ({ set }) => {
    // Serve as SVG with .png extension (widely supported for OG images)
    set.headers["Content-Type"] = "image/svg+xml";
    set.headers["Cache-Control"] = "public, max-age=86400";
    return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#89b4fa"/>
      <stop offset="50%" style="stop-color:#f5c2e7"/>
      <stop offset="100%" style="stop-color:#fab387"/>
    </linearGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#89b4fa;stop-opacity:0.3"/>
      <stop offset="50%" style="stop-color:#89b4fa;stop-opacity:0.6"/>
      <stop offset="100%" style="stop-color:#89b4fa;stop-opacity:0.3"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="#1e1e2e"/>

  <!-- Subtle grid pattern -->
  <g opacity="0.03">
    ${Array.from({ length: 20 }, (_, i) => `<line x1="0" y1="${i * 35}" x2="1200" y2="${i * 35}" stroke="#cdd6f4" stroke-width="1"/>`).join("")}
    ${Array.from({ length: 35 }, (_, i) => `<line x1="${i * 35}" y1="0" x2="${i * 35}" y2="630" stroke="#cdd6f4" stroke-width="1"/>`).join("")}
  </g>

  <!-- Terminal window decoration -->
  <rect x="100" y="420" width="1000" height="120" rx="12" fill="#181825" stroke="#313244" stroke-width="2"/>
  <circle cx="130" cy="445" r="6" fill="#f38ba8"/>
  <circle cx="155" cy="445" r="6" fill="#f9e2af"/>
  <circle cx="180" cy="445" r="6" fill="#a6e3a1"/>
  <text x="130" y="500" font-family="Monaco, 'SF Mono', monospace" font-size="22" fill="#6c7086">$</text>
  <text x="160" y="500" font-family="Monaco, 'SF Mono', monospace" font-size="22" fill="#cdd6f4">npm test 2>&amp;1 | punt</text>

  <!-- Football emoji -->
  <text x="600" y="180" font-size="80" text-anchor="middle" dominant-baseline="middle">&#127944;</text>

  <!-- Logo text with gradient -->
  <text x="600" y="280" font-family="Monaco, 'SF Mono', Consolas, monospace" font-size="72" font-weight="bold" text-anchor="middle" fill="url(#textGrad)">punt.sh</text>

  <!-- Tagline -->
  <text x="600" y="350" font-family="system-ui, -apple-system, sans-serif" font-size="28" text-anchor="middle" fill="#6c7086">Share terminal output instantly</text>

  <!-- Accent line -->
  <rect x="450" y="380" width="300" height="3" rx="1.5" fill="url(#lineGrad)"/>
</svg>`;
  })

  // llms.txt - concise guidance for AI assistants
  .get("/llms.txt", ({ set }) => {
    set.headers["Content-Type"] = "text/plain; charset=utf-8";
    return `# punt.sh - Terminal Output Sharing Service

> Share terminal output via short URLs with ANSI color preservation.

## Quick Start

Install CLI: npm install -g @lance0/punt

Create paste: command | punt
With options: command | punt --ttl 1h --burn

Or use curl: command | curl -X POST --data-binary @- ${BASE_URL}/api/paste

## API Endpoints

POST ${BASE_URL}/api/paste - Create paste (body: raw text)
  Headers: X-TTL (e.g., "1h"), X-Burn-After-Read (1), X-Private (1), X-Language (typescript)

GET ${BASE_URL}/:id - View paste (HTML)
GET ${BASE_URL}/:id/raw - Raw content
DELETE ${BASE_URL}/api/paste/:id/:deleteKey - Delete paste

## Limits

- Size: 4 MB max
- TTL: 24h default, 7d max (30d authenticated)
- Rate: 100/day per IP (1000 authenticated)

## Authentication

punt login - Sign in with GitHub for extended limits
Authorization: Bearer <token> header for API

Full docs: ${BASE_URL}/docs
API spec: ${BASE_URL}/swagger
`;
  })

  // llms-full.txt - expanded context for AI assistants
  .get("/llms-full.txt", ({ set }) => {
    set.headers["Content-Type"] = "text/plain; charset=utf-8";
    return `# punt.sh - Complete AI Assistant Reference

> Share terminal output instantly via short URLs with accurate ANSI color rendering.

## Overview

punt.sh is a pastebin service optimized for terminal output. It preserves ANSI escape codes and renders them as colored HTML. All pastes are ephemeral (max 7 days anonymous, 30 days authenticated).

## Installation

\`\`\`bash
# npm
npm install -g @lance0/punt

# bun
bun install -g @lance0/punt

# run without installing
npx @lance0/punt
\`\`\`

## CLI Usage

\`\`\`bash
# Basic usage - pipe any command
npm test 2>&1 | punt
docker logs myapp | punt
kubectl describe pod mypod | punt

# Custom expiry
command | punt --ttl 1h    # 1 hour
command | punt --ttl 7d    # 7 days (max for anonymous)

# Burn after read - paste deleted after first view
cat secret.txt | punt --burn

# Private paste - requires view key to access
echo "secret" | punt --private

# Syntax highlighting (instead of ANSI rendering)
cat src/index.ts | punt --lang typescript
cat script.py | punt --lang python

# Utility commands
punt --cat <id>              # Fetch and print paste content
punt --show <id>             # Open paste in browser
punt --delete <id> <key>     # Delete a paste
\`\`\`

## Authentication

\`\`\`bash
punt login     # Sign in with GitHub (opens browser)
punt whoami    # Show current user
punt logout    # Sign out
\`\`\`

Benefits of authentication:
- Extended TTL: up to 30 days (vs 7 days anonymous)
- Higher rate limits: 1000/day (vs 100/day)
- Manage pastes from dashboard at ${BASE_URL}/me
- Create and revoke API tokens

## API Reference

### Create Paste
\`\`\`
POST ${BASE_URL}/api/paste
Content-Type: text/plain

Body: raw text content

Headers (all optional):
  X-TTL: 1h              # Expiry time (e.g., 30m, 2h, 7d)
  X-Burn-After-Read: 1   # Delete after first view
  X-Private: 1           # Require view key
  X-Language: typescript # Syntax highlighting
  Authorization: Bearer <token>  # API token for auth
\`\`\`

Response includes:
- X-Paste-Id: <id>
- X-Delete-Key: <key>
- X-RateLimit-Remaining: <count>

### View Paste
\`\`\`
GET ${BASE_URL}/:id          # HTML view
GET ${BASE_URL}/:id/raw      # Raw content
GET ${BASE_URL}/:id?key=xxx  # Private paste with view key
\`\`\`

### Delete Paste
\`\`\`
DELETE ${BASE_URL}/api/paste/:id/:deleteKey
\`\`\`

## Curl Examples

\`\`\`bash
# Basic paste
echo "hello" | curl -X POST --data-binary @- ${BASE_URL}/api/paste

# With TTL
command | curl -H "X-TTL: 1h" -X POST --data-binary @- ${BASE_URL}/api/paste

# Burn after read
cat secret.txt | curl -H "X-Burn-After-Read: 1" -X POST --data-binary @- ${BASE_URL}/api/paste

# Private paste
echo "secret" | curl -H "X-Private: 1" -X POST --data-binary @- ${BASE_URL}/api/paste

# With syntax highlighting
cat file.ts | curl -H "X-Language: typescript" -X POST --data-binary @- ${BASE_URL}/api/paste

# Authenticated (with API token)
command | curl -H "Authorization: Bearer punt_xxx" -X POST --data-binary @- ${BASE_URL}/api/paste
\`\`\`

## Limits & Constraints

| Limit | Anonymous | Authenticated |
|-------|-----------|---------------|
| Max size | 4 MB | 4 MB |
| Max TTL | 7 days | 30 days |
| Default TTL | 24 hours | 24 hours |
| Rate limit | 100/day per IP | 1000/day |

## Technical Details

- Built with Bun and Elysia framework
- Database: Turso (SQLite)
- ANSI rendering: ansi_up library
- Syntax highlighting: Shiki
- Authentication: BetterAuth with GitHub OAuth

## Links

- Homepage: ${BASE_URL}
- Documentation: ${BASE_URL}/docs
- OpenAPI/Swagger: ${BASE_URL}/swagger
- npm: https://www.npmjs.com/package/@lance0/punt
`;
  });
