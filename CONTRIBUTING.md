# Contributing to punt.sh

Thanks for your interest in contributing to punt.sh!

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Turso](https://turso.tech) account (or local SQLite for development)

### Getting Started

```bash
# Clone the repo
git clone https://github.com/lance0/punt.git
cd punt

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your Turso credentials

# Initialize the database
bun run db:setup

# Start the dev server with hot reload
bun run dev
```

The server runs at `http://localhost:3000` by default.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `TURSO_DATABASE_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `BASE_URL` | Public URL (default: https://punt.sh) |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret |
| `BETTER_AUTH_SECRET` | Secret for session signing |

## Code Style

- TypeScript for all source files
- Use Bun APIs where available (`Bun.file`, `Bun.serve`, etc.)
- Prefer `bun:sqlite` over `better-sqlite3`
- No semicolons (project uses Prettier defaults)
- Run `bun run typecheck` before committing

## Project Structure

```
punt/
├── src/
│   ├── index.ts       # Main server entry
│   ├── routes/        # API route handlers
│   ├── lib/           # Shared utilities
│   └── templates/     # HTML templates (TSX)
├── cli/               # CLI tool (@lance0/punt)
├── scripts/           # Database setup, etc.
└── public/            # Static assets
```

## Pull Requests

1. Fork the repo and create a branch from `master`
2. Make your changes
3. Run `bun run typecheck` to ensure no type errors
4. Test your changes locally
5. Submit a PR with a clear description of the changes

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include reproduction steps for bugs
- Check existing issues before creating a new one

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
