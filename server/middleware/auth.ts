import type { Context, Next } from "hono";
import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import type { TenantConfig } from "../tenants.js";
import { resolveTenant } from "../tenants.js";

export type AuthEnv = {
  Variables: {
    tenant: TenantConfig;
    userId: string;
  };
};

const clientId = process.env.WORKOS_CLIENT_ID!;
const jwks = createRemoteJWKSet(
  new URL(`https://api.workos.com/sso/jwks/${clientId}`),
);

export async function authMiddleware(c: Context<AuthEnv>, next: Next) {
  if (c.req.path.startsWith("/api/health")) {
    await next();
    return;
  }

  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = header.slice(7);

  try {
    await jwtVerify(token, jwks);
    const claims = decodeJwt(token);

    const orgId = claims.org_id as string | undefined;
    if (!orgId) {
      return c.json({ error: "No organization in token" }, 403);
    }

    const tenant = resolveTenant(orgId);
    if (!tenant) {
      return c.json({ error: "Unknown organization" }, 403);
    }

    c.set("tenant", tenant);
    c.set("userId", (claims.sub as string) ?? "unknown");

    await next();
  } catch {
    return c.json({ error: "Authentication failed" }, 401);
  }
}
