import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useMemo,
} from "react";
import { extractSubdomain } from "../../shared/subdomain.js";
import { slugToDisplayName } from "../../shared/tenants.js";

const appDomain = import.meta.env.VITE_APP_DOMAIN ?? "dashboard.velais.com";

export interface TenantInfo {
  slug: string;
  displayName: string;
}

export function getTenantSlug(): string | null {
  const sub = extractSubdomain(window.location.host, appDomain);
  if (sub) return sub;

  // Fallback for localhost dev without subdomain
  return (import.meta.env.VITE_DEV_TENANT_SLUG as string | undefined) ?? null;
}

const TenantContext = createContext<TenantInfo | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const tenant = useMemo((): TenantInfo | null => {
    const slug = getTenantSlug();
    if (!slug) return null;
    return { slug, displayName: slugToDisplayName.get(slug) ?? slug };
  }, []);

  return createElement(TenantContext.Provider, { value: tenant }, children);
}

export function useTenant(): TenantInfo | null {
  return useContext(TenantContext);
}
