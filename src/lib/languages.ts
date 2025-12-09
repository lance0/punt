// Supported languages for syntax highlighting
// Based on common Shiki bundled languages

export const SUPPORTED_LANGUAGES = new Set([
  // Web
  "javascript",
  "typescript",
  "html",
  "css",
  "json",
  "jsx",
  "tsx",
  "vue",
  "svelte",
  "astro",
  // Backend
  "python",
  "ruby",
  "php",
  "go",
  "rust",
  "java",
  "kotlin",
  "scala",
  "swift",
  "c",
  "cpp",
  "csharp",
  // Shell & Config
  "bash",
  "shell",
  "zsh",
  "fish",
  "powershell",
  "dockerfile",
  "yaml",
  "toml",
  "ini",
  "nginx",
  // Data & Query
  "sql",
  "graphql",
  "prisma",
  // Markup & Docs
  "markdown",
  "mdx",
  "latex",
  "xml",
  // Other
  "lua",
  "perl",
  "r",
  "elixir",
  "erlang",
  "haskell",
  "ocaml",
  "clojure",
  "lisp",
  "zig",
  "nim",
  "v",
  "diff",
  "makefile",
  "cmake",
  "regex",
]);

// Common aliases for language names
const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  sh: "bash",
  yml: "yaml",
  md: "markdown",
  "c++": "cpp",
  "c#": "csharp",
  cs: "csharp",
  rs: "rust",
  kt: "kotlin",
  ex: "elixir",
  hs: "haskell",
  ml: "ocaml",
  clj: "clojure",
  ps1: "powershell",
  psm1: "powershell",
};

// File extension to language mapping (for --lang auto)
export const EXTENSION_MAP: Record<string, string> = {
  // JavaScript/TypeScript
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  jsx: "jsx",
  tsx: "tsx",
  // Web
  html: "html",
  htm: "html",
  css: "css",
  scss: "css",
  sass: "css",
  less: "css",
  json: "json",
  vue: "vue",
  svelte: "svelte",
  astro: "astro",
  // Backend
  py: "python",
  rb: "ruby",
  php: "php",
  go: "go",
  rs: "rust",
  java: "java",
  kt: "kotlin",
  kts: "kotlin",
  scala: "scala",
  swift: "swift",
  c: "c",
  h: "c",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  hxx: "cpp",
  cs: "csharp",
  // Shell
  sh: "bash",
  bash: "bash",
  zsh: "zsh",
  fish: "fish",
  ps1: "powershell",
  psm1: "powershell",
  // Config
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  ini: "ini",
  conf: "ini",
  dockerfile: "dockerfile",
  // Data
  sql: "sql",
  graphql: "graphql",
  gql: "graphql",
  prisma: "prisma",
  // Docs
  md: "markdown",
  mdx: "mdx",
  tex: "latex",
  xml: "xml",
  // Other
  lua: "lua",
  pl: "perl",
  pm: "perl",
  r: "r",
  ex: "elixir",
  exs: "elixir",
  erl: "erlang",
  hs: "haskell",
  ml: "ocaml",
  clj: "clojure",
  cljs: "clojure",
  lisp: "lisp",
  el: "lisp",
  zig: "zig",
  nim: "nim",
  v: "v",
  diff: "diff",
  patch: "diff",
  makefile: "makefile",
  mk: "makefile",
  cmake: "cmake",
};

/**
 * Normalize a language identifier to canonical form
 * Returns null if language is invalid
 */
export function normalizeLanguage(lang: string): string | null {
  const lower = lang.toLowerCase().trim();

  // Check direct match
  if (SUPPORTED_LANGUAGES.has(lower)) {
    return lower;
  }

  // Check aliases
  if (LANGUAGE_ALIASES[lower]) {
    return LANGUAGE_ALIASES[lower];
  }

  return null;
}

/**
 * Check if a language identifier is valid
 */
export function isValidLanguage(lang: string): boolean {
  return normalizeLanguage(lang) !== null;
}

/**
 * Detect language from filename extension
 * Returns null if extension is unknown
 */
export function detectLanguageFromFilename(filename: string): string | null {
  // Handle special filenames
  const basename = filename.split("/").pop()?.toLowerCase() ?? "";

  if (basename === "dockerfile") return "dockerfile";
  if (basename === "makefile" || basename === "gnumakefile") return "makefile";
  if (basename === "cmakelists.txt") return "cmake";

  // Get extension
  const ext = basename.split(".").pop()?.toLowerCase();
  if (!ext) return null;

  return EXTENSION_MAP[ext] ?? null;
}

/**
 * Get list of supported languages for documentation
 */
export function getSupportedLanguagesList(): string[] {
  return Array.from(SUPPORTED_LANGUAGES).sort();
}
