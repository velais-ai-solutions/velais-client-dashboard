import type { ClientStory } from "../../shared/types/index.js";
import type { TenantConfig } from "../tenants.js";
import {
  getCurrentIteration,
  getWorkItemDetails,
  queryWorkItems,
} from "./azure-devops.js";
import { transformWorkItem } from "./transform.js";

export async function fetchCurrentSprintStories(tenant: TenantConfig) {
  const iteration = await getCurrentIteration(tenant.project, tenant.team);
  if (!iteration) return { stories: [] as ClientStory[], iteration: null };

  console.log(
    `[sprint] Iteration: ${iteration.name} | Path: ${iteration.path}`,
  );
  const ids = await queryWorkItems(tenant.project, iteration.path);
  console.log(`[sprint] Work item IDs: ${ids.length}`);
  const workItems = await getWorkItemDetails(ids);
  const stories = workItems.map(transformWorkItem);

  return { stories, iteration };
}
