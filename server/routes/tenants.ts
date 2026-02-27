import { Hono } from "hono";
import { tenants } from "../../shared/tenants.js";
import { tenantsByOrg } from "../tenants.js";

const APP_DOMAIN = process.env.APP_DOMAIN ?? "dashboard.velais.com";

interface TenantListItem {
  slug: string;
  displayName: string;
  orgId: string;
  url: string;
}

const tenantsRoute = new Hono();

tenantsRoute.get("/", (c) => {
  const items: TenantListItem[] = [];

  for (const entry of tenants) {
    const config = tenantsByOrg[entry.orgId];
    if (!config?.project || !config?.team) continue;

    items.push({
      slug: entry.slug,
      displayName: entry.displayName,
      orgId: entry.orgId,
      url: `https://${entry.slug}.${APP_DOMAIN}`,
    });
  }

  return c.json(items);
});

export default tenantsRoute;
