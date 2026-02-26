/**
 * Extract a single-level subdomain from a host string.
 *
 * @param host - The full host (may include port), e.g. "foresound-srl.dashboard.velais.com:3001"
 * @param appDomain - The base domain to match against, e.g. "dashboard.velais.com"
 * @returns The subdomain slug, or null if the host doesn't match or has no subdomain.
 */
export function extractSubdomain(
  host: string,
  appDomain: string,
): string | null {
  const hostname = host.split(":")[0];
  if (!hostname) return null;

  // localhost / 127.0.0.1 — no subdomain support
  if (hostname === "localhost" || hostname === "127.0.0.1") return null;

  // Dev: *.lvh.me (resolves to 127.0.0.1, supports subdomains)
  if (hostname.endsWith(".lvh.me")) {
    const sub = hostname.slice(0, -".lvh.me".length);
    return sub || null;
  }

  // Production: *.{appDomain}
  if (!hostname.endsWith(`.${appDomain}`)) return null;

  const sub = hostname.slice(0, -(appDomain.length + 1));

  // Reject "www" and multi-level subdomains (e.g. "a.b")
  if (sub === "www" || sub.includes(".") || !sub) return null;

  return sub;
}
