export { extractSubdomain } from "../shared/subdomain.js";
export type { TenantEntry } from "../shared/tenants.js";
export {
  orgIdToSlug,
  slugToDisplayName,
  slugToOrgId,
  tenants,
  validSlugs,
} from "../shared/tenants.js";

import { slugToOrgId } from "../shared/tenants.js";

export interface TenantConfig {
  slug: string;
  project: string;
  team: string;
}

export const tenantsByOrg: Record<string, TenantConfig> = {
  org_01KHVPY7F02C9NRDYWD010RZP9: {
    slug: "foresound-srl",
    project: "Foresound Srl -  Custom AI Product Development",
    team: "Foresound Srl -  Custom AI Product Development Team",
  },
  org_01KJ9V64J25YSFA4RCKZ9FGPTC: {
    slug: "kablee-srl",
    project: "Kablee Srl -  Custom AI Product Development",
    team: "Kablee Srl -  Custom AI Product Development Team",
  },
  org_01KJFM2NQV5F64BCZBF4C4462V: {
    slug: "deals-sa",
    project: "",
    team: "",
  },
};

export function resolveTenant(orgId: string): TenantConfig | null {
  return tenantsByOrg[orgId] ?? null;
}

export function resolveTenantBySlug(slug: string): TenantConfig | null {
  const orgId = slugToOrgId.get(slug);
  if (!orgId) return null;
  return tenantsByOrg[orgId] ?? null;
}
