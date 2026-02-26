export interface TenantEntry {
  slug: string;
  orgId: string;
  displayName: string;
}

export const tenants: readonly TenantEntry[] = [
  {
    slug: "foresound-srl",
    orgId: "org_01KHVPY7F02C9NRDYWD010RZP9",
    displayName: "Foresound Srl",
  },
  {
    slug: "kablee-srl",
    orgId: "org_01KJ9V64J25YSFA4RCKZ9FGPTC",
    displayName: "Kablee Srl",
  },
];

export const validSlugs: ReadonlySet<string> = new Set(
  tenants.map((t) => t.slug),
);

export const slugToOrgId: ReadonlyMap<string, string> = new Map(
  tenants.map((t) => [t.slug, t.orgId]),
);

export const orgIdToSlug: ReadonlyMap<string, string> = new Map(
  tenants.map((t) => [t.orgId, t.slug]),
);

export const slugToDisplayName: ReadonlyMap<string, string> = new Map(
  tenants.map((t) => [t.slug, t.displayName]),
);
