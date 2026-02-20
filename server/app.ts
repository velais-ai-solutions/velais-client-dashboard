import { Hono } from "hono";
import type { AuthEnv } from "./middleware/auth.js";
import { authMiddleware } from "./middleware/auth.js";
import { cacheMiddleware } from "./middleware/cache.js";
import iterations from "./routes/iterations.js";
import stories from "./routes/stories.js";
import summary from "./routes/summary.js";
import { getCurrentIteration } from "./services/azure-devops.js";

const app = new Hono<AuthEnv>().basePath("/api");

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/health/azure", async (c) => {
  const testProject = "Foresound Srl -  Custom AI Product Development";
  const testTeam = "Foresound Srl -  Custom AI Product Development Team";
  try {
    const iteration = await getCurrentIteration(testProject, testTeam);
    return c.json({
      status: "ok",
      org: process.env.AZURE_DEVOPS_ORG,
      project: testProject,
      currentIteration: iteration?.name ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ status: "error", error: message }, 502);
  }
});

app.use("*", authMiddleware);
app.use("*", cacheMiddleware());

app.route("/stories", stories);
app.route("/summary", summary);
app.route("/iterations", iterations);

app.onError((err, c) => {
  console.error("[api] Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
