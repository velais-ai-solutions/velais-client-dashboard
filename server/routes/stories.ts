import { Hono } from "hono";
import type { AuthEnv } from "../middleware/auth.js";
import {
  getCurrentIteration,
  getWorkItemDetails,
  queryWorkItems,
} from "../services/azure-devops.js";
import { transformWorkItem } from "../services/transform.js";

const stories = new Hono<AuthEnv>();

stories.get("/", async (c) => {
  const tenant = c.get("tenant");

  try {
    const iteration = await getCurrentIteration(tenant.project, tenant.team);
    if (!iteration) {
      console.warn("[stories] No iteration found");
      return c.json([]);
    }

    console.log(
      "[stories] Iteration:",
      iteration.name,
      "| Path:",
      iteration.path,
    );
    const ids = await queryWorkItems(tenant.project, iteration.path);
    console.log("[stories] Work item IDs:", ids.length);
    const workItems = await getWorkItemDetails(ids);
    const clientStories = workItems.map(transformWorkItem);

    return c.json(clientStories);
  } catch (err) {
    console.error("[stories] Azure DevOps error:", err);
    return c.json({ error: "Failed to fetch stories from Azure DevOps" }, 502);
  }
});

export default stories;
