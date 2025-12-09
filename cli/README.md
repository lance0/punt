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
# Pipe any command output
npm test 2>&1 | punt
docker logs myapp | punt
kubectl describe pod mypod | punt

# Set custom expiry
command | punt --ttl 1h    # 1 hour
command | punt --ttl 7d    # 7 days

# Burn after read (auto-delete after first view)
cat secret.txt | punt --burn

# Private paste (requires view key)
echo "secret" | punt --private

# Syntax highlighting for code
cat src/index.ts | punt --lang typescript
cat script.py | punt --lang python

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

- ANSI color preservation - terminal output looks exactly as intended
- Default 24h expiry, configurable up to 7 days (30 days if logged in)
- Burn after read for sensitive content
- Private pastes with view keys
- QR codes for easy mobile sharing

## Links

- Website: https://punt.sh
- Docs: https://punt.sh/docs
- GitHub: https://github.com/lance0/punt
