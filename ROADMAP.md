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
- [ ] npm package: `npm install -g punt-cli`
- [ ] Homebrew formula

## Phase 2.5: UI Polish (Complete)

- [x] Favicon (football emoji)
- [x] Download as file button
- [x] Toast notifications for copy/download
- [x] Keyboard shortcuts (Ctrl+C, Ctrl+S)
- [x] Paste size and line count display
- [x] Improved home page design
- [x] Friendly API response format

## Phase 3: Advanced Features (Complete)

- [x] Burn after read (`X-Burn-After-Read: 1`)
- [x] Private pastes with view key (`X-Private: 1`)
- [x] QR code for paste URL
- [ ] Syntax highlighting for common languages (deferred - conflicts with ANSI)

## Phase 4: Admin & Observability

- [ ] Admin stats endpoint (protected)
  - Total pastes today/7 days
  - Top IPs by count
- [ ] Structured logging for latency and errors
- [ ] Scheduled cleanup job for expired pastes
- [ ] Rate limit cleanup job
- [ ] Abuse reporting mechanism

## Future Ideas

- Custom paste IDs (slug)
- Password-protected pastes
- Paste collections/groups
- Webhook on paste creation
- Browser extension
- VS Code extension
