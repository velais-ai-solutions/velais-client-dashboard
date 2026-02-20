import { createHash } from "node:crypto";
import type { Context, Next } from "hono";

interface CacheEntry {
  body: string;
  etag: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_ENTRIES = 500;

function generateEtag(body: string): string {
  return createHash("md5").update(body).digest("hex").slice(0, 16);
}

function evictExpired(ttl: number) {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.timestamp >= ttl) {
      cache.delete(key);
    }
  }
}

export function cacheMiddleware(ttl = DEFAULT_TTL) {
  return async (c: Context, next: Next) => {
    if (c.req.method !== "GET") {
      await next();
      return;
    }

    const tenantSlug =
      (c.get("tenant") as { slug: string } | undefined)?.slug ?? "global";
    const url = new URL(c.req.url);
    const cacheKey = `${tenantSlug}:${url.pathname}:${url.search}`;

    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < ttl) {
      const ifNoneMatch = c.req.header("if-none-match");
      if (ifNoneMatch === cached.etag) {
        c.header("X-Cache", "HIT");
        return c.body(null, 304);
      }

      c.header("X-Cache", "HIT");
      c.header("ETag", cached.etag);
      c.header("Cache-Control", "private, max-age=600");
      return c.json(JSON.parse(cached.body));
    }

    await next();

    if (c.res.status === 200) {
      if (cache.size >= MAX_ENTRIES) {
        evictExpired(ttl);
      }
      if (cache.size >= MAX_ENTRIES) {
        cache.clear();
      }

      const cloned = c.res.clone();
      const body = await cloned.text();
      const etag = generateEtag(body);

      cache.set(cacheKey, { body, etag, timestamp: now });

      c.header("X-Cache", "MISS");
      c.header("ETag", etag);
      c.header("Cache-Control", "private, max-age=600");
    }
  };
}
