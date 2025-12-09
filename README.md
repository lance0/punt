# punt.sh

Share terminal output via short URL, with accurate ANSI colors and short, predictable lifetime.

## Use Cases

- Send a failing test log or kubectl error to a teammate without screenshots
- Drop a docker logs snippet into a ticket or chat
- Integrate with tools like Bark / LogSynth as an "external share" target

## Usage

```bash
# Pipe any command output
command | curl -X POST --data-binary @- https://punt.sh/api/paste

# With custom TTL (default: 24h, max: 7d)
command | curl -X POST -H "X-TTL: 1h" --data-binary @- https://punt.sh/api/paste

# Examples
docker logs mycontainer | curl -X POST --data-binary @- https://punt.sh/api/paste
kubectl get pods | curl -X POST --data-binary @- https://punt.sh/api/paste
npm test 2>&1 | curl -X POST --data-binary @- https://punt.sh/api/paste
```

The response is the URL to your paste. The `X-Delete-Key` header contains a key to delete it early.

## Features

- Preserves ANSI colors and formatting
- No account required
- 24 hour default expiry (configurable up to 7 days)
- 4 MB size limit
- Rate limited: 100 pastes/day per IP

## API

### POST /api/paste

Create a new paste.

**Request:**
- Body: Raw text/plain content
- Headers (optional):
  - `X-TTL`: Duration like `1h`, `30m`, `2d` (default: 24h, max: 7d)
  - `X-Burn-After-Read`: `1` to delete after first view
  - `X-Private`: `1` to require a view key

**Response:**
- Body: Plain text URL to the paste
- Headers:
  - `X-Delete-Key`: Key to delete the paste
  - `X-Paste-Id`: The paste ID
  - `X-RateLimit-Remaining`: Remaining pastes today

### GET /:id

View a paste as HTML with syntax highlighting and line numbers.

### GET /:id/raw

Get the raw paste content.

### DELETE /api/paste/:id/:deleteKey

Delete a paste using its delete key.

### GET /healthz

Health check endpoint.

## Development

### Prerequisites

- [Bun](https://bun.sh) runtime
- [Turso](https://turso.tech) database (or local libSQL)

### Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Copy environment file and configure:
   ```bash
   cp .env.example .env
   # Edit .env with your Turso credentials
   ```

3. Set up the database:
   ```bash
   bun run db:setup
   ```

4. Start the development server:
   ```bash
   bun run dev
   ```

### Scripts

- `bun run dev` - Start with hot reload
- `bun run start` - Start production server
- `bun run db:setup` - Initialize database schema
- `bun run typecheck` - Run TypeScript type checking

## Deployment

Configured for Vercel with Bun runtime. See `vercel.json`.

Environment variables needed:
- `TURSO_DATABASE_URL` - Turso database URL
- `TURSO_AUTH_TOKEN` - Turso auth token
- `BASE_URL` - Public URL (e.g., `https://punt.sh`)

## License

MIT
