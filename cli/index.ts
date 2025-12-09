#!/usr/bin/env bun

import { homedir } from "os";
import { join } from "path";
import { mkdir } from "fs/promises";

const VERSION = "0.3.0";
const API_URL = process.env.PUNT_API_URL ?? "https://punt.sh";
const CONFIG_DIR = join(homedir(), ".config", "punt");
const TOKEN_FILE = join(CONFIG_DIR, "token");

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
  console.log(`  ${c.green}punt${c.reset} ${c.yellow}--ttl 1h${c.reset}              Set expiry (default: 24h)`);
  console.log(`  ${c.green}punt${c.reset} ${c.yellow}--burn${c.reset}                Delete after first view`);
  console.log(`  ${c.green}punt${c.reset} ${c.yellow}--private${c.reset}             Require key to view`);
  console.log(`  ${c.green}punt${c.reset} ${c.yellow}--show${c.reset} ${c.dim}<id>${c.reset}           Open paste in browser`);
  console.log(`  ${c.green}punt${c.reset} ${c.yellow}--cat${c.reset} ${c.dim}<url>${c.reset}           Fetch raw paste content`);
  console.log(`  ${c.green}punt${c.reset} ${c.yellow}--delete${c.reset} ${c.dim}<id> <key>${c.reset}   Delete a paste`);
  console.log();
  console.log(`${c.bold}ACCOUNT${c.reset}`);
  console.log(`  ${c.green}punt${c.reset} ${c.yellow}login${c.reset}              Sign in with GitHub`);
  console.log(`  ${c.green}punt${c.reset} ${c.yellow}logout${c.reset}             Sign out and remove credentials`);
  console.log(`  ${c.green}punt${c.reset} ${c.yellow}whoami${c.reset}             Show current user info`);
  console.log();
  console.log(`${c.bold}OPTIONS${c.reset}`);
  console.log(`  ${c.yellow}--ttl${c.reset} ${c.dim}<duration>${c.reset}    Expiry time (e.g., 30m, 2h, 7d, 30d)`);
  console.log(`  ${c.yellow}--burn${c.reset}             Burn after read (auto-delete on view)`);
  console.log(`  ${c.yellow}--private${c.reset}          Private paste (generates view key)`);
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
  console.log(`  ${c.dim}# Self-destructing paste${c.reset}`);
  console.log(`  ${c.cyan}cat secret.txt${c.reset} | ${c.green}punt${c.reset} ${c.yellow}--burn${c.reset}`);
  console.log();
  console.log(`  ${c.dim}# Private paste with view key${c.reset}`);
  console.log(`  ${c.cyan}echo "secret"${c.reset} | ${c.green}punt${c.reset} ${c.yellow}--private${c.reset}`);
  console.log();
  console.log(`  ${c.dim}# Grab a paste${c.reset}`);
  console.log(`  ${c.green}punt${c.reset} ${c.yellow}--cat${c.reset} abc123`);
  console.log();
  console.log(`${c.bold}AUTHENTICATED BENEFITS${c.reset}`);
  console.log(`  ${c.dim}• Extended TTL (up to 30 days vs 7 days)${c.reset}`);
  console.log(`  ${c.dim}• Higher rate limits (1000/day vs 100/day)${c.reset}`);
  console.log(`  ${c.dim}• Manage pastes from your dashboard${c.reset}`);
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

// Token management
async function getToken(): Promise<string | null> {
  try {
    const file = Bun.file(TOKEN_FILE);
    if (await file.exists()) {
      const token = (await file.text()).trim();
      return token || null;
    }
  } catch {
    // File doesn't exist or can't be read
  }
  return null;
}

async function saveToken(token: string): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  await Bun.write(TOKEN_FILE, token, { mode: 0o600 });
}

async function deleteToken(): Promise<void> {
  try {
    const { unlink } = await import("fs/promises");
    await unlink(TOKEN_FILE);
  } catch {
    // File doesn't exist
  }
}

// Login command - device auth flow
async function login(): Promise<void> {
  // Check if already logged in
  const existingToken = await getToken();
  if (existingToken) {
    console.log(`${c.yellow}You're already logged in. Run ${c.green}punt logout${c.yellow} first.${c.reset}`);
    process.exit(1);
  }

  console.log();
  console.log(`${FOOTBALL} ${c.bold}Signing in to punt.sh${c.reset}`);
  console.log();

  // Initiate device auth flow
  const spin = spinner("Initializing login...");

  let code: string;
  try {
    const response = await fetch(`${API_URL}/api/cli/init`, { method: "POST" });
    if (!response.ok) {
      spin.stop(false);
      printError("Failed to initialize login");
      process.exit(1);
    }
    const data = await response.json() as { code: string };
    code = data.code;
    spin.stop(true);
  } catch (err) {
    spin.stop(false);
    printError(`Failed to connect: ${err instanceof Error ? err.message : "Unknown error"}`);
    process.exit(1);
  }

  // Open browser to authorize
  const authUrl = `${API_URL}/cli/auth?code=${code}`;
  console.log();
  console.log(`${c.bold}Open this URL in your browser:${c.reset}`);
  console.log(`  ${c.cyan}${authUrl}${c.reset}`);
  console.log();

  // Try to open browser automatically
  const cmd = process.platform === "darwin" ? "open"
            : process.platform === "win32" ? "start"
            : "xdg-open";
  try {
    Bun.spawn([cmd, authUrl]);
    console.log(`${c.dim}Opening browser...${c.reset}`);
  } catch {
    console.log(`${c.dim}Please open the URL manually.${c.reset}`);
  }

  console.log();
  console.log(`${c.dim}Waiting for authorization...${c.reset}`);

  // Poll for approval
  const pollInterval = 2000; // 2 seconds
  const maxPolls = 150; // 5 minutes (300s / 2s)

  for (let i = 0; i < maxPolls; i++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    try {
      const response = await fetch(`${API_URL}/api/cli/poll?code=${code}`);
      if (!response.ok) {
        continue;
      }

      const data = await response.json() as { status: string; token?: string };

      if (data.status === "approved" && data.token) {
        await saveToken(data.token);
        console.log();
        console.log(`${c.green}${c.bold}✓ Logged in successfully!${c.reset}`);
        console.log(`${c.dim}Token saved to ${TOKEN_FILE}${c.reset}`);
        console.log();
        console.log(`Run ${c.cyan}punt whoami${c.reset} to see your account info.`);
        console.log();
        process.exit(0);
      } else if (data.status === "expired") {
        console.log();
        printError("Login expired. Please try again.");
        process.exit(1);
      }
      // status === "pending" - continue polling
    } catch {
      // Network error, continue polling
    }
  }

  console.log();
  printError("Login timed out. Please try again.");
  process.exit(1);
}

// Logout command
async function logout(): Promise<void> {
  const token = await getToken();
  if (!token) {
    console.log(`${c.dim}Not logged in.${c.reset}`);
    process.exit(0);
  }

  await deleteToken();
  console.log();
  console.log(`${c.green}${c.bold}✓ Logged out successfully!${c.reset}`);
  console.log(`${c.dim}Token removed from ${TOKEN_FILE}${c.reset}`);
  console.log();
}

// Whoami command
async function whoami(): Promise<void> {
  const token = await getToken();
  if (!token) {
    console.log();
    console.log(`${c.dim}Not logged in.${c.reset}`);
    console.log(`Run ${c.cyan}punt login${c.reset} to sign in.`);
    console.log();
    process.exit(0);
  }

  const spin = spinner("Fetching user info...");

  try {
    const response = await fetch(`${API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      spin.stop(false);
      if (response.status === 401) {
        await deleteToken();
        printError("Token expired or invalid. Please run `punt login` again.");
      } else {
        printError(`Server returned ${response.status}`);
      }
      process.exit(1);
    }

    const user = await response.json() as { name: string; email: string };
    spin.stop(true);

    console.log();
    console.log(`${FOOTBALL} ${c.bold}Logged in as:${c.reset}`);
    console.log(`   ${c.bold}Name${c.reset}   ${user.name}`);
    console.log(`   ${c.bold}Email${c.reset}  ${user.email}`);
    console.log();
  } catch (err) {
    spin.stop(false);
    printError(`Failed to connect: ${err instanceof Error ? err.message : "Unknown error"}`);
    process.exit(1);
  }
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of Bun.stdin.stream()) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

interface CreatePasteOptions {
  ttl?: string;
  burn?: boolean;
  private?: boolean;
}

async function createPaste(content: string, options: CreatePasteOptions = {}): Promise<void> {
  if (!content.trim()) {
    printError("Nothing to punt! Pipe some content to me.");
    process.exit(1);
  }

  const size = new TextEncoder().encode(content).length;
  if (size > 4 * 1024 * 1024) {
    printError(`Content too large (${(size / 1024 / 1024).toFixed(1)}MB). Max is 4MB.`);
    process.exit(1);
  }

  const flags = [];
  if (options.burn) flags.push("🔥 burn");
  if (options.private) flags.push("🔒 private");
  const spinText = flags.length > 0 ? `Punting (${flags.join(", ")})...` : "Punting...";
  const spin = spinner(spinText);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "text/plain",
    };
    if (options.ttl) {
      headers["X-TTL"] = options.ttl;
    }
    if (options.burn) {
      headers["X-Burn-After-Read"] = "1";
    }
    if (options.private) {
      headers["X-Private"] = "1";
    }

    // Include auth token if logged in
    const token = await getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
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

    const responseText = await response.text();
    const deleteKey = response.headers.get("X-Delete-Key") ?? "unknown";
    const pasteId = response.headers.get("X-Paste-Id") ?? "";
    const ttlWarning = response.headers.get("X-TTL-Warning");

    // Extract URL from response or construct from paste ID
    let url = `${API_URL}/${pasteId}`;
    const urlMatch = responseText.match(/URL\s+(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      url = urlMatch[1]!;
    }

    // Calculate expiry display
    let expiresIn = "24h";
    if (options.ttl) {
      expiresIn = options.ttl;
      if (ttlWarning) {
        expiresIn += ` (${ttlWarning})`;
      }
    }
    if (options.burn) {
      expiresIn += " 🔥";
    }
    if (options.private) {
      expiresIn += " 🔒";
    }

    spin.stop(true);
    printSuccess(url, deleteKey, expiresIn);
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

// Subcommands: login, logout, whoami
if (args[0] === "login") {
  await login();
  process.exit(0);
}

if (args[0] === "logout") {
  await logout();
  process.exit(0);
}

if (args[0] === "whoami") {
  await whoami();
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

// Parse options
const options: CreatePasteOptions = {};

// --ttl <duration>
const ttlIndex = args.indexOf("--ttl");
if (ttlIndex !== -1) {
  options.ttl = args[ttlIndex + 1];
  if (!options.ttl) {
    printError("--ttl requires a duration (e.g., 1h, 30m, 2d)");
    process.exit(1);
  }
}

// --burn
if (args.includes("--burn")) {
  options.burn = true;
}

// --private
if (args.includes("--private")) {
  options.private = true;
}

const content = await readStdin();
await createPaste(content, options);
