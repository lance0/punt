import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { pasteRoutes } from "./routes/paste";
import { viewRoutes } from "./routes/view";
import { healthRoutes } from "./routes/health";
import { renderHomePage } from "./templates/paste";

const MAX_BODY_SIZE = 4 * 1024 * 1024; // 4 MB

const app = new Elysia({
  serve: {
    maxRequestBodySize: MAX_BODY_SIZE,
  },
})
  // Global error handler
  .onError(({ code, error, set }) => {
    console.error(`Error [${code}]:`, error);

    switch (code) {
      case "NOT_FOUND":
        set.status = 404;
        return "Not found";
      case "VALIDATION":
        set.status = 400;
        return "Invalid request";
      case "PARSE":
        set.status = 400;
        return "Invalid request body";
      default:
        set.status = 500;
        return "Internal server error";
    }
  })
  // Use HTML plugin
  .use(html())
  // Register routes
  .use(healthRoutes)
  .use(pasteRoutes)
  // Home page
  .get("/", () => {
    return renderHomePage();
  })
  // View routes last (catch-all for /:id)
  .use(viewRoutes);

export default app;
