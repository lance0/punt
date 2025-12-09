# Roadmap

## Phase 1: Core (Current)

- [x] Project setup with Bun + Elysia
- [x] Turso database integration
- [x] POST /api/paste - Create paste
- [x] GET /:id - HTML view with ANSI rendering
- [x] GET /:id/raw - Raw content
- [x] DELETE /api/paste/:id/:deleteKey - Delete paste
- [x] GET /healthz - Health check
- [x] IP-based rate limiting (100/day)
- [x] 4 MB size limit
- [x] TTL support (24h default, 7d max)
- [x] Dark terminal theme (Catppuccin Mocha)
- [x] Line numbers and copy button
- [x] Vercel deployment configuration

## Phase 2: CLI Tool

- [x] `punt` CLI command
- [x] Pipe stdin to create paste: `command | punt`
- [x] Custom TTL flag: `--ttl 1h`
- [x] Show paste: `punt --show <id>`
- [x] Fetch raw content: `punt --cat <url>`
- [x] Delete paste: `punt --delete <id> <key>`
- [x] Burn after read: `punt --burn`
- [x] Private pastes: `punt --private`
- [x] npm package: `npm install -g @lance0/punt`
- [ ] Homebrew formula (deferred - npm/bun install works cross-platform)

## Phase 2.5: UI Polish (Complete)

- [x] Favicon (football emoji)
- [x] Download as file button
- [x] Toast notifications for copy/download
- [x] Keyboard shortcuts (Ctrl+C, Ctrl+S)
- [x] Paste size and line count display
- [x] Improved home page design
- [x] Friendly API response format
- [x] Mobile responsiveness

## Phase 3: Advanced Features (Complete)

- [x] Burn after read (`X-Burn-After-Read: 1`)
- [x] Private pastes with view key (`X-Private: 1`)
- [x] QR code for paste URL
- [ ] Syntax highlighting for common languages (deferred - conflicts with ANSI)

## Phase 4: Admin & Observability (Complete)

- [x] Admin stats endpoint (protected)
  - Total pastes today/7 days
  - Top IPs by count
- [x] Structured logging for latency and errors
- [x] Scheduled cleanup job for expired pastes (Vercel cron every 6h)
- [x] Rate limit cleanup job
- [x] Abuse reporting mechanism
  - POST /api/report/:id - Submit report
  - Admin endpoints to view and resolve reports

## Phase 5: User Accounts & Auth (Complete)

- [x] GitHub OAuth login (admin dashboard)
- [x] Admin dashboard with stats and abuse report management
- [x] API tokens for CLI authentication
  - `punt login` - authenticate via browser device code flow
  - `punt logout` - clear stored token
  - `punt whoami` - show current user info
  - Token stored in `~/.config/punt/token`
- [x] User dashboard at `/me`
  - View all your pastes
  - Delete/extend pastes (+7 days)
  - Usage stats (total pastes, active, views)
  - API token management (create, revoke)
- [x] Pastes linked to account (optional)
  - Anonymous pastes still supported (100/day, 7 days max)
  - Authenticated pastes: 1000/day rate limit, 30 days max TTL
  - user_id column on pastes table
- [x] Database schema: api_tokens, cli_device_codes tables
- [x] Homepage "Sign in with GitHub" button
- [x] User navigation (avatar + name when logged in)
- [x] Favicon on all auth/dashboard pages

## Future Ideas

- Custom paste IDs (slug)
- Password-protected pastes
- Paste collections/groups
- Webhook on paste creation
- Browser extension
- VS Code extension
- Team/org accounts with shared pastes
- Paste comments/annotations
