import { Hono } from "hono";
import type { AuthEnv } from "../middleware/auth.js";
import {
  getCurrentIteration,
  getWorkItemDetails,
  queryWorkItems,
} from "../services/azure-devops.js";
import { buildSummary, transformWorkItem } from "../services/transform.js";

const summary = new Hono<AuthEnv>();

summary.get("/", async (c) => {
  const tenant = c.get("tenant");

  try {
    const iteration = await getCurrentIteration(tenant.project, tenant.team);
    if (!iteration) {
      console.warn("[summary] No iteration found");
      return c.json({ error: "No active sprint found" }, 404);
    }

    console.log(
      "[summary] Iteration:",
      iteration.name,
      "| Path:",
      iteration.path,
    );
    const ids = await queryWorkItems(tenant.project, iteration.path);
    console.log("[summary] Work item IDs:", ids.length);
    const workItems = await getWorkItemDetails(ids);
    const stories = workItems.map(transformWorkItem);

    const sprintSummary = buildSummary(stories, {
      name: iteration.name,
      startDate: iteration.attributes.startDate,
      endDate: iteration.attributes.finishDate,
    });

    return c.json(sprintSummary);
  } catch (err) {
    console.error("[summary] Azure DevOps error:", err);
    return c.json({ error: "Failed to fetch summary from Azure DevOps" }, 502);
  }
});

export default summary;
