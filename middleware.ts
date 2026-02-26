import { extractSubdomain } from "./shared/subdomain.js";
import { validSlugs } from "./shared/tenants.js";

const appDomain = process.env.APP_DOMAIN ?? "dashboard.velais.com";

/**
 * Vercel Routing Middleware — runs before every request on Vercel.
 * Does NOT run in the local Vite dev server.
 *
 * Responsibilities:
 * 1. Block unknown subdomains → 404
 * 2. Serve dynamic robots.txt → Disallow all
 * 3. Pass through valid tenant subdomains, preview URLs, and health endpoints
 */
export default function middleware(
  request: Request,
): Response | undefined {
  const url = new URL(request.url);
  const host = request.headers.get("host") ?? url.host;
  const hostname = host.split(":")[0] ?? "";

  // Development pass-through (shouldn't reach Vercel, but defensive)
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "lvh.me"
  ) {
    return undefined;
  }

  // Vercel preview deployments (*.vercel.app) — pass through
  if (hostname.endsWith(".vercel.app")) {
    return undefined;
  }

  // Health endpoints — always pass through
  if (url.pathname.startsWith("/api/health")) {
    return undefined;
  }

  // Serve dynamic robots.txt — block all crawlers
  if (url.pathname === "/robots.txt") {
    return new Response("User-agent: *\nDisallow: /\n", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  // Validate subdomain against known tenant slugs
  const subdomain = extractSubdomain(host, appDomain);

  if (subdomain && validSlugs.has(subdomain)) {
    // Valid tenant — pass through to the application
    return undefined;
  }

  // Unknown or missing subdomain → 404
  return new Response("Not Found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|assets|fonts|favicon).*)",
  ],
};
