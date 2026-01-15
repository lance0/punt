import { Elysia } from "elysia";
import { getBaseStyles, getToastStyles, getLanguageBadgeStyles, getPrivateKeyStyles } from "../templates/paste";
import { getSharedStyles, CSS_VERSION } from "../templates/shared";
import { getAnsiCss } from "../lib/ansi";
import { getShikiCss } from "../lib/highlight";

// Cache the compiled CSS since it's static
let cachedMainCss: string | null = null;
let cachedPasteCss: string | null = null;

function getMainCss(): string {
  if (!cachedMainCss) {
    cachedMainCss = `/* punt.sh main styles - ${CSS_VERSION} */
${getBaseStyles()}
${getSharedStyles()}
${getPrivateKeyStyles()}`;
  }
  return cachedMainCss;
}

function getPasteCss(): string {
  if (!cachedPasteCss) {
    cachedPasteCss = `/* punt.sh paste styles - ${CSS_VERSION} */
${getToastStyles()}
${getLanguageBadgeStyles()}
${getAnsiCss()}
${getShikiCss()}`;
  }
  return cachedPasteCss;
}

export const staticRoutes = new Elysia()
  // Main CSS - shared across all pages
  .get(`/styles/main.${CSS_VERSION}.css`, ({ set }) => {
    set.headers["Content-Type"] = "text/css; charset=utf-8";
    set.headers["Cache-Control"] = "public, max-age=31536000, immutable";
    return getMainCss();
  })

  // Paste-specific CSS - loaded on paste pages
  .get(`/styles/paste.${CSS_VERSION}.css`, ({ set }) => {
    set.headers["Content-Type"] = "text/css; charset=utf-8";
    set.headers["Cache-Control"] = "public, max-age=31536000, immutable";
    return getPasteCss();
  });
