import { createHighlighter, type Highlighter } from "shiki";
import { SUPPORTED_LANGUAGES } from "./languages";

// Singleton highlighter instance
let highlighter: Highlighter | null = null;

// Common languages to preload for faster first render
const PRELOAD_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "bash",
  "json",
  "html",
  "css",
  "go",
  "rust",
  "sql",
  "yaml",
  "markdown",
];

/**
 * Get or create the Shiki highlighter instance
 * Lazy-loaded on first use
 */
async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["catppuccin-mocha"],
      langs: PRELOAD_LANGUAGES,
    });
  }
  return highlighter;
}

/**
 * Highlight code with syntax highlighting
 * Returns HTML string with inline styles
 */
export async function highlightCode(
  code: string,
  language: string
): Promise<string> {
  const hl = await getHighlighter();

  // Load language if not already loaded
  const loadedLangs = hl.getLoadedLanguages();
  if (!loadedLangs.includes(language as any)) {
    try {
      await hl.loadLanguage(language as any);
    } catch {
      // If language fails to load, return escaped plain text
      return escapeHtml(code);
    }
  }

  try {
    const html = hl.codeToHtml(code, {
      lang: language,
      theme: "catppuccin-mocha",
    });

    // Shiki wraps output in <pre><code>...</code></pre>
    // We want just the inner content since our template handles the wrapper
    // Extract content between <code> tags
    const match = html.match(/<code[^>]*>([\s\S]*)<\/code>/);
    if (match?.[1]) {
      return match[1];
    }
    return html;
  } catch {
    // Fallback to escaped plain text on any error
    return escapeHtml(code);
  }
}

/**
 * Get CSS for Shiki-highlighted code
 * Returns minimal CSS since Shiki uses inline styles
 */
export function getShikiCss(): string {
  return `
    /* Shiki highlighting - uses inline styles from theme */
    .shiki-content pre {
      background: transparent !important;
      margin: 0;
      padding: 0;
    }
    .shiki-content code {
      font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      line-height: 1.5;
    }
    .shiki-content .line {
      display: inline;
    }
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
