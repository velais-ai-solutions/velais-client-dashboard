import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import type { AuthEnv } from "./middleware/auth.js";
import { authMiddleware } from "./middleware/auth.js";
import { cacheMiddleware } from "./middleware/cache.js";
import { secretMiddleware } from "./middleware/secret.js";
import authRoutes from "./routes/auth.js";
import iterations from "./routes/iterations.js";
import stories from "./routes/stories.js";
import summary from "./routes/summary.js";
import tenantsRoute from "./routes/tenants.js";
import { getCurrentIteration } from "./services/azure-devops.js";
import { tenantsByOrg } from "./tenants.js";

const app = new Hono<AuthEnv>().basePath("/api");

app.use("*", secureHeaders());
app.use(logger());

// SEO prevention + clickjacking protection on all API responses
app.use("*", async (c, next) => {
  await next();
  c.header("X-Robots-Tag", "noindex, nofollow");
  c.header("X-Frame-Options", "DENY");
});

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/health/azure", async (c) => {
  const firstTenant = Object.values(tenantsByOrg)[0];
  if (!firstTenant) {
    return c.json({ status: "error", error: "No tenants configured" }, 500);
  }
  try {
    const iteration = await getCurrentIteration(
      firstTenant.project,
      firstTenant.team,
    );
    return c.json({
      status: "ok",
      currentIteration: iteration?.name ?? null,
    });
  } catch (err) {
    console.error("[health/azure] Check failed:", err);
    return c.json(
      { status: "error", error: "Azure DevOps connectivity check failed" },
      502,
    );
  }
});

app.route("/auth", authRoutes);

app.use("/tenants", secretMiddleware);
app.route("/tenants", tenantsRoute);

app.use("*", authMiddleware);
app.use("*", cacheMiddleware());

app.route("/stories", stories);
app.route("/summary", summary);
app.route("/iterations", iterations);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  console.error("[api] Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
