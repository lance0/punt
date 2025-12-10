# @lance0/punt

Share terminal output instantly via [punt.sh](https://punt.sh) - quick, colorful, ephemeral.

## Install

```bash
# npm
npm install -g @lance0/punt

# bun
bun install -g @lance0/punt

# or run without installing
npx @lance0/punt
bunx @lance0/punt
```

## Usage

```bash
# Share a file (auto-detects language from extension)
punt src/index.ts
punt script.py --burn

# Pipe any command output
npm test 2>&1 | punt
docker logs myapp | punt
kubectl describe pod mypod | punt

# Set custom expiry
punt file.ts --ttl 1h    # 1 hour
command | punt --ttl 7d  # 7 days

# Burn after read (auto-delete after first view)
punt secret.txt --burn

# Private paste (requires view key)
echo "secret" | punt --private

# Syntax highlighting (auto-detected for files, manual for pipes)
punt src/index.ts              # Auto-detects TypeScript
cat script.py | punt --lang py # Manual for piped content

# View a paste
punt --show abc123
punt --cat abc123

# Delete a paste
punt --delete abc123 deletekey
```

## Authentication

Sign in with GitHub for extended limits (30 day TTL, 1000 pastes/day):

```bash
punt login     # Sign in with GitHub
punt whoami    # Show current user
punt logout    # Sign out
```

## Features

- **File support** - `punt file.ts` with auto language detection
- **ANSI colors** - Terminal output looks exactly as intended
- **Syntax highlighting** - 66 languages, auto-detected from file extension
- **Flexible expiry** - Default 24h, up to 7 days (30 days if logged in)
- **Burn after read** - Self-destructing pastes for sensitive content
- **Private pastes** - Require view key to access

## Links

- Website: https://punt.sh
- Docs: https://punt.sh/docs
- GitHub: https://github.com/lance0/punt
