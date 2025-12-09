#!/usr/bin/env bun

const VERSION = "0.1.0";
const API_URL = process.env.PUNT_API_URL ?? "https://punt.sh";

// Colors for terminal output
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Fun football-themed ASCII art
const LOGO = `
${c.yellow}    ╭──────────────────╮${c.reset}
${c.yellow}    │${c.reset}  ${c.bold}${c.cyan}punt.sh${c.reset}  ${c.dim}v${VERSION}${c.reset}  ${c.yellow}│${c.reset}
${c.yellow}    ╰──────────────────╯${c.reset}
`;

const FOOTBALL = `${c.yellow}🏈${c.reset}`;

function printHelp() {
  console.log(LOGO);
  console.log(`${c.bold}USAGE${c.reset}`);
  console.log(`  ${c.cyan}command${c.reset} | ${c.green}punt${c.reset}              Punt your output to the cloud`);
  console.log(`  ${c.green}punt${c.reset} ${c.yellow}--ttl 1h${c.reset}              Set expiry (default: 24h, max: 7d)`);
  console.log(`  ${c.green}punt${c.reset} ${c.yellow}--show${c.reset} ${c.dim}<id>${c.reset}           View a paste in terminal`);
  console.log(`  ${c.green}punt${c.reset} ${c.yellow}--cat${c.reset} ${c.dim}<url>${c.reset}           Fetch raw paste content`);
  console.log(`  ${c.green}punt${c.reset} ${c.yellow}--delete${c.reset} ${c.dim}<id> <key>${c.reset}   Delete a paste`);
  console.log();
  console.log(`${c.bold}OPTIONS${c.reset}`);
  console.log(`  ${c.yellow}--ttl${c.reset} ${c.dim}<duration>${c.reset}    Expiry time (e.g., 30m, 2h, 1d)`);
  console.log(`  ${c.yellow}--show${c.reset} ${c.dim}<id>${c.reset}         Open paste in browser`);
  console.log(`  ${c.yellow}--cat${c.reset} ${c.dim}<url|id>${c.reset}      Print raw paste to stdout`);
  console.log(`  ${c.yellow}--delete${c.reset} ${c.dim}<id> <key>${c.reset} Delete paste with delete key`);
  console.log(`  ${c.yellow}--help${c.reset}, ${c.yellow}-h${c.reset}         Show this help`);
  console.log(`  ${c.yellow}--version${c.reset}, ${c.yellow}-v${c.reset}      Show version`);
  console.log();
  console.log(`${c.bold}EXAMPLES${c.reset}`);
  console.log(`  ${c.dim}# Share your test output${c.reset}`);
  console.log(`  ${c.cyan}npm test${c.reset} 2>&1 | ${c.green}punt${c.reset}`);
  console.log();
  console.log(`  ${c.dim}# Share docker logs with 1 hour expiry${c.reset}`);
  console.log(`  ${c.cyan}docker logs myapp${c.reset} | ${c.green}punt${c.reset} ${c.yellow}--ttl 1h${c.reset}`);
  console.log();
  console.log(`  ${c.dim}# Grab a paste${c.reset}`);
  console.log(`  ${c.green}punt${c.reset} ${c.yellow}--cat${c.reset} abc123`);
  console.log();
}

function printVersion() {
  console.log(`punt-cli ${VERSION}`);
}

function printSuccess(url: string, deleteKey: string, expiresIn: string) {
  console.error(); // blank line
  console.error(`${FOOTBALL} ${c.bold}${c.green}Punted!${c.reset}`);
  console.error();
  console.error(`   ${c.bold}URL${c.reset}  ${c.cyan}${url}${c.reset}`);
  console.error(`   ${c.bold}Raw${c.reset}  ${c.dim}${url}/raw${c.reset}`);
  console.error(`   ${c.dim}Expires in ${expiresIn} | Delete key: ${deleteKey.slice(0, 8)}...${c.reset}`);
  console.error();

  // Print just the URL to stdout for piping
  console.log(url);
}

function printError(message: string) {
  console.error();
  console.error(`${c.red}${c.bold}Error:${c.reset} ${message}`);
  console.error();
}

function spinner(text: string): { stop: (success?: boolean) => void } {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const id = setInterval(() => {
    process.stderr.write(`\r${c.cyan}${frames[i++ % frames.length]}${c.reset} ${text}`);
  }, 80);

  return {
    stop: (success = true) => {
      clearInterval(id);
      const icon = success ? `${c.green}✓${c.reset}` : `${c.red}✗${c.reset}`;
      process.stderr.write(`\r${icon} ${text}\n`);
    }
  };
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of Bun.stdin.stream()) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

async function createPaste(content: string, ttl?: string): Promise<void> {
  if (!content.trim()) {
    printError("Nothing to punt! Pipe some content to me.");
    process.exit(1);
  }

  const size = new TextEncoder().encode(content).length;
  if (size > 4 * 1024 * 1024) {
    printError(`Content too large (${(size / 1024 / 1024).toFixed(1)}MB). Max is 4MB.`);
    process.exit(1);
  }

  const spin = spinner("Punting...");

  try {
    const headers: Record<string, string> = {
      "Content-Type": "text/plain",
    };
    if (ttl) {
      headers["X-TTL"] = ttl;
    }

    const response = await fetch(`${API_URL}/api/paste`, {
      method: "POST",
      headers,
      body: content,
    });

    if (!response.ok) {
      spin.stop(false);
      const error = await response.text();
      printError(error || `Server returned ${response.status}`);
      process.exit(1);
    }

    const url = await response.text();
    const deleteKey = response.headers.get("X-Delete-Key") ?? "unknown";
    const ttlWarning = response.headers.get("X-TTL-Warning");

    // Calculate expiry display
    let expiresIn = "24h";
    if (ttl) {
      expiresIn = ttl;
      if (ttlWarning) {
        expiresIn += ` (${ttlWarning})`;
      }
    }

    spin.stop(true);
    printSuccess(url.trim(), deleteKey, expiresIn);
  } catch (err) {
    spin.stop(false);
    printError(`Failed to connect: ${err instanceof Error ? err.message : "Unknown error"}`);
    process.exit(1);
  }
}

async function catPaste(idOrUrl: string): Promise<void> {
  // Extract ID from URL if needed
  let id = idOrUrl;
  if (idOrUrl.includes("punt.sh/")) {
    const match = idOrUrl.match(/punt\.sh\/([a-zA-Z0-9_-]+)/);
    if (match) {
      id = match[1]!;
    }
  }

  try {
    const response = await fetch(`${API_URL}/${id}/raw`);
    if (!response.ok) {
      if (response.status === 404) {
        printError("Paste not found (may have expired)");
      } else {
        printError(`Server returned ${response.status}`);
      }
      process.exit(1);
    }

    const content = await response.text();
    process.stdout.write(content);
  } catch (err) {
    printError(`Failed to fetch: ${err instanceof Error ? err.message : "Unknown error"}`);
    process.exit(1);
  }
}

async function showPaste(id: string): Promise<void> {
  const url = `${API_URL}/${id}`;
  console.log(`${FOOTBALL} Opening ${c.cyan}${url}${c.reset}`);

  // Try to open in browser
  const cmd = process.platform === "darwin" ? "open"
            : process.platform === "win32" ? "start"
            : "xdg-open";

  try {
    Bun.spawn([cmd, url]);
  } catch {
    console.log(`${c.dim}Could not open browser. Visit: ${url}${c.reset}`);
  }
}

async function deletePaste(id: string, deleteKey: string): Promise<void> {
  const spin = spinner("Deleting...");

  try {
    const response = await fetch(`${API_URL}/api/paste/${id}/${deleteKey}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      spin.stop(false);
      if (response.status === 404) {
        printError("Paste not found or invalid delete key");
      } else {
        printError(`Server returned ${response.status}`);
      }
      process.exit(1);
    }

    spin.stop(true);
    console.error(`${c.green}Paste deleted!${c.reset}`);
  } catch (err) {
    spin.stop(false);
    printError(`Failed to delete: ${err instanceof Error ? err.message : "Unknown error"}`);
    process.exit(1);
  }
}

// Parse arguments
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  printVersion();
  process.exit(0);
}

// --cat <url|id>
const catIndex = args.indexOf("--cat");
if (catIndex !== -1) {
  const target = args[catIndex + 1];
  if (!target) {
    printError("--cat requires a paste ID or URL");
    process.exit(1);
  }
  await catPaste(target);
  process.exit(0);
}

// --show <id>
const showIndex = args.indexOf("--show");
if (showIndex !== -1) {
  const id = args[showIndex + 1];
  if (!id) {
    printError("--show requires a paste ID");
    process.exit(1);
  }
  await showPaste(id);
  process.exit(0);
}

// --delete <id> <key>
const deleteIndex = args.indexOf("--delete");
if (deleteIndex !== -1) {
  const id = args[deleteIndex + 1];
  const key = args[deleteIndex + 2];
  if (!id || !key) {
    printError("--delete requires <id> and <delete-key>");
    process.exit(1);
  }
  await deletePaste(id, key);
  process.exit(0);
}

// Default: read stdin and create paste
// Check if stdin is a TTY (no piped input)
if (Bun.stdin.stream().locked || process.stdin.isTTY) {
  printHelp();
  process.exit(0);
}

// --ttl <duration>
let ttl: string | undefined;
const ttlIndex = args.indexOf("--ttl");
if (ttlIndex !== -1) {
  ttl = args[ttlIndex + 1];
  if (!ttl) {
    printError("--ttl requires a duration (e.g., 1h, 30m, 2d)");
    process.exit(1);
  }
}

const content = await readStdin();
await createPaste(content, ttl);
