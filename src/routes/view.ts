import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import { getPaste, incrementViews, deletePasteById } from "../lib/db.ts";
import { ansiToHtml } from "../lib/ansi.ts";
import { formatTimeRemaining } from "../lib/time.ts";
import { renderPastePage, renderErrorPage } from "../templates/paste.tsx";

export const viewRoutes = new Elysia()
  .use(html())

  // HTML view
  .get(
    "/:id",
    async ({ params, query, set }) => {
      const { id } = params;
      const viewKey = query.key;

      const paste = await getPaste(id);

      if (!paste) {
        set.status = 404;
        return renderErrorPage("Paste not found", "This paste may have expired or been deleted.");
      }

      // Check private paste access
      if (paste.is_private && paste.view_key !== viewKey) {
        set.status = 403;
        return renderErrorPage("Access denied", "This paste is private and requires a valid key.");
      }

      // Handle burn after read
      if (paste.burn_after_read && paste.views > 0) {
        await deletePasteById(id);
        set.status = 410;
        return renderErrorPage(
          "Paste burned",
          "This paste was set to burn after reading and has been deleted."
        );
      }

      // Increment view counter
      await incrementViews(id);

      // Convert ANSI to HTML
      const htmlContent = ansiToHtml(paste.content);
      const expiresIn = formatTimeRemaining(paste.expires_at);

      return renderPastePage({
        id,
        content: htmlContent,
        expiresIn,
        views: paste.views + 1,
        burnAfterRead: paste.burn_after_read === 1,
      });
    },
    {
      params: t.Object({
        id: t.String({ minLength: 1 }),
      }),
      query: t.Object({
        key: t.Optional(t.String()),
      }),
    }
  )

  // Raw content view
  .get(
    "/:id/raw",
    async ({ params, query, set }) => {
      const { id } = params;
      const viewKey = query.key;

      const paste = await getPaste(id);

      if (!paste) {
        set.status = 404;
        return "Paste not found";
      }

      // Check private paste access
      if (paste.is_private && paste.view_key !== viewKey) {
        set.status = 403;
        return "Access denied";
      }

      // Handle burn after read
      if (paste.burn_after_read && paste.views > 0) {
        await deletePasteById(id);
        set.status = 410;
        return "Paste burned";
      }

      // Increment view counter
      await incrementViews(id);

      set.headers["Content-Type"] = "text/plain; charset=utf-8";
      return paste.content;
    },
    {
      params: t.Object({
        id: t.String({ minLength: 1 }),
      }),
      query: t.Object({
        key: t.Optional(t.String()),
      }),
    }
  );
