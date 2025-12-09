# punt.sh

[![npm version](https://img.shields.io/npm/v/@lance0/punt.svg)](https://www.npmjs.com/package/@lance0/punt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Share terminal output instantly via [punt.sh](https://punt.sh) - quick, colorful, ephemeral.

## Features

- **ANSI color preservation** - Terminal output looks exactly as intended
- **Syntax highlighting** - Opt-in code highlighting for 100+ languages
- **CLI tool** - First-class command line experience
- **GitHub authentication** - Extended limits and paste management
- **Burn after read** - Self-destructing pastes
- **Private pastes** - View key required for access
- **No account required** - Anonymous pastes work out of the box

## Install

```bash
# npm
npm install -g @lance0/punt

# bun
bun install -g @lance0/punt

# or run without installing
npx @lance0/punt
```

## Quick Start

```bash
# Pipe any command output
npm test 2>&1 | punt
docker logs myapp | punt
kubectl describe pod mypod | punt

# Custom expiry
command | punt --ttl 1h    # 1 hour
command | punt --ttl 7d    # 7 days

# Burn after read (auto-delete on first view)
cat secret.txt | punt --burn

# Private paste (requires view key)
echo "secret" | punt --private

# Syntax highlighting
cat src/index.ts | punt --lang typescript
cat script.py | punt --lang python
```

## Authentication

Sign in with GitHub for extended limits:

```bash
punt login     # Sign in with GitHub
punt whoami    # Show current user
punt logout    # Sign out
```

**Benefits:**
- Extended TTL: up to 30 days (vs 7 days anonymous)
- Higher rate limits: 1000/day (vs 100/day)
- Manage pastes from your [dashboard](https://punt.sh/me)

## CLI Commands

| Command | Description |
|---------|-------------|
| `punt` | Create paste from stdin |
| `punt --ttl <duration>` | Set expiry (30m, 2h, 7d, etc.) |
| `punt --burn` | Delete after first view |
| `punt --private` | Require view key |
| `punt --lang <lang>` | Syntax highlighting (ts, py, go, etc.) |
| `punt --cat <id>` | Fetch paste content |
| `punt --show <id>` | Open paste in browser |
| `punt --delete <id> <key>` | Delete a paste |
| `punt login` | Sign in with GitHub |
| `punt logout` | Sign out |
| `punt whoami` | Show current user |

## API Usage (curl)

No CLI? Use curl directly:

```bash
# Create paste
command | curl -X POST --data-binary @- https://punt.sh/api/paste

# With options
command | curl -H "X-TTL: 1h" -H "X-Burn-After-Read: 1" \
  -X POST --data-binary @- https://punt.sh/api/paste

# Syntax highlighting
cat file.ts | curl -H "X-Language: typescript" \
  -X POST --data-binary @- https://punt.sh/api/paste
```

## API Reference

See [punt.sh/docs](https://punt.sh/docs) for full API documentation.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/paste` | Create paste |
| GET | `/:id` | View paste (HTML) |
| GET | `/:id/raw` | Raw content |
| DELETE | `/api/paste/:id/:key` | Delete paste |
| GET | `/swagger` | OpenAPI documentation |

### Headers

| Header | Description |
|--------|-------------|
| `X-TTL` | Expiry duration (e.g., `1h`, `7d`) |
| `X-Burn-After-Read` | `1` to delete after first view |
| `X-Private` | `1` to require view key |
| `X-Language` | Language for syntax highlighting |
| `Authorization` | `Bearer <token>` for auth |

## Self-Hosting

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Turso](https://turso.tech) database (or local SQLite)

### Setup

```bash
git clone https://github.com/lance0/punt.git
cd punt
bun install
cp .env.example .env
# Edit .env with your credentials
bun run db:setup
bun run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `TURSO_DATABASE_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `BASE_URL` | Public URL (default: https://punt.sh) |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret |
| `BETTER_AUTH_SECRET` | Session signing secret |

### Deployment

Configured for Vercel with Bun runtime. See `vercel.json`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

[MIT](LICENSE)
