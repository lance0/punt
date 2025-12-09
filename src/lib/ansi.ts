import { AnsiUp } from "ansi_up";

const ansiUp = new AnsiUp();

// Configure for terminal-like rendering
ansiUp.use_classes = true;
// Ensure HTML escaping is enabled (default, but explicit for security)
ansiUp.escape_html = true;

/**
 * Convert ANSI escape codes to HTML with proper escaping
 * The ansi_up library handles HTML escaping internally
 */
export function ansiToHtml(text: string): string {
  return ansiUp.ansi_to_html(text);
}

/**
 * Generate CSS for ANSI color classes (Catppuccin Mocha theme)
 */
export function getAnsiCss(): string {
  return `
    /* Standard ANSI colors - Catppuccin Mocha */
    .ansi-black-fg { color: #45475a; }
    .ansi-red-fg { color: #f38ba8; }
    .ansi-green-fg { color: #a6e3a1; }
    .ansi-yellow-fg { color: #f9e2af; }
    .ansi-blue-fg { color: #89b4fa; }
    .ansi-magenta-fg { color: #f5c2e7; }
    .ansi-cyan-fg { color: #94e2d5; }
    .ansi-white-fg { color: #bac2de; }

    /* Bright ANSI colors */
    .ansi-bright-black-fg { color: #585b70; }
    .ansi-bright-red-fg { color: #f38ba8; }
    .ansi-bright-green-fg { color: #a6e3a1; }
    .ansi-bright-yellow-fg { color: #f9e2af; }
    .ansi-bright-blue-fg { color: #89b4fa; }
    .ansi-bright-magenta-fg { color: #f5c2e7; }
    .ansi-bright-cyan-fg { color: #94e2d5; }
    .ansi-bright-white-fg { color: #a6adc8; }

    /* Background colors */
    .ansi-black-bg { background-color: #45475a; }
    .ansi-red-bg { background-color: #f38ba8; }
    .ansi-green-bg { background-color: #a6e3a1; }
    .ansi-yellow-bg { background-color: #f9e2af; }
    .ansi-blue-bg { background-color: #89b4fa; }
    .ansi-magenta-bg { background-color: #f5c2e7; }
    .ansi-cyan-bg { background-color: #94e2d5; }
    .ansi-white-bg { background-color: #bac2de; }

    /* Text styles */
    .ansi-bold { font-weight: bold; }
    .ansi-italic { font-style: italic; }
    .ansi-underline { text-decoration: underline; }
    .ansi-strikethrough { text-decoration: line-through; }
  `;
}
