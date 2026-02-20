import { Hono } from "hono";
import type { AuthEnv } from "../middleware/auth.js";
import { getCurrentIteration } from "../services/azure-devops.js";
import { buildIterationInfo } from "../services/transform.js";

const iterations = new Hono<AuthEnv>();

iterations.get("/", async (c) => {
  const tenant = c.get("tenant");

  try {
    const iteration = await getCurrentIteration(tenant.project, tenant.team);
    if (!iteration) {
      return c.json({ error: "No active sprint found" }, 404);
    }

    return c.json(buildIterationInfo(iteration));
  } catch (err) {
    console.error("[iterations] Azure DevOps error:", err);
    return c.json(
      { error: "Failed to fetch iterations from Azure DevOps" },
      502,
    );
  }
});

export default iterations;
