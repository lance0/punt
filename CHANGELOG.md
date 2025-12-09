# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
