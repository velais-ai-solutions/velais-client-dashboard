export interface TenantConfig {
  slug: string;
  project: string;
  team: string;
}

const tenantMap: Record<string, TenantConfig> = {
  org_01KHVPY7F02C9NRDYWD010RZP9: {
    slug: "foresound-srl",
    project: "Foresound Srl -  Custom AI Product Development",
    team: "Foresound Srl -  Custom AI Product Development Team",
  },
};

export function resolveTenant(orgId: string): TenantConfig | null {
  return tenantMap[orgId] ?? null;
}
