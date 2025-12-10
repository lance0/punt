# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.3] - 2025-12-10

### Added

- About page (`/about`) with project story, features, and tech stack
- "Why Sign In?" comparison table on docs page
- Language modal showing all 66 supported languages with aliases
- Auto-detection documentation for syntax highlighting
- Custom dark scrollbars across all pages
- API response examples in documentation

### Changed

- Documentation fully rewritten with expanded sections
- Home page features updated to highlight auth benefits
- Shared UI components extracted to `shared.ts` to reduce duplication

## [0.6.2] - 2025-12-09

### Added

- CLI `--burn` flag for burn-after-read pastes
- CLI `--private` flag for private pastes with view key

### Fixed

- CLI now correctly extracts URL from API response (was showing full response)
- CLI help text updated with correct max TTL info (30d for authenticated)

### Changed

- CLI version bumped to 0.3.0

## [0.6.1] - 2025-12-09

### Added

- "Sign in with GitHub" button on homepage header
- User navigation shows avatar + name when logged in, links to dashboard
- Favicon added to all template pages (dashboard, CLI auth, user dashboard)

### Changed

- Homepage now checks session state to show appropriate navigation

## [0.6.0] - 2025-12-09

### Added

- Complete user authentication and account system
  - CLI authentication via device code flow (`punt login`, `punt logout`, `punt whoami`)
  - API tokens for CLI authentication (format: `punt_<nanoid>`)
  - Token stored in `~/.config/punt/token`
- User dashboard at `/me`
  - View all your pastes with stats
  - Delete pastes or extend TTL (+7 days)
  - Create and revoke API tokens
- Authenticated paste creation benefits
  - Rate limit: 1000/day (vs 100/day anonymous)
  - Max TTL: 30 days (vs 7 days anonymous)
  - Pastes linked to your account for management
- New database tables
  - `api_tokens` for CLI authentication tokens
  - `cli_device_codes` for device auth flow
  - `user_id` column on pastes table

### Changed

- CLI version bumped to 0.2.0
- Anonymous rate limit now explicitly 100/day per IP
- TTL validation now shows max days in warning message

## [0.5.0] - 2025-12-09

### Added

- GitHub OAuth admin dashboard at `/dashboard`
  - Login with GitHub account (no JavaScript required - server-side redirect)
  - View paste statistics (total, today, 7 days, active, views)
  - View top IPs by usage
  - Manage abuse reports (resolve or delete paste)
- BetterAuth integration for session management
  - Lazy-loaded auth to avoid blocking serverless cold starts
  - Proper OAuth state cookie forwarding for serverless environments
- Admin access controlled via `ADMIN_GITHUB_IDS` env var
- New env vars: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `BETTER_AUTH_SECRET`

## [0.4.0] - 2025-12-09

### Added

- Admin stats endpoint (`GET /api/admin/stats`)
  - Total pastes, today/7 days counts
  - Active pastes, total views
  - Burn-after-read and private paste counts
  - Top IPs by usage
- Structured JSON logging for all requests
  - Request method, path, status, duration
  - Client IP and user agent
  - Error details with stack traces
- Scheduled cleanup cron job (every 6 hours)
  - Removes expired pastes
  - Cleans old rate limit entries
- Abuse reporting system
  - `POST /api/report/:id` - Submit abuse report
  - Admin endpoints to view and resolve reports
  - Admin can delete reported pastes

## [0.3.0] - 2025-12-09

### Added

- Burn after read feature (`X-Burn-After-Read: 1` header)
  - Shows 🔥 badge on paste
  - Automatically deletes after first view
- Private pastes (`X-Private: 1` header)
  - Requires view key to access
  - Shows key input page when accessing without key
  - Shows 🔒 badge on paste
- QR code modal for easy mobile sharing
  - Click QR button in toolbar to generate

### Changed

- API response now shows full delete key
- Fixed raw URL for private pastes (key goes after /raw)
- Improved mobile responsiveness for paste view and homepage

## [0.2.2] - 2025-12-09

### Changed

- API response now shows friendly output with URL, raw link, expiry time, and delete key
- Added trailing newline to API response for cleaner terminal output

## [0.2.1] - 2025-12-09

### Added

- Favicon (football emoji via inline SVG)
- Download button to save paste as .txt file
- Toast notifications for copy/download feedback
- Keyboard shortcuts (Ctrl+C copy, Ctrl+S download)
- Paste size and line count display in header
- Improved home page with hero section and examples grid
- Gradient warning banner
- SVG icons for toolbar buttons

## [0.2.0] - 2025-12-09

### Added

- `punt` CLI tool for terminal-based paste creation
- Pipe stdin support: `command | punt`
- `--ttl` flag for custom expiry times
- `--cat` flag to fetch raw paste content
- `--show` flag to open paste in browser
- `--delete` flag to delete pastes
- Colorful terminal output with spinner animation
- Football-themed branding

## [0.1.0] - 2025-12-09

### Added

- Initial release
- POST /api/paste endpoint for creating pastes
- GET /:id HTML view with ANSI color rendering
- GET /:id/raw for raw content retrieval
- DELETE /api/paste/:id/:deleteKey for paste deletion
- GET /healthz health check endpoint
- Turso (libSQL) database integration
- IP-based rate limiting (100 pastes/day per IP)
- 4 MB paste size limit
- TTL support with X-TTL header (default 24h, max 7d)
- Dark terminal theme (Catppuccin Mocha colors)
- Line numbers display
- Copy to clipboard button
- Responsive design for mobile
- Vercel deployment configuration
- Home page with usage instructions
